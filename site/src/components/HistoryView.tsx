import { useEffect, useState } from "react";
import { FORM_LABELS, STAMPS, unitSubtitle } from "../data/moods";
import type { HistoryRecord } from "../lib/types";
import { formatDate } from "../lib/storage";
import { downloadFinishCard } from "../lib/exportCard";
import { ArrowLeft, CloseIcon, DownloadIcon } from "./icons";
import { FinishCard } from "./FinishCard";
import { Seal } from "./Seal";

interface HistoryViewProps {
  records: HistoryRecord[];
  onBack: () => void;
  onSources: () => void;
}

function stampLabels(ids: string[]): string[] {
  return ids
    .map((id) => STAMPS.find((stamp) => stamp.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function HistoryView({ records, onBack, onSources }: HistoryViewProps) {
  const [selected, setSelected] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    if (!selected) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <div className="history view-enter">
      <header className="history-head">
        <div>
          <p className="kicker">处方笺 / {records.length} 张</p>
          <h1>读过的，都在这里。</h1>
          <p className="history-lede">卡片只保存在这台设备的浏览器里。没有账号，也不会上传。</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          <ArrowLeft /> 回到首页
        </button>
      </header>

      {records.length === 0 ? (
        <div className="history-empty">
          <p className="history-empty__mark">空</p>
          <h2>还没有读完的卡片。</h2>
          <p>去选一个 2–15 分钟的短单元，读完一张就会留在这里。</p>
          <button type="button" className="btn btn--primary" onClick={onBack}>
            去选一篇
          </button>
        </div>
      ) : (
        <ol className="history-grid">
          {records.map((record) => {
            const stamps = stampLabels(record.stampIds);
            return (
              <li key={record.id}>
                <button
                  type="button"
                  className="history-card"
                  onClick={() => setSelected(record)}
                  aria-label={`打开 ${record.workTitle} ${record.unitTitle} 的读完卡片`}
                >
                  <span className="history-card__date">{formatDate(record.finishedAt)}</span>
                  <span className="history-card__work">《{record.workTitle}》</span>
                  {unitSubtitle({ unitTitle: record.unitTitle }) && (
                    <span className="history-card__unit">
                      {unitSubtitle({ unitTitle: record.unitTitle })}
                    </span>
                  )}
                  <span className="history-card__meta">
                    {record.author} · {FORM_LABELS[record.form]} · {record.readingMinutes} 分钟
                  </span>
                  <span className="history-card__quote">“{record.quote}”</span>
                  <span className="history-card__mood">
                    {record.preMood} → {record.postMood}
                  </span>
                  <span className="history-card__stamps">
                    {stamps.map((label) => (
                      <Seal key={label} label={label} size="sm" />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <footer className="history-foot">
        <button type="button" className="link-button" onClick={onSources}>
          文本来源与许可
        </button>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div
            className="history-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-detail__head">
              <div>
                <p className="kicker">{formatDate(selected.finishedAt)}</p>
                <h2 id="history-detail-title">
                  《{selected.workTitle}》
                  {unitSubtitle({ unitTitle: selected.unitTitle })
                    ? ` · ${unitSubtitle({ unitTitle: selected.unitTitle })}`
                    : ""}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="关闭"
                autoFocus
              >
                <CloseIcon />
              </button>
            </div>
            <div className="history-detail__body">
              <FinishCard record={selected} variant="saved" />
              <div className="history-detail__side">
                <p className="history-detail__label">那天留下的</p>
                <p>{selected.note || "没有写一句话，也没关系。"}</p>
                <p className="history-detail__label">读前 → 读后</p>
                <p>
                  {selected.preMood} → {selected.postMood}
                </p>
                <p className="history-detail__label">用时</p>
                <p>{Math.max(1, Math.round(selected.durationSeconds / 60))} 分钟</p>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => downloadFinishCard(selected)}
                >
                  <DownloadIcon /> 下载这张卡片
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
