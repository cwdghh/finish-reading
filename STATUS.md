# 2026 Qoder 高校创造力大赛参赛项目: status

Updated: 2026-11-07

## Current objective

用 Qoder 开发一个原创的 LifeHack 阅读网站“读完”，部署到 Qoder Sites 并公开访问，完成天池报名与论坛作品帖发布。

## State

赛道和产品方向已确定：LifeHack 生活娱乐，“读完”——按心情匹配公共版权短阅读单元、陪用户按节奏读完的阅读网站。产品概念、公版来源、Qoder Sites 仓库格式、MVP 范围与初步设计计划已写入 `docs/product/`。站点源码将放在 `site/`；尚未开始实现，尚未报名/认证，尚无公网 URL。Git `main` 已通过 SSH 推送到 `cwdghh/finish-reading`，最新本地/远程提交为 `00d7bdb`。

## Latest evidence

- 2026-11-07 核对官方赛题页：报名与提交截止 2026-11-30 18:00，当前约 2533 支队伍；每赛道初筛 14 支进决赛，共 42 支。
- 2026-11-07 扫描天池论坛前 17 页、近 200 个作品帖：AI 学习助手、论文工具、适老/无障碍、互动游戏等方向密集；纯阅读体验类作品较少，确定“读完”方向。
- 2026-11-07 调研公版来源：中文维基文库（CC BY-SA 4.0/原文公版）、chinese-poetry（MIT）、Project Gutenberg 中文藏书、国家图书馆中华古籍资源库；ctext.org 明确禁止抓取/转载，只用于核对。
- 2026-11-07 已核对鲁迅《秋夜》维基文库页面，带 `{{Pd/1996|1936}}` 公版模板；可作为现代公版文本的样板。
- 2026-11-07 阅读对象改为 2–15 分钟的“阅读单元”，不要求读完整本书。
- 2026-11-07 Git 首次提交 `3d27e6e`；`origin` 指向 <https://github.com/cwdghh/finish-reading>；远程当前无分支。
- 2026-11-07 用户确认：仅中国公版可接受、结果按匹配度排 10+、印章改为预设计样式、同意推送 GitHub。
- 2026-11-07 推送尝试：HTTPS 无凭据，SSH 无 key；随后切换到 SSH 远程，用户添加 key 后认证成功，`main` 已推送。
- 2026-11-07 初步设计计划写入 `docs/product/design.md`（讨论稿）：视觉方向、页面流程、匹配排序、印章系统、技术映射与讨论点。

## Current outputs

- `docs/product/README.md`：产品文档索引与当前决策。
- `docs/product/concept.md`：产品概念、用户、问题、阅读单元、差异化、非目标。
- `docs/product/content-plan.md`：18 个公共版权阅读单元候选、元数据与版权规则。
- `docs/product/public-domain-sources.md`：公版书来源、许可与核验流程。
- `docs/product/site-format.md`：Qoder Sites 仓库格式、`.qoder.site` 生成规则与发布边界。
- `docs/product/mvp.md`：MVP 范围、页面、匹配规则、验收标准与里程碑。
- `docs/product/design.md`：视觉、页面、交互、印章系统与技术映射（讨论稿）。
- `docs/development-environment.md`：代理、Node 环境与 Git 远程说明。
- `docs/evidence/README.md`：Qoder 过程证据规范。
- `site/README.md`：Qoder Sites 项目根占位说明。
- `submission/forum-post.md`：论坛帖草稿（方向、一句话、为什么做和 5 步用法已更新）。
- 尚无应用源代码或已部署作品。

## Decisions

- 参加 LifeHack 生活娱乐赛道。
- 作品工作名“读完”：心情签到 → 配文 → 选文 → 读一个单元 → 读完卡片。
- 匹配、阅读和卡片的对象是 2–15 分钟的“阅读单元”，不是整本书。
- 结果按综合匹配度降序，至少 10 个；前 3 个标“最匹配”，其余可继续浏览。
- 文本以中国公版为底线，优先中国 + 美国双公版；允许标注后的仅中国公版补充。首批 18 个单元全部双公版。
- 不做 AI 摘要/问答；MVP 纯前端、无账号、无后端。
- 读完卡片使用预设计印章（1–3 枚），不做网页手写签名。
- 首批 18 个单元，6 个优先：秋夜、背影、荷塘月色、定风波、月下独酌、咏雪。
- 站点源码根目录为 `site/`，按 Qoder Sites 静态站点格式组织；`.qoder.site` 由工具生成，不手写、不提交。
- 技术栈计划 Vite + React + TypeScript（以 Qoder Sites React starter 为准）。
- Git 作者身份使用 Wei Chen（邮箱通过一次性提交参数提供，不写入仓库文档）；远程 `origin` 指向 GitHub `cwdghh/finish-reading`。执行环境不允许修改 git config，提交时使用一次性 `-c` 参数。

## Open questions

- 产品名是否保留“读完”。
- 心情卡/需求卡文案与数量。
- 18 个单元的名单、节选范围与体裁比例。
- 是否加入读后心情签到与分享卡片（建议加入）。
- 首页是否直接进入心情签到（建议是）。
- 结果卡用“很合 / 挺合 / 可以看看”还是显示匹配分数。
- 印章只在读完时选，还是每个检查点也能盖。
- 分享卡片用竖版 4:5 还是横版 3:2。
- 单页状态机还是加路由/查询参数。
- 默认展示 10 个结果是否合适，还是展示全部 18 个。
- 团队成员与分工（目前按个人参赛准备）。
- Qoder 账号与 Qoder Sites 可用性。
- 报名/实名认证/阿里云大学生认证状态。

## Next step

1. 和用户确认 `design.md` 里的关键设计选择（首页、匹配展示、印章时机、分享卡、状态机、默认结果数）。
2. 确认后更新 `design.md` / `mvp.md`，按里程碑开始实现。
3. 完成天池报名、实名认证、阿里云大学生认证，领取 Qoder CN 权益。
4. 实现前保留 Qoder 过程证据，按 `docs/evidence/README.md` 归档。
