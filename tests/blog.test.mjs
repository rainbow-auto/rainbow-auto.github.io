import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { load } from 'cheerio';
import { webcrypto } from 'node:crypto';
import { createMarkdown } from '../src/markdown.mjs';
import { encrypt, decrypt } from '../src/crypto.mjs';
import { base } from '../src/templates.mjs';

test('LaTeX 支持常见与旧站语法，代码保持原样，旁注与重复标题可跳转', async () => {
  const md = await createMarkdown('/notes');
  try {
    const code = 'const char* s = "$x$";\nif (a < b) return 0;\n';
    const sample = '# 同名\n\n# 同名\n\n行内 $x^2$ 与 $ >$、$s_{i - 1} $，以及 \\(a+b\\)。\n\n$$\n\\begin{aligned}a&=b+c\\\\d&=e\\end{aligned}\n$$\n\n> $$\\sum_{i=1}^n i$$\n\n```cpp\n' + code + '```\n\n![本地图](images/example.png)\n\n有注释[^1]。\n\n[^1]: 旁注里也有 $a+b$。\n';
    const rendered = md.render(sample, 'fixture.md');
    const $ = load(rendered.html);
    assert.deepEqual(md.errors, []);
    assert.ok($('.katex').length >= 7);
    assert.equal($('pre code').text(), code);
    assert.equal($('img').attr('src'), '/notes/images/example.png');
    assert.deepEqual(rendered.headings.map(h => h.id), ['同名', '同名-1']);
    assert.equal($('.sidenote').length, 1);
    assert.equal($('.footnotes').length, 0);
    assert.ok(rendered.html.includes('fn1-margin-0'));
  } finally { md.dispose(); }
});

test('密码文章使用真实加密，Web Crypto 可以解密，错误密码不能读取', async () => {
  const payload = { html: '<p>仅能凭密码解密的正文。</p>' }, password = 'a-test-password';
  const bundle = encrypt(payload, password);
  assert.deepEqual(decrypt(bundle, password), payload);
  assert.throws(() => decrypt(bundle, 'wrong-password'));
  assert.ok(!JSON.stringify(bundle).includes(payload.html));
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: Buffer.from(bundle.salt, 'base64'), iterations: bundle.iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(bundle.iv, 'base64') }, key, Buffer.from(bundle.ciphertext, 'base64'));
  assert.deepEqual(JSON.parse(new TextDecoder().decode(plain)), payload);
});

test('所有生成页面的本地链接、图片和资源存在，公式没有渲染错误', async () => {
  const files = (await fs.readdir('dist', { recursive: true })).filter(f => f.endsWith('.html'));
  assert.ok(files.length > 0);
  const failures = [];
  for (const file of files) {
    const $ = load(await fs.readFile(path.join('dist', file), 'utf8'));
    assert.equal($('.math-error').length, 0, `${file} 有公式错误`);
    assert.ok($('title').text());
    assert.equal($('html').attr('lang'), 'zh-CN');
    for (const el of $('[href],[src]').toArray()) {
      const value = $(el).attr('href') || $(el).attr('src');
      if (!value.startsWith('/') || value.startsWith('//')) continue;
      const route = decodeURIComponent(value.split(/[?#]/)[0]).slice(base.length);
      if (!route) continue;
      let destination = path.join('dist', route);
      try { if ((await fs.stat(destination)).isDirectory()) destination = path.join(destination, 'index.html'); await fs.access(destination); }
      catch { failures.push(`${file} → ${value}`); }
    }
  }
  assert.deepEqual(failures, []);
});

test('正式文章全部构建；草稿和加密正文未进入公开索引或 RSS', async () => {
  const index = JSON.parse(await fs.readFile('dist/search-index.json', 'utf8'));
  const published = [];
  for (const file of (await fs.readdir('content/posts')).filter(f => f.endsWith('.md'))) {
    const { data } = matter(await fs.readFile(`content/posts/${file}`, 'utf8'));
    if (!data.draft) published.push(data.title);
  }
  const encrypted = [];
  for (const file of (await fs.readdir('content/encrypted').catch(() => [])).filter(f => f.endsWith('.json'))) {
    encrypted.push(JSON.parse(await fs.readFile(`content/encrypted/${file}`, 'utf8')));
  }
  assert.equal(index.length, published.length + new Set(encrypted.map(p => p.path)).size);
  assert.equal(index.filter(p => p.protected).length, new Set(encrypted.map(p => p.path)).size);
  for (const title of published) assert.ok(index.some(p => p.title === title && !p.protected));
  const feed = await fs.readFile('dist/feed.xml', 'utf8');
  const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
  for (const post of index.filter(p => p.protected)) {
    assert.equal(post.text, '');
    assert.ok(!feed.includes(post.title + '</title>'));
    assert.ok(!sitemap.includes(post.url + '</loc>'));
    const file = path.join('dist', decodeURIComponent(post.url).slice(base.length), 'index.html');
    const $ = load(await fs.readFile(file, 'utf8'));
    assert.equal($('.prose').length, 0);
    assert.ok($('#encrypted-post').text());
    assert.equal($('#unlock-form').length, 1);
    assert.equal($('meta[name=robots]').attr('content'), 'noindex, nofollow');
  }
  const rawIndex = JSON.stringify(index);
  for (const file of await fs.readdir('content/private').catch(() => [])) {
    if (!file.endsWith('.md')) continue;
    let raw;
    try { raw = await fs.readFile(`content/private/${file}`, 'utf8'); } catch { continue; }
    const { data } = matter(raw);
    assert.ok(!rawIndex.includes(String(data.password)));
    assert.ok(!feed.includes(String(data.password)));
    const bundle = JSON.parse(await fs.readFile(`content/encrypted/${file.replace(/\.md$/, '.json')}`, 'utf8'));
    assert.ok(decrypt(bundle.encrypted, data.password).html.includes('prose'));
  }
});
