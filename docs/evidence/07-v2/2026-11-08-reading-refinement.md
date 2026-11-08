# 阅读体验优化与全文链接

日期：2026-11-08  
范围：连续阅读、诗歌默认整首、读完后全文外链  
前置记录：[2026-11-08-v2-local-acceptance.md](2026-11-08-v2-local-acceptance.md)

> 后续已加入当前段落聚焦并扩库到 60 个单元，见 [2026-11-08-focus-and-expansion.md](2026-11-08-focus-and-expansion.md)。本记录中的 53 个单元是当时状态。

## 1. 改动动机

- 原来的散文/小说/古文按段推进，每段都要点一次“读完这段”，长一点的单元会反复点击。
- 原来只有长诗默认整首，短诗默认逐句，同样存在连续点击“下一句”的问题。
- 读完页只有站内“文本来源”抽屉，没有直接去读作品全文的入口。

## 2. 改动内容

### 连续阅读

- 散文/小说/古文默认一次展开全部段落，向下滚动即可读完；段间用一枚小圆点分隔。
- 删除了“读完这段”“整篇读完”两个逐段操作，只在文末保留一个“我读完了”。
- 段落笔记从“每段一个”改为末尾一个可选输入：“用一句话记住这次阅读”，最多 80 字，仍会带入完成页。
- 阅读页顶部提示“正文已展开，按自己的速度向下读”。
- 进度环从“当前段/总段数”改为按页面滚动位置计算；滚动到文末为 100%。
- 用 `ResizeObserver` + `requestAnimationFrame` 重新计算内容高度，避免初次渲染时的高度未稳定导致进度误显示为 100%。

### 诗歌

- 诗词默认“整首”展开；仍保留“逐句”作为可选慢读模式。
- 只有主动切到逐句时，才出现“下一句”；默认状态下只有一个“我读完了”。
- 整首模式进度显示“整首”，逐句模式显示“已显行数/总行数”。

### 读完页全文链接

- 节选单元显示：“读到这里只是节选。去中文维基文库读《作品》全文 ↗”。
- 全文单元显示：“这篇已经是全文。打开《作品》原文 ↗”。
- 链接使用单元的 `sourceUrl`，在新标签页打开，带 `rel="noopener noreferrer"` 和说明性 `aria-label`。
- 桌面与移动端均可见，不依赖“文本来源”抽屉。

## 3. 构建

```text
validate-texts: 53 units
forms: poem=22 prose=11 fiction=7 classical=13
validate-texts: ok
dist/assets/index-DTXstSnL.css   70.04 kB │ gzip: 11.64 kB
dist/assets/index-Cwya_ScL.js   397.26 kB │ gzip: 131.03 kB
✓ built in 142ms
```

完整输出见 [build-output.txt](build-output.txt)。

## 4. 阅读验收

测试文本：《背影》· 车站买橘（散文，节选，3 段）。

| 检查项 | 375×812 | 1440×1000 |
| --- | --- | --- |
| 一次渲染的段落 | 3 段全部展开 | 3 段全部展开 |
| 逐段翻页按钮 | 0 个 | 0 个 |
| 阅读操作 | 仅“我读完了” | 仅“我读完了” |
| 顶部提示 | 正文已展开，按自己的速度向下读 | 同左 |
| 阅读进度 | 顶部 0%，文末 100% | 顶部 0%，文末 100% |
| 笔记 | 末尾一个“用一句话记住这次阅读” | 同左 |
| 控制台错误 | 0 | 0 |
| 横向溢出 | 0 | 0 |

截图：[375-reading-continuous.png](375-reading-continuous.png) · [375-reading-bottom.png](375-reading-bottom.png) · [1440-reading-continuous.png](1440-reading-continuous.png) · [1440-reading-bottom.png](1440-reading-bottom.png)。

诗歌测试：《如梦令》· 常记溪亭日暮。

- 默认“整首”选中，6 行全部展开。
- 页面没有“下一句”按钮，只有“我读完了”。
- 顶部提示“整首已展开，按自己的速度向下读”。
- 截图：[375-reading-poem.png](375-reading-poem.png)。

数据见 [reading-refinement-report.json](reading-refinement-report.json)。

## 5. 全文链接验收

节选《背影》：

```text
读到这里只是节选。去中文维基文库读《背影》全文 ↗
href: https://zh.wikisource.org/wiki/背影
target: _blank
rel: noopener noreferrer
aria: 在中文维基文库打开《背影》全文（新标签页）
```

全文《如梦令》：

```text
这篇已经是全文。打开《如梦令》原文 ↗
href: https://zh.wikisource.org/wiki/如夢令_(李清照)/如夢令_(常記溪亭日暮)
aria: 在中文维基文库打开《如梦令》原文（新标签页）
```

- 375/1440 均可见，无横向溢出。
- 截图：[375-finish-fulltext.png](375-finish-fulltext.png) · [375-finish-fulltext-fullunit.png](375-finish-fulltext-fullunit.png) · [1440-finish-fulltext.png](1440-finish-fulltext.png)。
- 数据见 [reading-refinement-report.json](reading-refinement-report.json) 与 [fullunit-link-report.json](fullunit-link-report.json)。

## 6. 回归检查

- 375/1440 完整流程仍走通：9 个结果、2 很合 + 7 挺合、“换一批”重合 0。
- 完成页初始仍不选读后心情，主按钮禁用；移动端固定栏可见。
- PNG 仍为 1080×1350，181,958 字节。
- 控制台 0 错误，无横向溢出。
- 最终回归数据见 [e2e-report.json](e2e-report.json)。

## 7. 未完成

- 未部署、未发布论坛帖、未提交或 push；公网仍是 v1。
- 逐句模式仍保留“下一句”，但它是用户主动选择的慢读模式，不再是默认路径。
