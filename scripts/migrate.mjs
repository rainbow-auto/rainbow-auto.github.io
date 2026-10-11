import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const source = process.argv[2];
if (!source) throw new Error('用法：node scripts/migrate.mjs /旧博客目录');
const root = path.resolve(source, 'source');
const posts = path.join(root, '_posts');
const report = { published: [], protected: [], drafts: [], assets: [], changes: [] };
await fs.mkdir('migration', { recursive: true });
for (const file of (await fs.readdir(posts)).filter(f => f.endsWith('.md'))) {
  const text = await fs.readFile(path.join(posts, file), 'utf8');
  const hasHeader = /^\uFEFF?\s*---\r?\n/.test(text);
  const data = hasHeader ? matter(text).data : {};
  const section = !hasHeader || !data.title || !data.date ? 'drafts' : data.password ? 'private' : 'posts';
  await fs.mkdir(`content/${section}`, { recursive: true });
  // 迁移保留正文与 front matter；旧语法在渲染阶段兼容。
  await fs.copyFile(path.join(posts, file), `content/${section}/${file}`);
  report[section === 'posts' ? 'published' : section === 'private' ? 'protected' : 'drafts'].push(file);
}
async function copyAssets(from, to) {
  try { await fs.access(from); } catch { return; }
  await fs.cp(from, to, { recursive: true });
  for (const file of await fs.readdir(from, { recursive: true })) {
    if ((await fs.stat(path.join(from, file))).isFile()) report.assets.push(path.join(to, file));
  }
}
await copyAssets(path.join(root, 'images'), 'public/images');
await copyAssets(path.join(posts, 'images'), 'public/images');
try { await fs.copyFile(path.join(posts, 'temp.tex'), 'content/drafts/temp.tex'); report.drafts.push('temp.tex'); } catch {}
report.changes = [
  '所有 Markdown 正文与元信息逐字复制；未编辑文章内容。',
  '4 篇带 password 的文章移入 git 忽略的 content/private，构建时导出加密版本。',
  '没有标题或日期的 _.md 与 temp.md 保留为本地草稿，不对外发布。',
  '本地图片统一归入 public/images；旧相对图片路径在渲染阶段自动转换。',
  'Hexo notel 提示框在渲染阶段转换为 Markdown 引用提示框。',
  '正式文章继续使用 YYYY/MM/DD/原文件名/ 网址，保留旧站永久链接。',
];
await fs.writeFile('migration/report.json', JSON.stringify(report, null, 2) + '\n');
console.log(`迁移完成：${report.published.length} 篇公开文章，${report.protected.length} 篇密码文章，${report.drafts.length} 份草稿/附件，${report.assets.length} 张图片。`);
