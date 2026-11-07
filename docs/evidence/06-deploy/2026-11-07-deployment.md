# Qoder Sites 部署与公网验收

日期：2026-11-07 22:33

公网地址：<https://finish-reading-5ianhlwh00d.qoder.zone/>

访问范围：公开（无需登录）

发布配置：`webDirectory: "dist"`、`spa: false`、无 Function、无数据库

## 发布

- Qoder Sites 设计工作台已用页面“/ · 读完 · 心情签到与短阅读”和五项设计能力（appearance / radius / spacing / typography / motion）初始化。
- `npm run build` 通过，静态输出为 `dist/index.html`、CSS、JS 与 `favicon.svg`。
- 通过 `prepare_site` 生成不可变草稿，`publish_site` 发布成功，随后把访问策略从 private 改为 public。
- `.读完.qoder.site` 由 Qoder Sites 工具生成，已加入 `site/.gitignore`，不提交。

## 公网验收

在无痕上下文访问公网地址，分别在 1440×1000 与 375×812 实际走通：

1. 首页显示“此刻，你更接近哪一种？”。
2. 选择“累但不想睡”、自由输入、15 分钟、散文。
3. 结果页显示“为你排了 18 个”，3 张大卡 + 7 条紧凑列表。
4. 打开《秋夜》全文，分段阅读。
5. 读到末尾，选择“更松了”，填写留言，盖“被安慰”“平静”印章。
6. 下载 1080×1350 PNG（174,922 字节）；保存到处方笺。
7. 回到首页打开处方笺，公网历史中有 1 张卡片。

结果：

- 页面标题：`读完 · 按心情配一个读得完的短篇`
- 公网访问：HTTP 200，未登录可打开
- 控制台错误：0
- HTTP 4xx/5xx：0
- 横向溢出：1440 与 375 的所有检查页均为 `scrollWidth === clientWidth`
- 375px 首页、结果、阅读、读完、历史均无横向滚动

## 截图

- [公网首页 1440](2026-11-07-2233-public-home-1440.png)
- [公网结果 1440](2026-11-07-2233-public-results-1440.png)
- [公网阅读 1440](2026-11-07-2233-public-reading-1440.png)
- [公网读完卡片 1440](2026-11-07-2233-public-finish-1440.png)
- [公网导出的 4:5 PNG](2026-11-07-2233-public-card-1080x1350.png)
- [公网处方笺 1440](2026-11-07-2233-public-history-1440.png)
- [公网首页 375](2026-11-07-2233-public-home-375.png)
- [公网结果 375](2026-11-07-2233-public-results-375.png)
- [公网阅读 375](2026-11-07-2233-public-reading-375.png)
- [公网读完 375](2026-11-07-2233-public-finish-375.png)

## 说明

- 页面右下角的“Made with Qoder”标记由 Qoder Sites 平台注入，不是站点源码的一部分。
- 公网版本使用与本地验收相同的 `dist` 构建；公网验收只覆盖静态前端与 localStorage 流程。
