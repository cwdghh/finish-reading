# 2026 Qoder 高校创造力大赛参赛项目

Kind: software  
Created: 2026-11-05

## Objective

参加 [2026 Qoder 高校创造力大赛](https://tianchi.aliyun.com/competition/entrance/532536)：用 Qoder 开发一个原创作品，部署到 Qoder Sites 并开放公网访问，在天池赛题页论坛发布符合要求的作品帖。报名与作品提交截止时间为 **2026-11-30 18:00**。

赛道已定为 **LifeHack 生活娱乐**，作品方向为 **“读完”**：一个按心情配公共版权短篇/节选、陪用户按节奏读完一个阅读单元的网站。站点源码放在 `site/`，通过 Qoder Sites 静态部署；目前按个人参赛准备。

## Product

- 工作名：读完
- 赛道：LifeHack 生活娱乐
- 一句话：说出此刻的心情和可用时间，读完按匹配度为你排出 8–10 个公共版权短篇/节选；你选一个，它陪你按节奏读完，并留下一张读完卡片。
- 阅读对象：2–15 分钟的“阅读单元”，不要求读完整本书。
- 仓库格式：[docs/product/site-format.md](docs/product/site-format.md)。
- 产品文档：[docs/product/](docs/product/)
- 当前进度：[STATUS.md](STATUS.md)。

## Live site

公网作品：<https://finish-reading-5ianhlwh00d.qoder.zone/>（无需登录）。

部署通过 Qoder Sites 完成：`webDirectory: "dist"`、`spa: false`、无 Function、无数据库。公网验收记录见 [docs/evidence/06-deploy/2026-11-07-deployment.md](docs/evidence/06-deploy/2026-11-07-deployment.md)。

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

- [site/](site/): Qoder Sites 项目根，作品源码放在这里。
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
- 当前认证、账号与发布状态见 [STATUS.md](STATUS.md)。

## Commands

站点源码在 `site/`，使用 Node + Vite（Qoder Sites React starter）。使用 `package.json` 接受的 Node（`^22.13.0 || >=24.0.0`）；本机使用 Homebrew `node@24` 时先：

```bash
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
```

安装、开发与构建：

```bash
cd site
npm ci
npm run dev
npm run build
```

开发服务器默认在 `http://127.0.0.1:5173/`。网络较慢时先按 [docs/development-environment.md](docs/development-environment.md) 设置代理，代理只影响当前终端。

## Progress

v1 已完成 Qoder Sites 公网部署与验收；v2（四步签到、自由输入、9 个结果、60 个单元、新鲜度与移动端修正）已在本地实现并通过 375/1440 验收，尚未重新部署，论坛作品帖尚未发布。v1 公网验收见 [docs/evidence/06-deploy/2026-11-07-deployment.md](docs/evidence/06-deploy/2026-11-07-deployment.md)，v2 本地验收见 [docs/evidence/07-v2/2026-11-08-v2-local-acceptance.md](docs/evidence/07-v2/2026-11-08-v2-local-acceptance.md)，当前进度与下一步见 [STATUS.md](STATUS.md)。
