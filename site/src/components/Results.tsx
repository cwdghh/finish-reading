import { useState } from "react";
import { FORM_LABELS, FORMS, MOODS, NEEDS, TIMES } from "../data/moods";
import type { Answers, MatchBreakdown, RankedUnit, TextUnit } from "../lib/types";
import { ArrowRight, QuoteIcon } from "./icons";

interface ResultsProps {
  result: {
    items: RankedUnit[];
    totalBeforeFilters: number;
    removedByWarnings: number;
    removedRecent: number;
    recentFallback: boolean;
  };
  answers: Answers;
  onRead: (unit: TextUnit) => void;
  onRematch: () => void;
  onSources: () => void;
}

const BREAKDOWN_LABELS: { key: keyof MatchBreakdown; label: string; weight: string }[] = [
  { key: "need", label: "需求", weight: "25%" },
  { key: "mood", label: "情绪", weight: "20%" },
  { key: "free", label: "自由输入", weight: "15%" },
  { key: "time", label: "时间", weight: "15%" },
  { key: "form", label: "体裁", weight: "10%" },
  { key: "affect", label: "效价 / 唤醒", weight: "10%" },
  { key: "difficulty", label: "难度", weight: "5%" },
];

function MatchDetails({ item }: { item: RankedUnit }) {
  const percent = Math.round(item.score * 100);
  return (
    <details className="match-details">
      <summary>
        <span>匹配详情</span>
        <span className="match-details__score">相对 {percent}</span>
      </summary>
      <div className="match-details__body">
        <p className="match-details__note">
          相对分数只用于排序，不代表精确概率。时间与体裁是偏好，不是硬筛选。
        </p>
        <ul className="breakdown-list">
          {BREAKDOWN_LABELS.map(({ key, label, weight }) => {
            const value = Math.round(item.breakdown[key] * 100);
            return (
              <li key={key} className="breakdown-row">
                <span className="breakdown-row__label">
                  {label} <small>{weight}</small>
                </span>
                <span className="breakdown-row__bar" aria-hidden="true">
                  <span style={{ width: `${value}%` }} />
                </span>
                <span className="breakdown-row__value">{value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

function WarningLine({ item }: { item: RankedUnit }) {
  if (item.unit.contentWarnings.length === 0) return null;
  return <span className="tag tag--warning">含 {item.unit.contentWarnings.join("、")}</span>;
}

function TopCard({
  item,
  index,
  onRead,
}: {
  item: RankedUnit;
  index: number;
  onRead: (unit: TextUnit) => void;
}) {
  return (
    <article className={`result-card result-card--top result-card--${index + 1}`}>
      <div className="result-card__topline">
        <span className="result-card__number">0{index + 1}</span>
        <span className="tag tag--match">{item.label}</span>
        {item.tooLong && <span className="tag tag--quiet">稍长</span>}
        <WarningLine item={item} />
      </div>
      <div className="result-card__title-wrap">
        <p className="result-card__work">《{item.unit.workTitle}》</p>
        <h2>{item.unit.unitTitle}</h2>
      </div>
      <p className="result-card__meta">
        {item.unit.author} · {FORM_LABELS[item.unit.form]} · {item.unit.readingMinutes} 分钟 ·{" "}
        {item.unit.weather}
      </p>
      <blockquote className="result-card__excerpt">
        <QuoteIcon />
        <span>{item.unit.excerpt}</span>
      </blockquote>
      <p className="result-card__reason">{item.reason}</p>
      <MatchDetails item={item} />
      <div className="result-card__actions">
        <button type="button" className="btn btn--primary" onClick={() => onRead(item.unit)}>
          读这个 <ArrowRight />
        </button>
        <span className="result-card__hint">读完大约 {item.unit.readingMinutes} 分钟</span>
      </div>
    </article>
  );
}

export function Results({ result, answers, onRead, onRematch, onSources }: ResultsProps) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOODS.find((item) => item.id === answers.moodId);
  const need = NEEDS.find((item) => item.id === answers.needId);
  const time = TIMES.find((item) => item.value === answers.minutes);
  const form = FORMS.find((item) => item.value === answers.form);
  const visibleCount = expanded ? result.items.length : Math.min(10, result.items.length);
  const more = result.items.slice(3, visibleCount);

  return (
    <div className="results view-enter">
      <header className="results-head">
        <div className="results-head__main">
          <p className="kicker">配文结果 / {result.items.length} 个单元</p>
          <h1>
            为你排了 <em>{result.items.length}</em> 个
          </h1>
          {answers.freeText.trim() && (
            <p className="results-heard">你说：“{answers.freeText.trim()}”</p>
          )}
          <div className="result-context" aria-label="本次匹配条件">
            <span>{mood?.label ?? "此刻"}</span>
            <span>{need?.label ?? "想要"}</span>
            <span>{time?.label ?? "15 分钟"}</span>
            <span>{form?.label ?? "随便"}</span>
            {answers.avoid.length > 0 && <span>避开 {answers.avoid.join("、")}</span>}
          </div>
        </div>
        <div className="results-head__actions">
          <button type="button" className="btn btn--ghost" onClick={onRematch}>
            重新匹配
          </button>
          <button type="button" className="link-button" onClick={onSources}>
            文本来源
          </button>
        </div>
      </header>

      {(result.removedByWarnings > 0 || result.removedRecent > 0 || result.recentFallback) && (
        <div className="result-notes" role="status">
          {result.removedByWarnings > 0 && (
            <span>按你的内容偏好，避开了 {result.removedByWarnings} 个单元。</span>
          )}
          {result.removedRecent > 0 && <span>最近读过的 {result.removedRecent} 个没有再出现。</span>}
          {result.recentFallback && <span>可选单元不多了，读过的也可能再次出现。</span>}
          {result.items.length < 10 && <span>这次只有 {result.items.length} 个通过筛选，全部列在这里。</span>}
        </div>
      )}

      <section className="top-results" aria-labelledby="top-results-title">
        <h2 id="top-results-title" className="section-label">
          最匹配
        </h2>
        <div className="top-results__grid">
          {result.items.slice(0, 3).map((item, index) => (
            <TopCard key={item.unit.id} item={item} index={index} onRead={onRead} />
          ))}
        </div>
      </section>

      {more.length > 0 && (
        <section className="more-results" aria-labelledby="more-results-title">
          <div className="section-head">
            <h2 id="more-results-title" className="section-label">
              更多可读
            </h2>
            <span className="section-count">04 — {String(visibleCount).padStart(2, "0")}</span>
          </div>
          <ol className="rank-list">
            {more.map((item, index) => (
              <li key={item.unit.id}>
                <button type="button" className="rank-row" onClick={() => onRead(item.unit)}>
                  <span className="rank-row__number">{String(index + 4).padStart(2, "0")}</span>
                  <span className="rank-row__title">
                    <span className="rank-row__work">《{item.unit.workTitle}》</span>
                    <span className="rank-row__unit">{item.unit.unitTitle}</span>
                    <span className="rank-row__meta">
                      {item.unit.author} · {FORM_LABELS[item.unit.form]} · {item.unit.readingMinutes} 分钟 ·{" "}
                      {item.unit.weather}
                    </span>
                    {(item.tooLong || item.unit.contentWarnings.length > 0) && (
                      <span className="rank-row__tags">
                        {item.tooLong && <span className="tag tag--quiet">稍长</span>}
                        <WarningLine item={item} />
                      </span>
                    )}
                  </span>
                  <span className="rank-row__label">{item.label}</span>
                  <ArrowRight className="rank-row__arrow" />
                </button>
              </li>
            ))}
          </ol>
          {result.items.length > 10 && (
            <div className="expand-row">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                {expanded ? "收起列表" : `展开全部 ${result.items.length} 个`}
              </button>
            </div>
          )}
        </section>
      )}

      <footer className="results-foot">
        <button type="button" className="link-button" onClick={onSources}>
          这些文字从哪里来
        </button>
        <span>全部为公共版权文本 · 只在本地保存阅读记录</span>
      </footer>
    </div>
  );
}
