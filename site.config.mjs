export default {
  title: "ctlqwq's blog",
  author: 'rainbow-auto',
  url: 'https://rainbow-auto.github.io',
  base: '', // 项目子目录部署时改成 '/repo-name'；个人主页留空
  language: 'zh-CN',
  description: '关于算法、数学，以及沿途的记录。',
  github: 'https://github.com/rainbow-auto',
  timezone: 'Asia/Shanghai',
  pageSize: 10,
  deploy: {
    remote: 'origin',
    branch: 'master', // 推送此分支后，GitHub Actions 自动发布
  },
  homeIntro: {
    titleLines: ['雲のように', 'そっとそっと'],
    subtitle: 'どこまでもずっとずっと前へ',
    // 换图入口：将图片放入 public/images/home/，然后修改这里的路径。
    image: '/images/home/photo.webp',
    imageAlt: '山林与湖畔',
    imageCaption: '', // 可选的相框说明
    imageAspectRatio: '4 / 5', // 宽 / 高，例如 '3 / 4'、'1 / 1'、'4 / 3'
    imageFit: 'cover', // cover：铺满相框；contain：显示整张图片
    imagePosition: '50% 50%', // 裁剪焦点，例如 '50% 30%'
  },
};
