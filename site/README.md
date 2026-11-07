# 读完 · 站点源码

“读完”是一个按心情匹配公共版权短阅读单元、陪用户读完并生成 4:5 读完卡片的单页应用。纯前端，无账号、无后端、无外部 API；阅读记录只存在浏览器 `localStorage`。

## 技术栈

- Vite 8 + React 19 + TypeScript
- Qoder Sites React starter
- 静态构建，`spa: false`
- 纸张、墨色、朱红印章由 CSS 与 SVG 实现，不使用外部图片

## 本地开发

Node 版本要求见 `package.json`（`^22.13.0 || >=24.0.0`）。本机使用 Homebrew `node@24` 时：

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm ci
npm run dev
```

开发地址为 Vite 输出的 `http://127.0.0.1:5173/`。

生产构建：

```sh
npm run build
npm run preview
```

构建先执行 `tsc --noEmit`，静态文件输出到 `dist/`。

## 目录

```text
src/
  App.tsx                 单页状态机：签到 / 结果 / 阅读 / 读完 / 历史
  components/             页面与卡片、印章、来源抽屉
  data/moods.ts           心情、需求、时间、体裁、印章、内容提示
  data/texts.json         18 个公共版权阅读单元
  lib/match.ts            加权匹配、内容硬过滤、最近阅读排除、多样性惩罚
  lib/textStats.ts        自由输入相似度与摘句提取
  lib/exportCard.ts       1080×1350 Canvas 卡片导出
  lib/storage.ts          localStorage 历史与偏好
  globals.css             纸墨视觉系统与响应式
public/favicon.svg        朱红“读”字印章图标
```

## 匹配

固定权重：需求 0.25、情绪 0.20、自由输入 0.15、时间 0.15、体裁 0.10、效价/唤醒 0.10、难度 0.05。时间与体裁是偏好而非硬筛选；内容提示是硬过滤。卡片正面只显示“很合 / 挺合 / 可以看看”，分数在匹配详情中。

## 发布

通过 Qoder Sites 发布：

- `webDirectory: "dist"`
- `spa: false`
- 不需要 Function

`.qoder.site` 由 Qoder Sites 工具生成，不提交。`dist/`、`node_modules/`、`.env*` 同样不提交。

## 文本与许可

正文来自中文维基文库的公版文本；维基文库转录部分为 CC BY-SA 4.0，页面内“文本来源”抽屉列出来源链接、作者卒年、公版范围与核对日期。应用内的推荐理由、摘句与注释为项目原创。`vendor/` 与 `PROVENANCE.md` 保留 starter 依赖与样式来源说明。
