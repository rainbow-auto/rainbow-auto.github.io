import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import config from '../site.config.mjs';
const watch = process.argv.includes('--watch');
const port = Number(process.env.PORT || 4321);
const base = (process.env.BLOG_BASE ?? config.base).replace(/\/$/, '');
const root = path.resolve('dist');
const clients = new Set();
let building = false, pending = false;
async function build() {
  if (building) { pending = true; return; }
  building = true;
  const child = spawn(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
  const code = await new Promise(resolve => child.on('exit', resolve));
  building = false;
  if (code !== 0) console.error('构建遇到问题，请查看上方提示。');
  else for (const client of clients) client.write('data: reload\n\n');
  if (pending) { pending = false; await build(); }
}
if (watch || !fs.existsSync(root)) await build();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end('Bad request'); return; }
  if (watch && pathname === `${base}/__reload`) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    clients.add(res); req.on('close', () => clients.delete(res)); return;
  }
  if (base && pathname !== base && !pathname.startsWith(`${base}/`)) { res.writeHead(404); res.end('Not found'); return; }
  pathname = pathname.slice(base.length) || '/';
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const stat = await fsp.stat(file);
    if (stat.isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: `${base}${pathname}/` }); res.end(); return; }
      file = path.join(file, 'index.html');
    }
    let content = await fsp.readFile(file);
    if (watch && file.endsWith('.html')) content = Buffer.from(content.toString().replace('</body>', `<script>new EventSource(${JSON.stringify(`${base}/__reload`)}).onmessage=()=>location.reload()</script></body>`));
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    try { res.end(await fsp.readFile(path.join(root, '404.html'))); } catch { res.end('Not found'); }
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}${base}/`));
if (watch) {
  let debounce;
  for (const directory of ['content', 'public', 'src', 'scripts']) fs.watch(directory, { recursive: true }, (_, file) => {
    if (directory === 'content' && file?.startsWith('encrypted/')) return;
    clearTimeout(debounce); debounce = setTimeout(build, 150);
  });
  fs.watch('site.config.mjs', () => { clearTimeout(debounce); debounce = setTimeout(build, 150); });
}
process.on('SIGINT', () => { server.close(); process.exit(); });
