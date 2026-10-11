import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import mathPlugin from './math-plugin.mjs';
import katex from 'katex';
import { createHighlighter } from 'shiki';
import { load } from 'cheerio';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const urlPath = p => p.split('/').map(encodeURIComponent).join('/');
export const assetUrl = (base, p) => `${base}${p.startsWith('/') ? p : `/${p}`}`;

export async function createMarkdown(base = '') {
  const highlighter = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['cpp', 'c', 'python', 'javascript', 'typescript', 'bash', 'json', 'yaml', 'markdown', 'latex', 'html', 'css', 'java', 'rust'] });
  const errors = [];
  let source = '';
  const engine = {
    renderToString(tex, options) {
      try {
        // 旧 Hexo 文章在公式内部用 \(、\[ 表示普通括号。
        tex = tex.replace(/\\([()[\]])/g, '$1');
        return katex.renderToString(tex, { ...options, throwOnError: true, strict: 'ignore', trust: false, macros: { '\\bmod': '\\operatorname{mod}', '\\var': '\\operatorname{var}' } });
      } catch (e) {
        errors.push({ file: source, formula: tex, error: e.message });
        return `<span class="math-error" title="${escapeHtml(e.message)}">${escapeHtml(tex)}</span>`;
      }
    },
  };
  const md = new MarkdownIt({ html: true, linkify: true, typographer: false })
    .use(footnote)
    .use(mathPlugin, engine);
  md.renderer.rules.fence = (tokens, i) => {
    const token = tokens[i];
    const lang = token.info.trim().split(/\s+/)[0] || 'text';
    const aliases = { cplusplus: 'cpp', 'c++': 'cpp', py: 'python', sh: 'bash' };
    const resolved = aliases[lang] || lang;
    const html = highlighter.getLoadedLanguages().includes(resolved)
      ? highlighter.codeToHtml(token.content, { lang: resolved, themes: { light: 'github-light', dark: 'github-dark' } })
      : `<pre><code>${escapeHtml(token.content)}</code></pre>`;
    return `<figure class="code-block"><figcaption><span>${escapeHtml(lang)}</span><button type="button" class="copy-code" aria-label="复制代码">复制</button></figcaption>${html}</figure>`;
  };
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    let src = token.attrGet('src');
    if (src?.startsWith('images/')) src = `/${src}`;
    if (src?.startsWith('/')) src = `${base}${src}`;
    token.attrSet('src', src);
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    return defaultImage(tokens, idx, options, env, self);
  };
  function render(text, filename = '') {
    source = filename;
    // 仅兼容旧 Hexo 提示框，不触碰代码块里的同名文本。
    const pieces = text.split(/(^```[^\n]*\n[\s\S]*?^```\s*$|^~~~[^\n]*\n[\s\S]*?^~~~\s*$)/m);
    text = pieces.map((piece, i) => i % 2 ? piece : piece.replace(/\{%\s*notel\s+\w+\s+(.+?)\s*%\}([\s\S]*?)\{%\s*endnotel\s*%\}/g, (_, title, body) => `\n> **${title}**\n>\n${body.trim().split('\n').map(l => `> ${l}`).join('\n')}\n`)).join('');
    const $ = load(md.render(text), null, false);
    const seen = new Map();
    const headings = [];
    $('h1,h2,h3,h4,h5,h6').each((_, el) => {
      const label = $(el).text().trim();
      const key = label.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-') || 'section';
      const n = seen.get(key) || 0;
      seen.set(key, n + 1);
      const id = n ? `${key}-${n}` : key;
      $(el).attr('id', id);
      $(el).append(`<a class="heading-anchor" href="#${encodeURIComponent(id)}" aria-label="链接到此节">§</a>`);
      if (Number(el.tagName.slice(1)) <= 3) headings.push({ title: label, id, level: Number(el.tagName.slice(1)) });
    });
    // 标准 Markdown 脚注在桌面端成为 Tufte 旁注，窄屏点击引用可展开。
    $('.footnote-item').each((_, el) => {
      const id = $(el).attr('id');
      const refs = $(`.footnote-ref a[href="#${id}"]`);
      const note = $(el).clone();
      note.find('.footnote-backref').remove();
      const html = note.html().replace(/<p>/g, '<span>').replace(/<\/p>/g, '</span>');
      refs.each((i, ref) => {
        const marginId = `${id}-margin-${i}`;
        $(ref).attr('href', `#${marginId}`).attr('aria-controls', marginId).attr('aria-expanded', 'false');
        $(ref).parent().after(`<span class="sidenote" id="${marginId}"><span class="sidenote-number">${escapeHtml($(ref).text())}</span> ${html}</span>`);
      });
    });
    $('.footnotes,.footnotes-sep').remove();
    $('table').each((_, el) => $(el).wrap('<div class="table-scroll"></div>'));
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href.startsWith('/') && !href.startsWith('//') && base && !href.startsWith(`${base}/`)) $(el).attr('href', base + href);
      if (/^https?:/.test(href)) $(el).attr('rel', 'noopener noreferrer');
    });
    const summaryNode = $('p').filter((_, el) => !$(el).closest('.code-block,.sidenote').length && $(el).text().trim()).first().clone();
    summaryNode.find('.sidenote,.footnote-ref,.katex-display').remove();
    summaryNode.find('.katex').each((_, el) => $(el).replaceWith($(el).find('.katex-html').text()));
    const summary = summaryNode.text().replace(/\s+/g, ' ').trim().slice(0, 130);
    const plain = $.root().clone();
    plain.find('.katex').each((_, el) => $(el).replaceWith($(el).find('annotation').text()));
    plain.find('.katex-html,.sidenote,.copy-code,.heading-anchor').remove();
    const plainText = plain.text().replace(/\s+/g, ' ').trim();
    return { html: $.html(), headings, plainText, summary };
  }
  return { render, errors, dispose: () => highlighter.dispose() };
}
