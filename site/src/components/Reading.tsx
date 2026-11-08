import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FORM_LABELS, unitKindLabel, unitSubtitle } from "../data/moods";
import type { TextUnit } from "../lib/types";
import { formatClock } from "../lib/storage";
import { ArrowLeft, ArrowRight, CheckIcon, ClockIcon, SlidersIcon } from "./icons";

interface FinishPayload {
  durationSeconds: number;
  readingNotes: string[];
}

interface ReadingProps {
  unit: TextUnit;
  onExit: () => void;
  onFinish: (payload: FinishPayload) => void;
}

type FontScale = 0.92 | 1 | 1.1;
type Leading = 1.9 | 2.05;

export function Reading({ unit, onExit, onFinish }: ReadingProps) {
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [revealed, setRevealed] = useState(1);
  const [revealedBeforeWhole, setRevealedBeforeWhole] = useState(1);
  const [wholePoem, setWholePoem] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>(1);
  const [leading, setLeading] = useState<Leading>(1.9);
  const [night, setNight] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [focusMode, setFocusMode] = useState(true);
  const [activeBlock, setActiveBlock] = useState(-1);
  const [exitOpen, setExitOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(unit.contentWarnings.length > 0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / max)));
      });
    };
    update();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [unit.id, wholePoem, fontScale, leading, showNotes]);

  useEffect(() => {
    if (!warningOpen) headingRef.current?.focus({ preventScroll: true });
  }, [unit.id, warningOpen]);

  useEffect(() => {
    if (!focusMode) {
      setActiveBlock(-1);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-reading-block]"));
        if (blocks.length === 0) return;
        const focusLine = window.innerHeight * 0.38;
        let next = 0;
        let best = Infinity;
        blocks.forEach((block, index) => {
          const rect = block.getBoundingClientRect();
          const distance =
            rect.top <= focusLine && rect.bottom >= focusLine
              ? 0
              : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
          if (distance < best) {
            best = distance;
            next = index;
          }
        });
        setActiveBlock((current) => (current === next ? current : next));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [focusMode, unit.id, wholePoem, fontScale, leading, showNotes, revealed, warningOpen]);

  const isPoem = unit.form === "poem";
  const totalLines = useMemo(
    () => (isPoem ? unit.stanzas.reduce((sum, stanza) => sum + stanza.length, 0) : 0),
    [isPoem, unit.stanzas],
  );
  const sections = unit.sections;
  const poemProgress = Math.min(1, revealed / Math.max(1, totalLines));
  const progress = isPoem && !wholePoem ? poemProgress : scrollProgress;

  const readingNotes = note.trim() ? [note.trim()] : [];

  const finish = () => {
    onFinish({ durationSeconds: elapsed, readingNotes });
  };

  const revealLine = () => {
    if (revealed >= totalLines) {
      finish();
      return;
    }
    setRevealed((value) => value + 1);
  };

  const readerStyle = {
    "--reader-scale": fontScale,
    "--reader-leading": leading,
  } as CSSProperties;
  let proseBlockIndex = 0;

  if (warningOpen) {
    return (
      <div className="reading-shell reading-shell--notice" data-night={false}>
        <div className="notice-card">
          <p className="kicker">阅读前</p>
          <h1>这篇会涉及一些你可能不想碰到的内容</h1>
          <p>
            《{unit.workTitle}》· {unit.unitTitle} 包含：
            <strong>{unit.contentWarnings.join("、")}</strong>。你可以换一篇，也可以仍然开始。
          </p>
          <p className="notice-card__small">换一篇不会失去这次的心情匹配。</p>
          <div className="notice-actions">
            <button type="button" className="btn btn--ghost" onClick={onExit} autoFocus>
              换一篇
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setWarningOpen(false)}>
              仍然开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`reading-shell${night ? " is-night" : ""}`}
      data-night={night ? "true" : "false"}
      style={readerStyle}
    >
      <header className="reading-toolbar">
        <button
          type="button"
          className="icon-button"
          onClick={() => setExitOpen(true)}
          aria-label="退出阅读"
        >
          <ArrowLeft />
        </button>
        <div className="reading-toolbar__center">
          <span className="reading-toolbar__work">《{unit.workTitle}》</span>
          <span className="reading-toolbar__unit">{unit.unitTitle}</span>
        </div>
        <div className="reading-toolbar__tools">
          <span className="reading-timer" aria-label={`已阅读 ${formatClock(elapsed)}`}>
            <ClockIcon />
            {formatClock(elapsed)}
          </span>
          <span className="reading-progress" aria-label={`阅读进度 ${Math.round(progress * 100)}%`}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle className="reading-progress__track" cx="18" cy="18" r="15.5" pathLength="100" />
              <circle
                className="reading-progress__value"
                cx="18"
                cy="18"
                r="15.5"
                pathLength="100"
                strokeDasharray={`${progress * 100} 100`}
              />
            </svg>
            <span>
              {isPoem
                ? wholePoem
                  ? "整首"
                  : `${Math.min(revealed, totalLines)}/${totalLines}`
                : `${Math.round(progress * 100)}%`}
            </span>
          </span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label="阅读设置"
            aria-expanded={settingsOpen}
          >
            <SlidersIcon />
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div className="reading-settings" role="group" aria-label="阅读设置">
          <div className="reading-settings__row">
            <span>字号</span>
            <div className="segmented">
              {([0.92, 1, 1.1] as FontScale[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="segmented__button"
                  aria-pressed={fontScale === value}
                  onClick={() => setFontScale(value)}
                >
                  {value === 0.92 ? "小" : value === 1 ? "中" : "大"}
                </button>
              ))}
            </div>
          </div>
          <div className="reading-settings__row">
            <span>行距</span>
            <div className="segmented">
              {([1.9, 2.05] as Leading[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="segmented__button"
                  aria-pressed={leading === value}
                  onClick={() => setLeading(value)}
                >
                  {value === 1.9 ? "标准" : "宽松"}
                </button>
              ))}
            </div>
          </div>
          <div className="reading-settings__row">
            <span>夜读</span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-label="夜读"
              aria-checked={night}
              onClick={() => setNight((value) => !value)}
            >
              <span className="switch__thumb" />
              <span className="switch__label">{night ? "已打开" : "关"}</span>
            </button>
          </div>
          <div className="reading-settings__row">
            <span>{isPoem ? "聚焦当前句" : "聚焦当前段"}</span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-label={isPoem ? "聚焦当前阅读诗句" : "聚焦当前阅读段落"}
              aria-checked={focusMode}
              onClick={() => setFocusMode((value) => !value)}
            >
              <span className="switch__thumb" />
              <span className="switch__label">{focusMode ? "已打开" : "关"}</span>
            </button>
          </div>
          {unit.notes.length > 0 && (
            <div className="reading-settings__row">
              <span>注释</span>
              <button
                type="button"
                className="switch"
                role="switch"
                aria-label="注释"
                aria-checked={showNotes}
                onClick={() => setShowNotes((value) => !value)}
              >
                <span className="switch__thumb" />
                <span className="switch__label">{showNotes ? "显示" : "隐藏"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <main className="reading-main">
        <header className="reading-heading">
          <p className="kicker">
            读完 / {FORM_LABELS[unit.form]} / {unitKindLabel(unit)}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            <span>《{unit.workTitle}》</span>
            {unitSubtitle(unit) && <em>{unitSubtitle(unit)}</em>}
          </h1>
          <p className="reading-byline">
            {unit.author} · {unit.readingMinutes} 分钟 · {unit.weather}
          </p>
          <p className="reading-flow-note">
            {isPoem && !wholePoem
              ? "逐句阅读中；随时可以切回整首。"
              : `${isPoem ? "整首" : "正文"}已展开，按自己的速度向下读。`}
          </p>
        </header>

        {unit.contextBefore && (
          <aside className="reading-context">
            <span>前情</span>
            <p>{unit.contextBefore}</p>
          </aside>
        )}

        {isPoem ? (
          <section
            className="reading-body reading-body--poem"
            data-focus={focusMode ? "on" : "off"}
            aria-label="诗歌正文"
          >
            <div className="reading-mode-toggle reading-mode-toggle--top">
              <span>读法</span>
              <div className="segmented">
                <button
                  type="button"
                  className="segmented__button"
                  aria-pressed={!wholePoem}
                  onClick={() => {
                    setWholePoem(false);
                    setRevealed(revealedBeforeWhole);
                  }}
                >
                  逐句
                </button>
                <button
                  type="button"
                  className="segmented__button"
                  aria-pressed={wholePoem}
                  onClick={() => {
                    setRevealedBeforeWhole(revealed);
                    setWholePoem(true);
                  }}
                >
                  整首
                </button>
              </div>
            </div>
            {unit.stanzas.map((stanza, stanzaIndex) => {
              const previousCount = unit.stanzas
                .slice(0, stanzaIndex)
                .reduce((sum, item) => sum + item.length, 0);
              const visibleLines = wholePoem
                ? stanza
                : stanza.slice(0, Math.max(0, revealed - previousCount));
              if (visibleLines.length === 0) return null;
              return (
                <div className="poem-stanza" key={stanzaIndex}>
                  {visibleLines.map((line, lineIndex) => {
                    const absoluteIndex = previousCount + lineIndex;
                    const isCurrent = !wholePoem && absoluteIndex === revealed - 1;
                    const isFocused =
                      focusMode &&
                      (wholePoem ? activeBlock === absoluteIndex : absoluteIndex === revealed - 1);
                    return (
                      <p
                        className={`poem-line${isCurrent ? " is-current" : ""}`}
                        key={`${line}-${lineIndex}`}
                        data-reading-block
                        data-active={isFocused ? "true" : undefined}
                        aria-current={isFocused ? "true" : undefined}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </section>
        ) : (
          <section className="reading-body" data-focus={focusMode ? "on" : "off"} aria-label="正文">
            {sections.map((paragraphs, index) => (
              <div className="reading-section" key={index}>
                {paragraphs.map((paragraph, paragraphIndex) => {
                  const blockIndex = proseBlockIndex;
                  proseBlockIndex += 1;
                  const isFocused = focusMode && activeBlock === blockIndex;
                  return (
                    <p
                      key={paragraphIndex}
                      data-reading-block
                      data-active={isFocused ? "true" : undefined}
                      aria-current={isFocused ? "true" : undefined}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ))}

            {unit.notes.length > 0 && showNotes && (
              <aside className="classical-notes" aria-label="注释">
                <p className="classical-notes__title">短注</p>
                <ol>
                  {unit.notes.map((item) => (
                    <li key={item.term}>
                      <strong>{item.term}</strong>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <div className="checkpoint-note">
              <label htmlFor="checkpoint-note">
                用一句话记住这次阅读
                <span>可以不写</span>
              </label>
              <textarea
                id="checkpoint-note"
                rows={2}
                maxLength={80}
                placeholder="想记住哪一句？或者，读完后想说什么？"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <span className="checkpoint-note__count">{note.length}/80</span>
            </div>
          </section>
        )}

        <footer className="reading-actions">
          <span className="reading-actions__hint">
            {isPoem
              ? wholePoem
                ? "整首都在这里。读完之后，去留一张卡片。"
                : "一次一句，也可以随时切回整首。"
              : "这篇的内容都在这一页，按自己的速度读。读完后收下这次阅读。"}
          </span>
          <div className="reading-actions__buttons">
            {isPoem && !wholePoem ? (
              <button type="button" className="btn btn--primary" onClick={revealLine}>
                {revealed >= totalLines ? (
                  <>
                    读完了 <CheckIcon />
                  </>
                ) : (
                  <>
                    下一句 <ArrowRight />
                  </>
                )}
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={finish}>
                我读完了 <CheckIcon />
              </button>
            )}
          </div>
        </footer>
      </main>

      {exitOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setExitOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker">暂停一下</p>
            <h2 id="exit-title">这次阅读不会保存进度</h2>
            <p>MVP 不做断点续读。离开后，这一页的阅读位置和段落笔记都不会留下。</p>
            <div className="modal__actions">
              <button type="button" className="btn btn--primary" onClick={() => setExitOpen(false)} autoFocus>
                继续读
              </button>
              <button type="button" className="btn btn--ghost" onClick={onExit}>
                离开这一页
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
