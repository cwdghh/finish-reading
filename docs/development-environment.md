# 本地开发与网络

更新：2026-11-07

## 代理（可选，仅本机）

访问 GitHub、Project Gutenberg、Wikisource、维基媒体等网站较慢或失败时，可以在当前终端先执行：

```bash
export http_proxy=http://127.0.0.1:10808
export https_proxy=http://127.0.0.1:10808
export all_proxy=socks5://127.0.0.1:10808

export HTTP_PROXY=http://127.0.0.1:10808
export HTTPS_PROXY=http://127.0.0.1:10808
export ALL_PROXY=socks5://127.0.0.1:10808
```

说明：

- 只影响当前 shell；新开终端需要重新执行。
- `git`、`curl`、`npm` 等命令行工具通常会读取 `HTTP_PROXY` / `HTTPS_PROXY`；如果某个工具不认，使用它自己的代理参数。
- 不要把这组变量写入 `.env`、源码或提交到仓库；代理端口变化时在本机终端调整即可。
- 代理监听在 `127.0.0.1`，不包含账号密码；但它仍是本机环境信息，不要当作通用配置强加给其他环境。
- Qoder 桌面端、Sites 工作台和内置浏览器的网络设置不一定继承 shell 变量；如果桌面端也慢，需要在系统代理或 Qoder 设置中配置。

## 当前环境

- Node.js：v24.22.1（`site/package.json` engines 为 `^22.13.0 || >=24.0.0`）。Homebrew 路径为 `/opt/homebrew/opt/node@24/bin`，当前 shell 可用 `export PATH="/opt/homebrew/opt/node@24/bin:$PATH"`。
- 包管理器：npm；依赖与 lockfile 位于 `site/`。
- 本地开发地址：`http://127.0.0.1:5173/`（Vite 默认端口）。
- Git 作者：Wei Chen（邮箱通过一次性提交参数提供，不写入仓库文档）。执行环境不允许修改 git config，因此提交时使用一次性 `-c user.name=... -c user.email=...` 参数，不写入本地/全局配置。
- GitHub 远程：`git@github.com:cwdghh/finish-reading.git`（SSH）。
- 2026-11-07 SSH 认证成功，`main` 已推送并跟踪 `origin/main`。

## GitHub 推送认证

远程已切换为 SSH，本机 key 已添加到 GitHub，推送验证通过。后续正常执行：

```bash
git push
```

如果换机器或 key 失效，需要重新配置 SSH key，或改用 GitHub CLI / HTTPS PAT。不要把 token 写进仓库、`.env` 或对话。

## 常用检查

```bash
node --version
npm --version
git status
git remote -v
```

## 本地开发与构建

```bash
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
cd site
npm ci
npm run dev
```

生产构建：

```bash
cd site
npm run build
npm run preview
```

`npm run build` 先执行 `tsc --noEmit`，再由 Vite 输出静态文件到 `site/dist/`。Qoder Sites 发布使用 `webDirectory: "dist"`、`spa: false`。

## 浏览器验收

本地实现完成后，使用 Chrome 在 375×812 与 1440×1000 实际走通“签到 → 配文 → 选文 → 阅读 → 读完卡片 → 处方笺”。记录与截图见 [evidence/2026-11-07-local-acceptance.md](evidence/2026-11-07-local-acceptance.md)。
