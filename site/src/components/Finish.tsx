import { useMemo, useState } from "react";
import { FORM_LABELS, POST_MOODS, STAMP_GROUPS, STAMPS } from "../data/moods";
import type { HistoryRecord, PostMood, TextUnit } from "../lib/types";
import { extractSentences } from "../lib/textStats";
import { formatDate, makeHistoryId } from "../lib/storage";
import { downloadFinishCard } from "../lib/exportCard";
import { CheckIcon, DownloadIcon, QuoteIcon } from "./icons";
import { FinishCard, type FinishCardRecord } from "./FinishCard";
import { Seal } from "./Seal";

interface FinishProps {
  unit: TextUnit;
  preMoodLabel: string;
  readingNotes: string[];
  durationSeconds: number;
  onSave: (record: HistoryRecord) => void;
  onAgain: () => void;
  onHome: () => void;
  onSources: () => void;
}

export function Finish({
  unit,
  preMoodLabel,
  readingNotes,
  durationSeconds,
  onSave,
  onAgain,
  onHome,
  onSources,
}: FinishProps) {
  const [postMood, setPostMood] = useState<PostMood>("更松了");
  const [note, setNote] = useState(readingNotes.join("；").slice(0, 100));
  const [quote, setQuote] = useState(unit.quote);
  const [stampIds, setStampIds] = useState<string[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [savedRecord, setSavedRecord] = useState<HistoryRecord | null>(null);
  const [draftId] = useState(makeHistoryId);
  const [finishedAt] = useState(() => new Date().toISOString());

  const quoteOptions = useMemo(
    () => Array.from(new Set([unit.quote, ...extractSentences(unit)])),
    [unit],
  );

  const record: FinishCardRecord = {
    workTitle: unit.workTitle,
    unitTitle: unit.unitTitle,
    author: unit.author,
    form: unit.form,
    weather: unit.weather,
    readingMinutes: unit.readingMinutes,
    preMood: preMoodLabel,
    postMood,
    note: note.trim(),
    quote,
    stampIds,
    finishedAt: savedRecord?.finishedAt ?? finishedAt,
  };

  const locked = Boolean(savedRecord);

  const makeRecord = (): HistoryRecord => ({
    id: savedRecord?.id ?? draftId,
    unitId: unit.id,
    finishedAt: savedRecord?.finishedAt ?? finishedAt,
    workTitle: unit.workTitle,
    unitTitle: unit.unitTitle,
    author: unit.author,
    form: unit.form,
    weather: unit.weather,
    readingMinutes: unit.readingMinutes,
    preMood: preMoodLabel,
    postMood,
    note: note.trim(),
    quote,
    stampIds,
    durationSeconds,
  });

  const persist = (): HistoryRecord | null => {
    if (savedRecord) return savedRecord;
    if (stampIds.length === 0) return null;
    const next = makeRecord();
    onSave(next);
    setSavedRecord(next);
    return next;
  };

  const toggleStamp = (id: string) => {
    if (locked) return;
    if (stampIds.includes(id)) {
      setStampIds(stampIds.filter((item) => item !== id));
      return;
    }
    if (stampIds.length < 3) setStampIds([...stampIds, id]);
  };

  const handleDownload = () => {
    const saved = persist();
    if (saved) downloadFinishCard(saved);
  };

  const canSave = stampIds.length > 0;

  return (
    <div className="finish view-enter">
      <header className="finish-head">
        <div>
          <p className="kicker">读完 / {formatDate(finishedAt)}</p>
          <h1>读完了。</h1>
          <p className="finish-lede">把这次阅读收好。选一枚印章，留下一点痕迹。</p>
        </div>
        <div className="finish-head__meta">
          <span>《{unit.workTitle}》· {unit.unitTitle}</span>
          <span>{unit.author} · {FORM_LABELS[unit.form]} · {unit.readingMinutes} 分钟</span>
        </div>
      </header>

      <div className="finish-layout">
        <div className="finish-preview-col">
          <FinishCard record={record} />
          <p className="finish-preview-note">
            竖版 4:5 · 下载后适合发在小红书或朋友圈
          </p>
        </div>

        <div className="finish-controls">
          <section className="finish-section" aria-labelledby="post-mood-title">
            <div className="finish-section__head">
              <h2 id="post-mood-title">读完之后，感觉如何？</h2>
              <span className="finish-section__aside">不做心理评估</span>
            </div>
            <div className="mood-after">
              {POST_MOODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="mood-after__button"
                  aria-pressed={postMood === item}
                  disabled={locked}
                  onClick={() => setPostMood(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="finish-section" aria-labelledby="finish-note-title">
            <div className="finish-section__head">
              <h2 id="finish-note-title">留一句给这次阅读</h2>
              <span className="finish-section__aside">可以不写</span>
            </div>
            <textarea
              className="finish-note-input"
              rows={3}
              maxLength={100}
              value={note}
              disabled={locked}
              placeholder="比如：今天只读了一小段，但已经够了。"
              onChange={(event) => setNote(event.target.value)}
              aria-labelledby="finish-note-title"
            />
            <span className="field-count">{note.length}/100</span>
          </section>

          <section className="finish-section" aria-labelledby="finish-quote-title">
            <div className="finish-section__head">
              <h2 id="finish-quote-title">留在卡片上的句子</h2>
              <button
                type="button"
                className="link-button"
                aria-expanded={quoteOpen}
                disabled={locked}
                onClick={() => setQuoteOpen((value) => !value)}
              >
                {quoteOpen ? "收起候选" : "换一句"}
              </button>
            </div>
            <blockquote className="selected-quote">
              <QuoteIcon />
              <p>{quote}</p>
            </blockquote>
            {quoteOpen && (
              <div className="quote-picker" role="group" aria-label="候选摘句">
                {quoteOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="quote-option"
                    aria-pressed={quote === item}
                    onClick={() => {
                      if (locked) return;
                      setQuote(item);
                      setQuoteOpen(false);
                    }}
                    disabled={locked}
                  >
                    {quote}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="finish-section" aria-labelledby="finish-stamp-title">
            <div className="finish-section__head">
              <h2 id="finish-stamp-title">盖 1–3 枚印章</h2>
              <span className="finish-section__aside" aria-live="polite">
                已选 {stampIds.length}/3
              </span>
            </div>
            <p className="finish-section__hint">预先刻好的朱红印章，选你此刻最想留下的一枚。</p>
            <div className="stamp-tray">
              {STAMP_GROUPS.map((group) => (
                <div className="stamp-group" key={group}>
                  <p className="stamp-group__label">{group}</p>
                  <div className="stamp-grid">
                    {STAMPS.filter((stamp) => stamp.group === group).map((stamp) => {
                      const selected = stampIds.includes(stamp.id);
                      return (
                        <button
                          key={stamp.id}
                          type="button"
                          className="stamp-button"
                          aria-pressed={selected}
                          aria-label={`${stamp.label}印章`}
                          disabled={locked || (!selected && stampIds.length >= 3)}
                          onClick={() => toggleStamp(stamp.id)}
                        >
                          <Seal label={stamp.label} size="md" selected={selected} />
                          <span className="stamp-button__label">{stamp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {!canSave && <p className="finish-section__hint">先选 1 枚印章，再收下卡片。</p>}
          </section>

          <div className="finish-actions">
            <div className="finish-actions__primary">
              <button
                type="button"
                className="btn btn--primary"
                disabled={!canSave || locked}
                onClick={() => persist()}
              >
                {savedRecord ? (
                  <>
                    <CheckIcon /> 已存入处方笺
                  </>
                ) : (
                  "收下这张卡片"
                )}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={!canSave}
                onClick={handleDownload}
              >
                <DownloadIcon /> 下载 4:5 PNG
              </button>
            </div>
            <div className="finish-actions__secondary">
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  persist();
                  onAgain();
                }}
              >
                再读一个
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  persist();
                  onHome();
                }}
              >
                回到首页
              </button>
              <span aria-hidden="true">·</span>
              <button type="button" className="link-button" onClick={onSources}>
                文本来源
              </button>
            </div>
            <p className="finish-local-note" role="status">
              {savedRecord
                ? "已存入这台设备的处方笺。没有账号，也不会上传。"
                : "卡片只保存在这台设备的浏览器里。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
