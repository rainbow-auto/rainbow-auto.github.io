# Rainbow-Automaton’s Blog

一个可直接部署的 Markdown + LaTeX 静态博客。延续 Tufted 的纸张底色、衬线字体、正文与旁注双栏排版，支持深浅色主题、目录、代码高亮与复制、归档、标签、分类、全文搜索、RSS 和打印。

字体与正文排版直接沿用目标主题：原版 Tufte CSS 1.8.0、Tufted 原始样式和 ET Book 字体均已本地打包。正文为 19.6px / 30.8px，采用两端对齐；二、三级标题分别为 32.2px、28px，并使用原主题的粗体。中文使用原主题相同的字体回退链，不额外替换为其他中文字体。具体来源与校验见 `docs/typography.md`。

## 本地使用

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

打开 http://localhost:4321 。保存文章后自动重新构建并刷新。

```sh
npm run new -- "新文章标题"
npm run new -- "待完成的文章" --draft
npm run check     # 构建并检查公式、链接、图片和加密输出
npm run preview   # 预览已有 dist
```

## 写文章

文章放在 `content/posts/`，只需要普通 Markdown；不需要 Typst、MDX 或组件语法。

```markdown
---
title: "文章标题"
date: 2026-10-11
updated: 2026-10-12   # 可选
tags: [OI, 数学]
categories: [算法]
description: "一句简短摘要"  # 可选，默认从正文生成
---

行内公式 $f(x)=x^2$。

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

一个值得补充的地方[^1]。

[^1]: 这条标准 Markdown 脚注会显示在桌面端的页边；手机上点击编号展开。

![图片说明](/images/example.png)
```

也支持 `\(...\)`、`\[...\]`、多行 `aligned`/`align`、矩阵、分段函数和代码围栏。KaTeX 在构建时生成 HTML 与 MathML，字体随站点发布，无需外部公式 CDN。长公式、表格和代码块在窄屏上单独横向滚动。

图片放在 `public/images/`；相对路径 `images/...` 也兼容旧站。网站设置位于 `site.config.mjs`，可修改标题、介绍、作者、站点地址和部署子目录。

日期加文件名默认组成网址：`/2026/10/11/新文章标题/`。需要自定网址时，在元信息里设置 `permalink: /notes/my-post/`。旧文章文件名与原永久链接保留。

## 草稿与密码文章

- `content/drafts/` 不参与构建，也不会被 Git 提交。完成后添加 `title`、`date` 并移入 `content/posts/`。
- 密码文章放在 `content/private/`，保留元信息中的 `password`。这个目录同样被 Git 忽略。
- 本地运行 `npm run build` 会将密码文章导出为 `content/encrypted/*.json`。这些加密文件可以提交，GitHub Actions 无需访问原文或密码也能生成解锁页。**改密码或改正文后，要在本地重新构建并提交更新的加密文件。**
- 公开页面、搜索索引、RSS 和站点地图不含密码文章正文或密码；标题、日期和标签会显示在文章列表里。浏览器使用 PBKDF2-SHA256（310,000 次）与 AES-256-GCM 在本地解密，不发送密码，不保存密码。
- 删除密码文章时，同步删除它在 `content/encrypted/` 中的导出文件。请另行备份本地私密原文和草稿；Git 不包含这些文件。

静态密码保护允许下载密文并尝试猜测密码，适合个人博客，建议使用足够长的密码。私密文章的远程图片仍由原图床提供。

## 部署

已经生成可以直接上传的 `dist/`。所有部署平台只需要静态文件，不需要后端、数据库或运行中的 Node 服务。

### GitHub Pages（原博客地址）

1. 将这个目录的文件提交到 `rainbow-auto/rainbow-auto.github.io` 的 `main` 或 `master` 分支；发布前在本地运行 `npm run check`，将 `content/encrypted/` 一并提交。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 随附 `.github/workflows/deploy.yml` 会安装依赖、构建、验证并部署 `dist/`。访问 https://rainbow-auto.github.io 。

`site.config.mjs` 已使用旧站地址。个人主页部署不需要改 `base`。部署到项目仓库子目录时，Actions 会自动传入 Pages 的 `base_path`；本地可用 `BLOG_BASE=/repo-name npm run check` 测试。自定义域名时修改 `url`，并根据 GitHub Pages 的域名设置添加 `public/CNAME`。

### Cloudflare Pages / Netlify / Vercel

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：22+
- 修改 `site.config.mjs` 中的 `url` 为实际地址。
- Netlify 和 Vercel 的配置文件已随附。Cloudflare Pages 选择不使用框架的静态项目即可。

也可以把 `dist/` 的内容直接放入任意静态服务器的站点根目录。

## 迁移记录

来自 `/Users/ctlqwq/Documents/OI/Notes/Pages` 的旧 Hexo 博客：

- 19 篇公开文章，4 篇密码文章；保持原标题、日期、标签、分类与正文。
- `_.md`、`temp.md` 与 `temp.tex` 归入本地草稿。
- 3 张本地图片完整复制；外部图床链接保留。
- 保留 `/YYYY/MM/DD/原文件名/` 文章地址、`/archives/`、`/tags/` 与 `/categories/`。
- 兼容旧 `notel` 提示框、带空白的行内公式和公式中的转义括号。
- 详细清单见 `migration/report.json`。迁移脚本只复制内容，不修改原博客；旧目录保持原样。

## 目录

```text
content/posts/       正式文章（Markdown）
content/private/     密码文章原文（本地保存、Git 忽略）
content/encrypted/   可部署的加密文章导出
content/drafts/      本地草稿与附件（Git 忽略）
content/about.md     关于页面
public/              图片、图标和主题资源
src/                 Markdown 渲染、加密、页面模板
scripts/             构建、预览、新文章、迁移
tests/               公式与迁移验证
site.config.mjs      网站设置
dist/                可以直接部署的构建产物
```

## 许可与致谢

设计参考 [Yousa-Mirage/Tufted-Blog-Template](https://github.com/Yousa-Mirage/Tufted-Blog-Template)，使用其 MIT 许可的主题配色，原许可保存在 `licenses/Tufted-Blog-Template.txt`。新增主题和构建代码见 `LICENSE`。文章内容版权归原作者所有。
