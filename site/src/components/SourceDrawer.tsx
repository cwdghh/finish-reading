import { useEffect, useRef } from "react";
import { FORM_LABELS, unitKindLabel, unitSubtitle } from "../data/moods";
import { TEXTS } from "../data/texts";
import { CloseIcon } from "./icons";

interface SourceDrawerProps {
  onClose: () => void;
}

export function SourceDrawer({ onClose }: SourceDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="source-overlay" role="presentation" onClick={onClose}>
      <section
        className="source-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="source-head">
          <div>
            <p className="kicker">版权页 / {TEXTS.length} 个单元</p>
            <h1 id="source-title">文本来源</h1>
          </div>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </header>

        <div className="source-intro">
          <p>
            这里的每一个阅读单元都来自公共版权文本。原文已进入公有领域；转录参考中文维基文库，按
            CC BY-SA 4.0 使用。本站对异体字、标点做了简体规范化，并自行撰写了推荐语与短注。
          </p>
          <p>
            标注“中国 + 美国公版”的文本，作者逝世已超过 50 年，且首次发表年份在 1930 年及以前。
            如发现文本差异，以来源页为准。
          </p>
        </div>

        <ol className="source-list">
          {TEXTS.map((unit, index) => (
            <li key={unit.id} className="source-item">
              <span className="source-item__number">{String(index + 1).padStart(2, "0")}</span>
              <div className="source-item__main">
                <h2>
                  《{unit.workTitle}》
                  {unitSubtitle(unit) && <span>· {unitSubtitle(unit)}</span>}
                </h2>
                <p className="source-item__meta">
                  {unit.author}（卒于 {unit.authorDeathYear}） · {FORM_LABELS[unit.form]} ·{" "}
                  {unitKindLabel(unit)} · {unit.readingMinutes} 分钟
                </p>
                <p className="source-item__meta">
                  {unit.publicationYear < 1900 ? "约 " : ""}
                  {unit.publicationYear} 年 · 核对于 {unit.checkedAt}
                </p>
                <p className="source-item__license">
                  {unit.license} · 来源：
                  <a href={unit.sourceUrl} target="_blank" rel="noreferrer noopener">
                    {unit.sourceName} ↗
                  </a>
                </p>
                <div className="source-item__tags">
                  <span className={`tag ${unit.copyrightScope === "public-domain-cn" ? "tag--warning" : "tag--quiet"}`}>
                    {unit.copyrightScope === "public-domain-cn" ? "仅中国公版" : "中国 + 美国公版"}
                  </span>
                  {unit.contentWarnings.length > 0 && (
                    <span className="tag tag--warning">含 {unit.contentWarnings.join("、")}</span>
                  )}
                  {unit.notes.length > 0 && <span className="tag tag--quiet">{unit.notes.length} 条短注</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <footer className="source-foot">
          <p>
            本站不使用现代出版社的校注、翻译或赏析。短注与推荐语为本站原创。阅读记录只保存在你的浏览器里。
          </p>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            回到阅读
          </button>
        </footer>
      </section>
    </div>
  );
}
