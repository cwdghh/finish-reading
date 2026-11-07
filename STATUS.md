# 2026 Qoder 高校创造力大赛参赛项目: status

Updated: 2026-11-07

## Current objective

用 Qoder 开发一个原创的 LifeHack 阅读网站“读完”，部署到 Qoder Sites 并公开访问，完成天池报名与论坛作品帖发布。

## State

赛道和产品方向已确定：LifeHack 生活娱乐，“读完”——按心情匹配公共版权短阅读单元、陪用户按节奏读完的阅读网站。产品概念、公版来源、Qoder Sites 仓库格式与 MVP 范围已写入 `docs/product/`。站点源码将放在 `site/`；尚未开始实现，尚未报名/认证，尚无公网 URL。Git 首次提交已完成（`3d27e6e`），`origin` 已指向 `cwdghh/finish-reading`；远程仓库当前无分支，尚未推送。

## Latest evidence

- 2026-11-07 核对官方赛题页：报名与提交截止 2026-11-30 18:00，当前约 2533 支队伍；每赛道初筛 14 支进决赛，共 42 支。
- 2026-11-07 扫描天池论坛前 17 页、近 200 个作品帖：AI 学习助手、论文工具、适老/无障碍、互动游戏等方向密集；纯阅读体验类作品较少，确定“读完”方向。
- 2026-11-07 调研公版来源：中文维基文库（CC BY-SA 4.0/原文公版）、chinese-poetry（MIT）、Project Gutenberg 中文藏书、国家图书馆中华古籍资源库；ctext.org 明确禁止抓取/转载，只用于核对。
- 2026-11-07 已核对鲁迅《秋夜》维基文库页面，带 `{{Pd/1996|1936}}` 公版模板；可作为现代公版文本的样板。
- 2026-11-07 阅读对象改为 2–15 分钟的“阅读单元”，不要求读完整本书。
- 2026-11-07 Git 首次提交 `3d27e6e`；`origin` 指向 <https://github.com/cwdghh/finish-reading>；远程当前无分支。

## Current outputs

- `docs/product/README.md`：产品文档索引与当前决策。
- `docs/product/concept.md`：产品概念、用户、问题、阅读单元、差异化、非目标。
- `docs/product/content-plan.md`：18 个公共版权阅读单元候选、元数据与版权规则。
- `docs/product/public-domain-sources.md`：公版书来源、许可与核验流程。
- `docs/product/site-format.md`：Qoder Sites 仓库格式、`.qoder.site` 生成规则与发布边界。
- `docs/product/mvp.md`：MVP 范围、页面、匹配规则、验收标准与里程碑。
- `docs/development-environment.md`：代理、Node 环境与 Git 远程说明。
- `docs/evidence/README.md`：Qoder 过程证据规范。
- `site/README.md`：Qoder Sites 项目根占位说明。
- `submission/forum-post.md`：论坛帖草稿（方向、一句话、为什么做和 5 步用法已更新）。
- 尚无应用源代码或已部署作品。

## Decisions

- 参加 LifeHack 生活娱乐赛道。
- 作品工作名“读完”：心情签到 → 配文 → 选文 → 读一个单元 → 读完卡片。
- 匹配、阅读和卡片的对象是 2–15 分钟的“阅读单元”，不是整本书。
- 文本只使用中国 + 美国双公版内容；优先 1929 年前发表或古典文本。
- 不做 AI 摘要/问答；MVP 纯前端、无账号、无后端。
- 首批 18 个单元，6 个优先：秋夜、背影、荷塘月色、定风波、月下独酌、咏雪。
- 站点源码根目录为 `site/`，按 Qoder Sites 静态站点格式组织；`.qoder.site` 由工具生成，不手写、不提交。
- 技术栈计划 Vite + React + TypeScript（以 Qoder Sites React starter 为准）。
- Git 作者身份使用 Wei Chen（邮箱通过一次性提交参数提供，不写入仓库文档）；远程 `origin` 指向 GitHub `cwdghh/finish-reading`。执行环境不允许修改 git config，提交时使用一次性 `-c` 参数。

## Open questions

- 产品名是否保留“读完”。
- 心情卡/需求卡文案与数量。
- 18 个单元的名单、节选范围与体裁比例。
- 是否加入读后心情签到与分享卡片（建议加入）。
- 是否把“阅读印章”作为签名交互。
- 团队成员与分工（目前按个人参赛准备）。
- Qoder 账号与 Qoder Sites 可用性。
- 报名/实名认证/阿里云大学生认证状态。
- 是否现在推送到 GitHub 远程（推送需用户确认）。

## Next step

1. 确认产品文档、首批文本与心情卡文案；需要时调整。
2. 经确认后推送到 GitHub；远程仓库当前为空，推送前需确认凭据。
3. 完成天池报名、实名认证、阿里云大学生认证，领取 Qoder CN 权益。
4. 按 `docs/product/mvp.md` 的里程碑开始实现（下一阶段，不在本轮）。
