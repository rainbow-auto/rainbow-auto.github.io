# 首页与相框换图

首页使用纸张背景和左右分栏，沿用 Tufted 字体与留白。左侧显示两行日文标题「雲のように / そっとそっと」及副文案「どこまでもずっとずっと前へ」，右侧显示相框图片。相框下面保留文章数量与归档入口。手机上图片会移至文案下方。

## 更换图片

有两种方式：

1. **不改配置**：用新的 WebP 图片替换 `public/images/home/photo.webp`，文件名保持不变。
2. **使用其他文件名或格式**：将 JPG、PNG、WebP、SVG 等图片放进 `public/images/home/`，在 `site.config.mjs` 中修改 `homeIntro.image`，例如：

```js
homeIntro: {
  titleLines: ['雲のように', 'そっとそっと'],
  subtitle: 'どこまでもずっとずっと前へ',
  image: '/images/home/my-photo.jpg',
  imageAlt: '我的照片',
  imageCaption: '旅行中的一个瞬间',
  imageAspectRatio: '4 / 5',
  imageFit: 'cover',
  imagePosition: '50% 50%',
},
```

路径从 `/images/` 开始，对应项目的 `public/images/`；不要把 `public` 写进路径。也可以使用完整的 HTTPS 图片地址。默认图片沿用旧博客的山林图，已经复制为独立的 `photo.webp`，可以随时替换。

## 调整显示

- `titleLines`：每个数组元素显示为一行标题。
- `subtitle`：标题下面的副文案。
- `imageAlt`：图片的文字描述，供屏幕阅读器使用。
- `imageCaption`：相框说明；设为 `''` 时不显示。
- `imageAspectRatio`：相框内图片的宽高比；默认 `'4 / 5'`，可改为 `'1 / 1'`、`'3 / 4'` 或 `'4 / 3'`。
- `imageFit`：`'cover'` 铺满画面、允许裁剪；`'contain'` 显示完整图片。
- `imagePosition`：裁剪焦点；默认居中 `'50% 50%'`。人物靠上时可使用 `'50% 30%'`。

修改后运行 `npm run build` 更新 `dist/`，或运行 `npm run dev` 查看变化。相框样式在 `public/assets/home.css`，仅在首页加载。

## 验证

已验证桌面左右分栏、390px 手机端相框下移、图片加载与无横向溢出。临时部署副本中更换了含空格的图片文件名，并设置横向比例、完整显示、裁剪焦点和说明文字，均正确生成。根目录构建及 `/blog` 子目录构建检查通过。
