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

- Node.js：v24.22.1（初始化 Qoder Sites React starter 前，以其 `package.json` 的 engines 为准）。
- 包管理器：计划使用 npm；`site/` 初始化后以 starter 的 lockfile 为准。
- Git 作者：Wei Chen（邮箱通过一次性提交参数提供，不写入仓库文档）。执行环境不允许修改 git config，因此提交时使用一次性 `-c user.name=... -c user.email=...` 参数，不写入本地/全局配置。
- GitHub 远程：<https://github.com/cwdghh/finish-reading>。

## GitHub 推送认证

远程已配置为 HTTPS。本机 `credential.helper=osxkeychain`，但尚未保存 GitHub 凭据；SSH 也没有可用 key。任选一种方式完成一次认证：

1. **HTTPS + PAT**：在本机终端执行 `git push -u origin main`，用户名填 GitHub 用户名，密码填 Personal Access Token（需要仓库 Contents 写权限）。成功后 macOS Keychain 会记住，后续推送不再询问。
2. **GitHub CLI**：安装并登录 `gh`（`brew install gh`、`gh auth login`、`gh auth setup-git`），然后执行推送。
3. **SSH**：生成 SSH key 并添加到 GitHub，再把远程改为 `git@github.com:cwdghh/finish-reading.git`。

不要把 token 写进仓库、`.env` 或对话。认证完成后可让 Agent 继续执行推送，或自己执行 `git push -u origin main`。

## 常用检查

```bash
node --version
npm --version
git status
git remote -v
```

实现阶段会补充并验证本地开发、构建和 Qoder Sites 预览命令；当前项目尚未开始实现，见 [site-format.md](product/site-format.md)。
