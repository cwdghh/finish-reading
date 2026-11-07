# 2026 Qoder 高校创造力大赛参赛项目: agent guidance

Workspace home: `/Users/chenwei/Documents/Workspace`.
Usual project location: `/Users/chenwei/Documents/Workspace/projects/qoder-university-creativity-2026`.
Work in the current checkout when using a worktree; use the workspace home only to locate shared guidance, the wiki, and the library.

Read `/Users/chenwei/Documents/Workspace/AGENTS.md` for shared working agreements. Consult relevant sections of `/Users/chenwei/Documents/Workspace/CONVENTIONS.md` when needed. Read the local README and STATUS when starting or resuming substantive project work.

## Scope

用 Qoder 开发并部署一个原创作品，参加 2026 Qoder 高校创造力大赛，完成天池报名、Qoder Sites 公网部署和论坛作品帖发布。

## Specific conventions

- 比赛事实以官方赛题页为准：<https://tianchi.aliyun.com/competition/entrance/532536>。修改规则记录时同时更新核对日期。
- 报名与作品提交截止时间为 2026-11-30 18:00；所有成员须在此前完成天池实名认证和阿里云大学生认证。
- 作品必须原创，并保留用 Qoder 开发和部署的过程证据；不要搬运他人作品。
- 部署必须使用 Qoder Sites 并开放公开访问，原则上不接受本地文件或压缩包。
- 论坛作品帖必须包含：作品链接、自我介绍、作品是什么、为什么做、怎么用（5 步以内）、用 Qoder 做出来的过程，以及所用 Qoder 账号。
- 不把账号密码、API Key、个人证件或未公开的个人信息写入仓库或提交材料。
- 截图和外部素材需确认可公开使用；引用他人内容时注明来源。
- 技术栈为 Vite + React + TypeScript，通过 Qoder Sites 静态部署；站点源码在 `site/`，按 `docs/product/site-format.md` 组织。若后续引入 Python 工具，遵守工作区约定，为本项目建立独立的 `pyproject.toml`、Python 版本 pin、`uv.lock` 和忽略的 `.venv/`。
- 赛道与选题已确定（LifeHack / 读完）；实现与修改以 `docs/product/mvp.md` 和 `docs/product/design.md` 为准，避免为未确定的需求预建架构。
- `.qoder.site` 由 Qoder Sites 工具生成，不手写、不提交；`dist/`、`node_modules/`、`.env*` 同样不提交。
- 站点修改后必须本地启动，并在浏览器实际走通“签到 → 配文 → 选文 → 阅读 → 读完卡片”；至少验证 375px 与 1440px，不以类型检查代替交互验证。
- Git 提交使用一次性 `-c user.name=... -c user.email=...` 参数，不修改本地/全局 git config；不要把邮箱或账号信息写入仓库文档。

## Commands

站点源码位于 `site/`，使用 Node + Vite（Qoder Sites React starter，Node `^22.13.0 || >=24.0.0`）。常用命令：

```bash
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
cd site
npm ci
npm run dev
npm run build
```

开发服务器默认 `http://127.0.0.1:5173/`；构建输出 `site/dist/`。发布使用 `webDirectory: "dist"`、`spa: false`。验收记录见 `docs/evidence/2026-11-07-local-acceptance.md`；网络较慢时先按 `docs/development-environment.md` 设置代理。

## Network

- 访问 GitHub、Project Gutenberg、Wikisource 等较慢时，参考 `docs/development-environment.md` 的代理设置。
- 代理只影响当前 shell，不写入 `.env` 或仓库；桌面端/浏览器需单独配置。

## Records and shared knowledge

- 代码、部署说明、过程截图和提交材料保存在本项目内。
- 在 [STATUS.md](STATUS.md) 记录里程碑、决策、障碍和下一步；README 只保留目的与导航。
- 报名确认、公网 URL、论坛帖 URL 和提交截图属于关键证据，应在 STATUS 或 `docs/` 中记录。
- 比赛规则若产生可复用知识，可在工作区 wiki 中另建页面，并链接回本项目与官方来源。
