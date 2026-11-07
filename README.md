# 2026 Qoder 高校创造力大赛参赛项目

Kind: software  
Created: 2026-11-05

## Objective

参加 [2026 Qoder 高校创造力大赛](https://tianchi.aliyun.com/competition/entrance/532536)：用 Qoder 开发一个原创作品，部署到 Qoder Sites 并开放公网访问，在天池赛题页论坛发布符合要求的作品帖。报名与作品提交截止时间为 **2026-11-30 18:00**。

赛道已定为 **LifeHack 生活娱乐**，作品方向为 **“读完”**：一个按心情配公共版权短篇/节选、陪用户按节奏读完一个阅读单元的网站。站点源码将放在 `site/`，通过 Qoder Sites 静态部署；团队成员与账号信息待确认。

## Product

- 工作名：读完
- 赛道：LifeHack 生活娱乐
- 一句话：说出此刻的心情和可用时间，读完为你配 3 篇公共版权短篇/节选；你选一篇，它陪你按节奏读完，并留下一张读完卡片。
- 阅读对象：2–15 分钟的“阅读单元”，不要求读完整本书。
- 仓库格式：[docs/product/site-format.md](docs/product/site-format.md)。
- 产品文档：[docs/product/](docs/product/)
- 状态：概念与 MVP 范围定义中，尚未开始实现。

## Intended deliverables

- 一个可公网访问的 Qoder Sites 作品，链接可被评委直接打开。
- 天池论坛作品帖，包含作品链接和规定的五个介绍部分；草稿见 [submission/forum-post.md](submission/forum-post.md)。
- 用 Qoder 开发与部署的过程证据（截图、关键迭代记录），规范见 [docs/evidence/README.md](docs/evidence/README.md)。
- 项目源代码与可复现的部署说明。
- 报名、实名认证、阿里云大学生认证的记录。
- 1–3 人组队时的成员与分工说明。
- 可选：小红书、抖音、视频号或 X 的分享链接。

## Competition at a glance

- 主办方：Qoder；赞助方：NVIDIA。
- 参赛对象：全国在校大学生（本科生、硕博研究生，含港澳台），不限专业。
- 三个赛道分别评分、分别设奖：**StudyHack 学习科研**、**LifeHack 生活娱乐**、**Hack4Good 技术向善**。
- 参赛形式：1–3 人组队；提交份数不限，但每个团队限获一项现金奖项。
- 核心要求：作品必须原创，开发与部署均由 Qoder 完成，并通过 Qoder Sites 公网访问。
- 资格要求：所有成员须在初赛截止前完成天池平台实名认证和阿里云大学生认证。

完整规则、时间线与奖项见 [docs/competition.md](docs/competition.md)；报名与提交步骤见 [docs/registration-checklist.md](docs/registration-checklist.md)。

## Folder map

- [site/](site/): Qoder Sites 项目根，作品源码将放在这里。当前仅占位说明，尚未开始实现。
- [docs/](docs/): 比赛资料、报名清单、部署与提交记录。
- [docs/product/](docs/product/): 产品概念、公版来源、Qoder Sites 仓库格式与 MVP 范围。
- [docs/evidence/](docs/evidence/): Qoder 开发与部署过程证据。
- [docs/development-environment.md](docs/development-environment.md): 本地环境、代理与 Git 远程说明。
- [submission/](submission/): 天池论坛作品帖草稿及提交素材。
- [AGENTS.md](AGENTS.md): 本项目的稳定工作约定。
- [STATUS.md](STATUS.md): 当前进度、决策与下一步。

## Inputs and context

- 比赛主页：<https://tianchi.aliyun.com/competition/entrance/532536>（页面信息核对于 2026-11-07）。
- 学生权益领取入口：<https://university.aliyun.com/action/qoder>。
- GitHub 仓库：<https://github.com/cwdghh/finish-reading>（源码与备份；部署仍走 Qoder Sites）。
- 尚缺：团队成员、Qoder 账号、报名/认证记录、Qoder Sites 发布验证。

## Commands

站点源码将位于 `site/`，计划使用 Node + Vite（Qoder Sites React starter）。实现时验证并补充实际命令，预计包括 `npm ci`、`npm run dev`、`npm run build`。网络较慢时先按 [docs/development-environment.md](docs/development-environment.md) 设置代理。

## Progress

当前进度、已有产出和下一步见 [STATUS.md](STATUS.md)。
