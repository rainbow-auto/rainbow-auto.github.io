import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { createMarkdown, escapeHtml as e, urlPath } from '../src/markdown.mjs';
import { encrypt } from '../src/crypto.mjs';
import config from '../site.config.mjs';
import { layout, home, articleBody, archive, base, link, absolute, toc } from '../src/templates.mjs';

const output = path.resolve('dist');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.cp('public', output, { recursive: true });
await fs.cp('licenses', path.join(output, 'assets/licenses'), { recursive: true });
await fs.cp('node_modules/katex/dist', path.join(output, 'assets/katex'), { recursive: true, filter: src => !src.endsWith('.js') && !src.endsWith('.mjs') });
const markdown = await createMarkdown(base);
const posts = [];
const knownPaths = new Set();
export function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) throw new Error(`无效文章日期：${value}`);
  const date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (isNaN(parsed) || parsed.toISOString().slice(0,10) !== date) throw new Error(`无效文章日期：${value}`);
  return date;
}
const list = value => value == null ? [] : Array.isArray(value) ? [...new Set(value.flat(Infinity).filter(Boolean).map(String))] : [String(value)];
function metadata(data, file, rendered, locked = false) {
  if (!data.title || !data.date) throw new Error(`${file} 缺少 title 或 date；草稿请放 content/drafts。`);
  const date = normalizeDate(data.date);
  const slug = data.slug || file.replace(/\.md$/, '');
  const route = data.permalink || `/${date.replaceAll('-', '/')}/${slug}/`;
  if (!route.startsWith('/') || /[?#]|\.\.|\\/.test(route) || route.includes('//')) throw new Error(`${file} 的 permalink 无效。`);
  const excerpt = locked ? '这篇记录设有密码，输入密码后即可阅读。' : String(data.description || rendered.summary || rendered.plainText.slice(0, 130));
  return { title: String(data.title), date, updated: data.updated ? normalizeDate(data.updated) : null, tags: list(data.tags), categories: list(data.categories), path: route.endsWith('/') ? route : `${route}/`, excerpt, minutes: Math.max(1, Math.ceil(rendered.plainText.length / 500)), protected: locked };
}
async function files(directory, suffix) {
  try { return (await fs.readdir(directory)).filter(f => f.endsWith(suffix)).sort(); } catch { return []; }
}
for (const directory of ['content/posts', 'content/private']) {
  for (const file of await files(directory, '.md')) {
    const { data, content } = matter(await fs.readFile(`${directory}/${file}`, 'utf8'));
    if (data.draft) continue;
    const locked = Boolean(data.password);
    if (directory === 'content/private' && !locked) throw new Error(`${file} 位于 private 却没有 password；为防误发布已停止构建。`);
    if (directory === 'content/posts' && locked) throw new Error(`${file} 带有 password，请移入 content/private 防止提交明文。`);
    const rendered = markdown.render(content, file);
    const post = metadata(data, file, rendered, locked);
    if (locked) {
      post.encrypted = encrypt({ base, html: `<div class="article-margin">${toc(rendered.headings)}</div><div class="prose reading-column">${rendered.html}</div>` }, data.password);
      await fs.mkdir('content/encrypted', { recursive: true });
      await fs.writeFile(`content/encrypted/${file.replace(/\.md$/, '.json')}`, JSON.stringify(post) + '\n');
    }
    posts.push({ ...post, rendered: locked ? null : rendered });
  }
}
for (const file of await files('content/encrypted', '.json')) {
  const bundle = JSON.parse(await fs.readFile(`content/encrypted/${file}`, 'utf8'));
  if (!posts.some(p => p.path === bundle.path)) posts.push({ ...bundle, rendered: null });
}
posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN'));
async function write(route, content) {
  if (knownPaths.has(route)) throw new Error(`重复路由：${route}`);
  knownPaths.add(route);
  const dest = path.join(output, route, route.endsWith('/') ? 'index.html' : '');
  if (!dest.startsWith(output + path.sep)) throw new Error('输出路径越界');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, content);
}
for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  await write(post.path, layout({ title: post.title, description: post.excerpt, path: post.path, type: 'article', date: post.date, noindex: post.protected, body: articleBody(post, post.rendered, { previous: posts[i + 1], next: posts[i - 1] }) }));
}
const pages = Math.max(1, Math.ceil(posts.length / config.pageSize));
for (let page = 1; page <= pages; page++) {
  const route = page === 1 ? '/' : `/page/${page}/`;
  await write(route, layout({ title: config.title, path: route, nav: 'home', body: home(posts, page) }));
}
await write('/archives/', layout({ title: '归档', path: '/archives/', nav: 'archives', body: archive(posts) }));
for (const [field, label, english] of [['tags', '标签', 'TOPICS'], ['categories', '分类', 'CATEGORIES']]) {
  const groups = new Map();
  for (const post of posts) for (const item of post[field]) groups.set(item, [...(groups.get(item) || []), post]);
  const sorted = [...groups].sort((a, b) => b[1].length - a[1].length);
  await write(`/${field}/`, layout({ title: label, path: `/${field}/`, nav: 'tags', body: `<header class="page-heading"><p class="eyebrow">${english}</p><h1>${label}</h1><p>沿着一个主题，继续读下去。</p></header><div class="tag-index">${sorted.map(([tag, items]) => `<a href="${link(`/${field}/${tag}/`)}"><span>${e(tag)}</span><small>${items.length.toString().padStart(2, '0')}</small></a>`).join('')}</div><p class="muted"><a href="${link(field === 'tags' ? '/categories/' : '/tags/')}">${field === 'tags' ? '按分类浏览' : '按标签浏览'} →</a></p>` }));
  for (const [tag, items] of sorted) await write(`/${field}/${tag}/`, layout({ title: `${label}：${tag}`, path: `/${field}/${tag}/`, nav: 'tags', body: archive(items, tag, `${label} · ${items.length} 篇记录`) }));
}
const aboutText = await fs.readFile('content/about.md', 'utf8');
await write('/about/', layout({ title: '关于', path: '/about/', nav: 'about', body: `<header class="page-heading"><p class="eyebrow">ABOUT THIS NOTEBOOK</p><h1>关于</h1></header><div class="prose reading-column">${markdown.render(matter(aboutText).content, 'about.md').html}</div>` }));
await write('/search/', layout({ title: '搜索', path: '/search/', noindex: true, body: `<header class="page-heading"><p class="eyebrow">FIND A NOTE</p><h1>搜索</h1><p>寻找一个题目、一段推导，或某次记录。</p></header><div class="search-page"><form id="search-form" role="search"><label class="sr-only" for="search-input">搜索文章</label><input id="search-input" type="search" placeholder="输入标题、关键词或标签…" autocomplete="off"><button type="submit">搜索 →</button></form><p id="search-status" class="muted" aria-live="polite">输入关键词开始搜索。</p><div id="search-results"></div><noscript>搜索需要开启 JavaScript；也可以访问归档浏览所有文章。</noscript></div>` }));
await write('/404.html', layout({ title: '没有找到这页', path: '/404.html', noindex: true, body: `<header class="page-heading"><p class="eyebrow">404 · A MISSING PAGE</p><h1>这页还没有写下。</h1><p>也许链接已经改变，也许只是走错了一条路。</p><a href="${link('/')}">回到首页 →</a></header>` }));
const search = posts.map(({ title, date, path, tags, categories, excerpt, protected: locked, rendered }) => ({ title, date, url: link(path), tags, categories, excerpt, protected: locked, text: locked ? '' : rendered.plainText }));
await write('/search-index.json', JSON.stringify(search));
const publicPosts = posts.filter(p => !p.protected);
await write('/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${e(config.title)}</title><link>${e(absolute('/'))}</link><description>${e(config.description)}</description><language>${config.language}</language><atom:link href="${e(absolute('/feed.xml'))}" rel="self" type="application/rss+xml"/>${publicPosts.map(p => `<item><title>${e(p.title)}</title><link>${e(absolute(p.path))}</link><guid isPermaLink="true">${e(absolute(p.path))}</guid><pubDate>${new Date(p.date + 'T00:00:00+08:00').toUTCString()}</pubDate><description>${e(p.excerpt)}</description>${p.tags.map(t => `<category>${e(t)}</category>`).join('')}</item>`).join('')}</channel></rss>`);
await write('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...knownPaths].filter(p => p.endsWith('/') && p !== '/search/' && !posts.some(post => post.protected && post.path === p)).map(p => `<url><loc>${e(absolute(p))}</loc></url>`).join('')}</urlset>`);
await write('/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml')}\n`);
await write('/.nojekyll', '');
await fs.mkdir('migration', { recursive: true });
await fs.writeFile('migration/math-report.json', JSON.stringify(markdown.errors, null, 2) + '\n');
markdown.dispose();
console.log(`已构建 ${posts.length} 篇文章、${knownPaths.size} 个页面/索引，输出 dist/。`);
if (markdown.errors.length) { console.error(`发现 ${markdown.errors.length} 个公式问题，见 migration/math-report.json。`); process.exitCode = 1; }
