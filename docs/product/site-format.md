# Qoder Sites 仓库格式

状态：已确定，等待实现  
更新：2026-11-07  
依据：Qoder Sites `sites-building` 技能、Qoder environment 与 Static output 参考

## 结论

- 仓库是“文档 + 站点”的单仓库：
  - `site/`：Qoder Sites 项目根，唯一站点源码。
  - `docs/`：比赛与产品文档。
  - `submission/`：论坛帖。
- 站点是静态站点：不使用后端、数据库或账号；文本与笔记在浏览器本地。
- 站点显示名“读完”；包名/仓库名 `finish-reading`。
- Qoder Sites 发布 `site/dist/` 的静态产物；GitHub 仓库用于源码与备份，不承担部署。

## 目录

```text
finish-reading/
├── site/                  # Qoder Sites 项目根
│   ├── src/               # React 源码（待初始化）
│   ├── public/            # 静态资源（待初始化）
│   ├── dist/              # 生产构建产物（忽略）
│   ├── package.json       # 待初始化
│   └── .qoder.site        # 由 Qoder Sites 工具生成，不手写、不提交
├── docs/
│   ├── product/
│   └── evidence/
├── submission/
└── README.md / STATUS.md / AGENTS.md
```

## 初始化方式

- 使用 Qoder Sites 自带的 React starter 初始化 `site/`：
  `node "<sites-building-skill-root>/scripts/create-site.mjs" "<repo>/site"`
  实际路径在实现时用已安装插件目录确认；初始化前确保 `site/` 为空（当前只有 README）。
- 初始化后执行 `npm ci`，用 `npm run dev` 本地预览，`npm run build` 生成 `site/dist/`。
- 以上命令尚未在本项目验证；实现时以 starter 的 `package.json` 为准。

## `.qoder.site` 与设计工作台

- 不手写 `.qoder.site`，也不提交它；它由 `open_design_workbench` / `prepare_site` 生成。
- 在 Desktop 上初始化：
  - `projectPath`: `site`
  - `name`: `读完`
  - `design.version`: 1
  - `design.pages`: 首页、心情签到、配文结果、阅读、读完卡片、文本来源（以实际路由/状态为准）
  - `design.capabilities`: `appearance`, `radius`, `spacing`, `typography`, `motion`
- 样式必须消费 `--site-*` 变量（`--site-bg`、`--site-fg`、`--site-accent`、`--site-surface`、`--site-muted`、`--site-border`、`--site-font`、`--site-radius`、`--site-space`、`--site-type`、`--site-motion`），并提供与“纸张/墨色”设计一致的默认值。
- 页面与能力以实际实现为准；不要用空的 capabilities 列表。

## 发布

- 使用 Qoder Sites 的 `prepare_site` / `publish_site`（通过 `sites-hosting` 技能）发布。
- `prepare_site` 的 `projectRoot` 为 `site`，`webDirectory` 为 `dist`；`spa` 取决于最终路由：
  - 当前设计倾向单页状态切换、无深链接：`spa: false`。
  - 若后续改为 React Router 等深链接：`spa: true`，并验证刷新/直达。
- 不手写 `sites.json`、ZIP 或外层 manifest；打包产物由工具生成。
- 发布后验证公网 URL 在无痕窗口可打开；站点默认公开访问。

## 边界

- `site/` 只放站点源码与资源；比赛文档、截图、论坛帖放 `docs/` 和 `submission/`。
- 不提交 `node_modules/`、`dist/`、`.env*`、`*.qoder.site`、`.qoder/`。
- 无 Functions/数据库/账号；如果未来需要共享数据，再按 Sites 的 Function 规范单独设计。
- 站点不依赖外部 API；公共文本与元数据随构建打包。
