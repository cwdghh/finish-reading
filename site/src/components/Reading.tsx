import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { FORM_LABELS } from "../data/moods";
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
  const [sectionIndex, setSectionIndex] = useState(0);
  const [notes, setNotes] = useState<string[]>(() => unit.sections.map(() => ""));
  const [revealed, setRevealed] = useState(1);
  const [revealedBeforeWhole, setRevealedBeforeWhole] = useState(1);
  const [wholePoem, setWholePoem] = useState(() => unit.form === "poem" && unit.stanzas.flat().length > 14);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>(1);
  const [leading, setLeading] = useState<Leading>(1.9);
  const [night, setNight] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [exitOpen, setExitOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(unit.contentWarnings.length > 0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isPoem = unit.form === "poem";
  const totalLines = useMemo(
    () => (isPoem ? unit.stanzas.reduce((sum, stanza) => sum + stanza.length, 0) : 0),
    [isPoem, unit.stanzas],
  );
  const sections = unit.sections;
  const currentSection = sections[sectionIndex] ?? [];
  const isLastSection = sectionIndex >= sections.length - 1;
  const poemProgress = wholePoem ? 1 : Math.min(1, revealed / Math.max(1, totalLines));
  const proseProgress = Math.min(1, (sectionIndex + 1) / Math.max(1, sections.length));
  const progress = isPoem ? poemProgress : proseProgress;

  const readingNotes = notes.map((note) => note.trim()).filter(Boolean);

  const finish = () => {
    onFinish({ durationSeconds: elapsed, readingNotes });
  };

  const advanceSection = () => {
    if (isLastSection) {
      finish();
      return;
    }
    setSectionIndex((index) => index + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                ? `${wholePoem ? totalLines : Math.min(revealed, totalLines)}/${totalLines}`
                : `${sectionIndex + 1}/${sections.length}`}
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
            读完 / {FORM_LABELS[unit.form]}
            {unit.unitType === "excerpt" ? " / 节选" : ""}
          </p>
          <h1>
            <span>《{unit.workTitle}》</span>
            <em>{unit.unitTitle}</em>
          </h1>
          <p className="reading-byline">
            {unit.author} · {unit.readingMinutes} 分钟 · {unit.weather}
          </p>
        </header>

        {sectionIndex === 0 && unit.contextBefore && (
          <aside className="reading-context">
            <span>前情</span>
            <p>{unit.contextBefore}</p>
          </aside>
        )}

        {isPoem ? (
          <section className="reading-body reading-body--poem" aria-label="诗歌正文">
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
                    return (
                      <p className={`poem-line${isCurrent ? " is-current" : ""}`} key={`${line}-${lineIndex}`}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </section>
        ) : (
          <section className="reading-body" aria-label="正文">
            {currentSection.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {unit.notes.length > 0 && showNotes && sectionIndex === 0 && (
              <aside className="classical-notes" aria-label="注释">
                <p className="classical-notes__title">短注</p>
                <ol>
                  {unit.notes.map((note) => (
                    <li key={note.term}>
                      <strong>{note.term}</strong>
                      <span>{note.text}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <div className="checkpoint-note">
              <label htmlFor="checkpoint-note">
                用一句话记住这一段
                <span>可以不写</span>
              </label>
              <textarea
                id="checkpoint-note"
                rows={2}
                maxLength={80}
                placeholder="这段在讲什么？或者，你想记住哪一句？"
                value={notes[sectionIndex] ?? ""}
                onChange={(event) => {
                  const next = [...notes];
                  next[sectionIndex] = event.target.value;
                  setNotes(next);
                }}
              />
              <span className="checkpoint-note__count">{notes[sectionIndex]?.length ?? 0}/80</span>
            </div>
          </section>
        )}

        <footer className="reading-actions">
          <span className="reading-actions__hint">
            {isPoem
              ? wholePoem
                ? "读完之后，去留一张卡片。"
                : "一次一句，也可以随时看整首。"
              : isLastSection
                ? "读完这一段，就可以收下这次阅读。"
                : "这一段没有笔记也没关系。"}
          </span>
          {isPoem ? (
            wholePoem ? (
              <button type="button" className="btn btn--primary" onClick={finish}>
                我读完了 <CheckIcon />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={revealLine}
              >
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
            )
          ) : (
            <button type="button" className="btn btn--primary" onClick={advanceSection}>
              {isLastSection ? (
                <>
                  读完了 <CheckIcon />
                </>
              ) : (
                <>
                  读完这段 <ArrowRight />
                </>
              )}
            </button>
          )}
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
