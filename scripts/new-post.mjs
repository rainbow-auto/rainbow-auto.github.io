import fs from 'node:fs/promises';
const title = process.argv[2];
if (!title) { console.error('用法：npm run new -- "文章标题" [--draft]'); process.exit(1); }
const directory = process.argv.includes('--draft') ? 'content/drafts' : 'content/posts';
const filename = title.replace(/[\\/:*?"<>|]/g, '-').replace(/^\.+/, '') || 'untitled';
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
await fs.mkdir(directory, { recursive: true });
const file = `${directory}/${filename}.md`;
await fs.writeFile(file, `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\ntags: []\ncategories: []\ndescription: ""\n---\n\n`, { flag: 'wx' });
console.log(`已创建 ${file}`);
