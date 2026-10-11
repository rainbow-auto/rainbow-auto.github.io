# 与目标主题一致的字体与正文排版

目标：[Yousa-Mirage/Tufted-Blog-Template](https://github.com/Yousa-Mirage/Tufted-Blog-Template)，实际示例：[tufted-blog.pages.dev](https://tufted-blog.pages.dev/)。核对日期：2026-10-11。

## 原始资源

- `public/assets/vendor/tufte-css-1.8.0/tufte.css`：目标模板实际引用的 Tufte CSS 1.8.0，未改写。
- `public/assets/vendor/tufte-css-1.8.0/et-book/`：同版本 ET Book 的常规、斜体、粗体与 old-style 数字字体，保留原文件；包含 WOFF、TTF、EOT 和 SVG。
- `public/assets/vendor/tufted.css`：直接复制目标示例站点的 CSS，与参考仓库版本逐字一致。
- `public/assets/tufted-theme.css`：目标主题的深浅色配色。
- `public/assets/typography.css`：将原主题针对 Typst `section` 的排版适配到 Markdown `.prose` 容器；字体与字号等值保持相同，保留博客已有导航和内容布局。

所有字体都随静态文件发布，不依赖访问外部字体 CDN。字体及 CSS 的原始许可放在 `licenses/`，构建时也会复制到 `dist/assets/licenses/`。

## 字体

正文字体链与目标原文一致：

```css
font-family: et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif;
```

ET Book 提供西文字符。目标主题没有指定独立的中文网页字体；中文由浏览器按同一字体链回退到系统衬线字体。本项目保持这一行为，移除了原先额外指定的 Iowan、思源宋体、Songti 字体链和抗锯齿覆盖设置。

代码字体也使用原主题的链：`Consolas, "Liberation Mono", Menlo, Courier, monospace`。

## 浏览器实际值对照

在同一浏览器中读取参考站点和博客的生效样式进行核对，而非仅比较 CSS 声明。

| 属性 | 目标主题 | 本博客 |
| --- | --- | --- |
| 根字号 | 14px（10.5pt） | 14px |
| 正文字号 | 19.6px（1.4rem） | 19.6px |
| 正文行高 | 30.8px（2.2rem） | 30.8px |
| 正文字重 | 400 | 400 |
| 段落上下边距 | 19.6px | 19.6px |
| 正文对齐 | justify | justify |
| h2 字号 / 行高 | 32.2px / 38.64px | 32.2px / 38.64px |
| h2 字重 / 上下边距 | 700 / 28px、14px | 700 / 28px、14px |
| h3 字号 / 行高 | 28px / 33.6px | 28px / 33.6px |
| h3 字重 / 上下边距 | 700 / 21px、11.2px | 700 / 21px、11.2px |
| 标题字距 | normal | normal |
| 行内代码字号 | 16.8px（1.2rem） | 16.8px |

手机端继续沿用相同的正文和标题设置，调整的仅是内容栏与旁注的布局。数学公式继续由 KaTeX 排版，使用数学字体；文章内容未改动。
