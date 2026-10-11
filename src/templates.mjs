import config from '../site.config.mjs';
import { escapeHtml as e, urlPath } from './markdown.mjs';
export const base = (process.env.BLOG_BASE ?? config.base).replace(/\/$/, '');
export const link = p => `${base}${urlPath(p)}`;
export const absolute = p => `${config.url.replace(/\/$/, '')}${link(p)}`;
export const dateLabel = date => date.slice(0, 10).replaceAll('-', '.');
export const tagLink = tag => link(`/tags/${tag}/`);
export const categoryLink = tag => link(`/categories/${tag}/`);
export const tagList = tags => tags.map(t => `<a href="${tagLink(t)}">${e(t)}</a>`).join('<span class="tag-separator"> / </span>');
const icons = {
  moon: '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
};
export function layout({ title, description = config.description, path = '/', nav = '', body, noindex = false, type = 'website', date }) {
  const pageTitle = path === '/' ? config.title : `${title} · ${config.title}`;
  const navigation = [['/', '首页', 'home'], ['/archives/', '归档', 'archives'], ['/tags/', '标签', 'tags'], ['/about/', '关于', 'about']];
  const homepage = path === '/';
  const navigationLinks = navigation.map(([href, text, id]) => `<a href="${link(href)}" ${nav === id ? 'aria-current="page"' : ''}>${text}</a>`).join('');
  const searchButton = `<a class="icon-button" href="${link('/search/')}" aria-label="搜索文章">${icons.search}</a>`;
  const themeButton = `<button class="icon-button" id="theme-toggle" aria-label="切换深浅色主题" type="button">${icons.moon}</button>`;
  const header = `<header class="site-header"><a class="brand" href="${link('/')}">Rainbow-Automaton<span>算法 · 数学 · 随笔</span></a><nav aria-label="主导航">${navigationLinks}${searchButton}${themeButton}</nav></header>`;
  return `<!doctype html>
<html lang="${config.language}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(pageTitle)}</title><meta name="description" content="${e(description)}"><meta name="author" content="${e(config.author)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${e(absolute(path))}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="${type}"><meta property="og:url" content="${e(absolute(path))}"><meta property="og:site_name" content="${e(config.title)}">${date ? `<meta property="article:published_time" content="${e(date)}">` : ''}
<meta name="theme-color" content="#fffff8"><link rel="icon" href="${link('/favicon.svg')}" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${e(config.title)}" href="${link('/feed.xml')}">
<script>try{const t=localStorage.getItem('blog-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch{document.documentElement.dataset.theme='light'}</script>
<link rel="preload" href="${link('/assets/vendor/tufte-css-1.8.0/et-book/et-book-roman-line-figures/et-book-roman-line-figures.woff')}" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${link('/assets/vendor/tufte-css-1.8.0/tufte.css')}"><link rel="stylesheet" href="${link('/assets/vendor/tufted.css')}"><link rel="stylesheet" href="${link('/assets/tufted-theme.css')}"><link rel="stylesheet" href="${link('/assets/katex/katex.min.css')}"><link rel="stylesheet" href="${link('/assets/style.css')}"><link rel="stylesheet" href="${link('/assets/typography.css')}"><script src="${link('/assets/app.js')}" defer></script>
${homepage ? `<link rel="stylesheet" href="${link('/assets/home.css')}">` : ''}
</head><body data-base="${e(base)}" ${homepage ? 'class="homepage"' : ''}><a class="skip-link" href="#main">跳到正文</a>
${header}
<main id="main">${body}</main>
<footer class="site-footer"><span>© ${new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: config.timezone }).format(new Date())} <a href="${e(config.github)}">${e(config.author)}</a></span><span><a href="${link('/feed.xml')}">RSS</a><span class="footer-dot">·</span>Inspired by <a href="https://github.com/Yousa-Mirage/Tufted-Blog-Template">Tufted</a></span></footer>
<a class="back-top" href="#" aria-label="回到顶部">↑</a></body></html>`;
}
export function postCard(post, compact = false) {
  return `<article class="post-item ${compact ? 'compact' : ''}"><div class="post-date"><time datetime="${e(post.date)}">${dateLabel(post.date)}</time></div><div class="post-item-body"><h${compact ? '3' : '2'}><a href="${link(post.path)}">${e(post.title)}</a>${post.protected ? '<span class="lock" aria-label="密码保护"> ♧ <span>加密</span></span>' : ''}</h${compact ? '3' : '2'}>${compact ? '' : `<p class="post-excerpt">${e(post.excerpt)}</p>`}<div class="post-meta">${tagList(post.tags)}${!compact ? `<span class="reading-time">${post.minutes} 分钟阅读</span>` : ''}</div></div></article>`;
}
export function toc(headings) {
  if (!headings.length) return '';
  return `<details class="toc" open><summary>此页目录</summary><nav aria-label="文章目录"><ol>${headings.map(h => `<li class="depth-${h.level}"><a href="#${encodeURIComponent(h.id)}">${e(h.title)}</a></li>`).join('')}</ol></nav></details>`;
}
export function articleBody(post, rendered, neighbors = {}) {
  const metadata = `<time datetime="${e(post.date)}">${dateLabel(post.date)}</time><span>·</span><span>${post.minutes} 分钟阅读</span>${post.updated ? `<span>· 更新于 ${dateLabel(post.updated)}</span>` : ''}`;
  return `<article class="article-page"><header class="article-header"><a class="eyebrow" href="${link('/archives/')}">← 所有文章</a><h1>${e(post.title)}</h1><div class="article-meta">${metadata}</div><div class="article-tags">${tagList(post.tags)}</div></header>
  ${post.protected ? `<div class="reading-column locked-shell"><p class="eyebrow">PRIVATE NOTE</p><h2>这是一篇加密文章</h2><p>输入原文章密码，继续阅读。</p><form id="unlock-form"><label for="post-password">文章密码</label><div class="unlock-row"><input id="post-password" type="password" autocomplete="off" required><button type="submit">解锁文章 →</button></div><p id="unlock-status" class="muted" aria-live="polite"></p></form></div><script id="encrypted-post" type="application/json">${JSON.stringify(post.encrypted).replaceAll('<', '\\u003c')}</script><div id="unlocked-post" hidden></div>` : `<div class="article-margin">${toc(rendered.headings)}</div><div class="prose reading-column">${rendered.html}</div>`}
  <div class="post-end reading-column"><span>— 本文完 —</span><a href="${link('/archives/')}">返回归档</a></div><nav class="post-pagination" aria-label="相邻文章">${neighbors.previous ? `<a href="${link(neighbors.previous.path)}"><small>较早一篇</small>${e(neighbors.previous.title)} ←</a>` : '<span></span>'}${neighbors.next ? `<a href="${link(neighbors.next.path)}"><small>较新一篇</small>${e(neighbors.next.title)} →</a>` : ''}</nav></article>`;
}
export function home(posts, page = 1) {
  const count = Math.ceil(posts.length / config.pageSize);
  const selected = posts.slice((page - 1) * config.pageSize, page * config.pageSize);
  const intro = config.homeIntro;
  const photoUrl = /^https?:\/\//.test(intro.image) ? intro.image : link(intro.image.startsWith('/') ? intro.image : '/' + intro.image);
  const photoFit = intro.imageFit === 'contain' ? 'contain' : 'cover';
  const opening = page === 1 ? `<section class="home-intro home-intro-with-photo" aria-labelledby="intro-title"><div class="reading-column"><p class="eyebrow">RAINBOW’S NOTEBOOK <span> / SINCE 2022</span></p><h1 id="intro-title" lang="ja">${intro.titleLines.map(e).join('<br>')}</h1><p class="intro-description" lang="ja">${e(intro.subtitle)}</p></div><aside class="intro-margin home-photo"><figure class="home-photo-frame" style="--photo-ratio:${e(intro.imageAspectRatio)};--photo-fit:${photoFit};--photo-position:${e(intro.imagePosition)}"><img class="home-photo-image" src="${e(photoUrl)}" alt="${e(intro.imageAlt)}" decoding="async" fetchpriority="high">${intro.imageCaption ? `<figcaption>${e(intro.imageCaption)}</figcaption>` : ''}</figure><div class="home-photo-meta"><span class="muted">${posts.length} 篇文章 · 2022—${posts[0]?.date.slice(0,4) || '2026'}</span><a href="${link('/archives/')}">翻阅全部记录 ↗</a></div></aside></section>` : `<header class="page-heading"><p class="eyebrow">RAINBOW’S NOTEBOOK</p><h1>全部记录</h1></header>`;
  return `${opening}<section class="post-list" id="recent-posts"><div class="section-label"><span>${page === 1 ? '最近的记录' : `记录 · 第 ${page} 页`}</span><span class="muted">按时间倒序</span></div>${selected.map(p => postCard(p)).join('')}<nav class="list-pagination" aria-label="文章列表分页">${page > 1 ? `<a href="${link(page === 2 ? '/' : `/page/${page - 1}/`)}">← 上一页</a>` : '<span></span>'}<span>${page} / ${count}</span>${page < count ? `<a href="${link(`/page/${page + 1}/`)}">下一页 →</a>` : '<span></span>'}</nav></section>`;
}
export function archive(posts, title = '归档', subtitle = `${posts.length} 篇记录，按年份收好。`) {
  const groups = Map.groupBy(posts, p => p.date.slice(0, 4));
  return `<header class="page-heading"><p class="eyebrow">THE COLLECTION</p><h1>${e(title)}</h1><p>${e(subtitle)}</p></header><div class="archive-list">${[...groups].map(([year, items]) => `<section class="archive-year"><h2>${year}<small>${items.length} 篇</small></h2><div>${items.map(p => postCard(p, true)).join('')}</div></section>`).join('')}</div>`;
}
