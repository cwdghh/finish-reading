import { FORM_LABELS, FORMS, MOOD_BY_ID, NEED_BY_ID, TIMES, unitKindLabel, unitSubtitle } from "../data/moods";
import type { Answers, MatchBreakdown, RankedUnit, TextUnit } from "../lib/types";
import type { MatchResult } from "../lib/match";
import { ArrowRight, QuoteIcon } from "./icons";

interface ResultsProps {
  result: MatchResult;
  answers: Answers;
  onRead: (unit: TextUnit) => void;
  onAdjust: () => void;
  onShuffle: () => void;
  onSources: () => void;
}

const BREAKDOWN_LABELS: {
  key: keyof MatchBreakdown;
  label: string;
  weightKey: keyof MatchResult["weights"];
}[] = [
  { key: "need", label: "需求", weightKey: "need" },
  { key: "mood", label: "情绪", weightKey: "mood" },
  { key: "free", label: "自由输入", weightKey: "free" },
  { key: "time", label: "时间", weightKey: "time" },
  { key: "form", label: "体裁", weightKey: "form" },
  { key: "affect", label: "效价 / 唤醒", weightKey: "affect" },
  { key: "difficulty", label: "难度", weightKey: "difficulty" },
];

function MatchDetails({ item, result }: { item: RankedUnit; result: MatchResult }) {
  const percent = Math.round(item.score * 100);
  return (
    <details className="match-details">
      <summary>
        <span>匹配详情</span>
        <span className="match-details__score">相对 {percent}</span>
      </summary>
      <div className="match-details__body">
        <p className="match-details__note">
          相对分数只用于排序，不代表精确概率。标签按分数阈值判断，不按名次。
        </p>
        <ul className="breakdown-list">
          {BREAKDOWN_LABELS.map(({ key, label, weightKey }) => {
            const value = Math.round(item.breakdown[key] * 100);
            const weight = Math.round(result.weights[weightKey] * 100);
            return (
              <li key={key} className="breakdown-row">
                <span className="breakdown-row__label">
                  {label} <small>{weight}%</small>
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

function FreeTag({ item }: { item: RankedUnit }) {
  if (!item.freeHit) return null;
  return <span className="tag tag--free">因你写的话</span>;
}

function MainCard({
  item,
  result,
  onRead,
}: {
  item: RankedUnit;
  result: MatchResult;
  onRead: (unit: TextUnit) => void;
}) {
  const subtitle = unitSubtitle(item.unit);
  return (
    <article className="result-card result-card--main">
      <div className="result-card__topline">
        <span className="result-card__number">01</span>
        <span className="tag tag--match">{item.label}</span>
        <span className="tag tag--quiet">{unitKindLabel(item.unit)}</span>
        {item.tooLong && <span className="tag tag--quiet">稍长</span>}
        <FreeTag item={item} />
        <WarningLine item={item} />
      </div>
      <div className="result-card__title-wrap">
        <h2>《{item.unit.workTitle}》</h2>
        {subtitle && <p className="result-card__subtitle">{subtitle}</p>}
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
      <MatchDetails item={item} result={result} />
      <div className="result-card__actions">
        <button type="button" className="btn btn--primary" onClick={() => onRead(item.unit)}>
          读这个 <ArrowRight />
        </button>
        <span className="result-card__hint">读完大约 {item.unit.readingMinutes} 分钟</span>
      </div>
    </article>
  );
}

export function Results({
  result,
  answers,
  onRead,
  onAdjust,
  onShuffle,
  onSources,
}: ResultsProps) {
  const mood = MOOD_BY_ID.get(answers.moodId);
  const need = NEED_BY_ID.get(answers.needId);
  const time = TIMES.find((item) => item.value === answers.minutes);
  const form = FORMS.find((item) => item.value === answers.form);
  const main = result.items[0];
  const rest = result.items.slice(1);
  const freeText = answers.freeText.trim();
  const heading = result.weak ? "今天先读一篇" : "这轮先看 " + result.items.length + " 个";

  return (
    <div className="results view-enter">
      <header className="results-head">
        <div className="results-head__main">
          <p className="kicker">
            配文结果 / 从 {result.librarySize} 个单元里
            {result.batchIndex > 0 ? ` / 第 ${result.batchIndex + 1} 批` : ""}
          </p>
          <h1>{heading}</h1>
          {result.neutral && (
            <p className="results-neutral">
              <span className="tag tag--neutral">未选状态</span>
              {freeText ? "按你写的话来配" : "按时间和体裁来配"}
            </p>
          )}
          {freeText && <p className="results-heard">你说：“{freeText}”</p>}
          {!result.weak && (
            <p className="results-lede">
              前几张是稳定的锚点，后面的顺序只在这一档相近的文本里换，不会把最相关的文章随机掉。
            </p>
          )}
          {result.weak && (
            <p className="results-lede">匹配不算强，先读一个短的也好。也可以调整条件再试。</p>
          )}
          <div className="result-context" aria-label="本次匹配条件">
            <span>{mood?.label ?? (result.neutral ? "未选状态" : "此刻")}</span>
            <span>{need?.label ?? "想要"}</span>
            <span>{time?.label ?? "15 分钟"}</span>
            <span>{form?.label ?? "随便"}</span>
            {answers.avoid.length > 0 && <span>避开 {answers.avoid.join("、")}</span>}
          </div>
          {result.freeThemes.length > 0 && (
            <div className="free-impact">
              <span className="free-impact__label">从你那句话里读到</span>
              {result.freeThemes.map((theme) => (
                <span key={theme} className="tag tag--quiet">
                  {theme}
                </span>
              ))}
              <span className="free-impact__note">
                {result.freeHitCount > 0
                  ? `它们让这轮 ${result.freeHitCount} 篇排得更前，带“因你写的话”标记。`
                  : "这轮暂时没有明显对上，仍按时间和体裁排。"}
              </span>
            </div>
          )}
        </div>
        <div className="results-head__actions">
          <button type="button" className="btn btn--primary" onClick={onShuffle} aria-label={`换一批，排除当前 ${result.items.length} 个`}>
            换一批 <ArrowRight />
          </button>
          <button type="button" className="btn btn--ghost" onClick={onAdjust}>
            调整条件
          </button>
          <button type="button" className="link-button" onClick={onSources}>
            文本来源
          </button>
        </div>
      </header>

      {(result.removedByWarnings > 0 ||
        result.removedRecent > 0 ||
        result.removedShown > 0 ||
        result.recentFallback ||
        result.shownFallback ||
        result.items.length < 9) && (
        <div className="result-notes" role="status">
          {result.removedByWarnings > 0 && (
            <span>按你的内容偏好，避开了 {result.removedByWarnings} 个单元。</span>
          )}
          {result.removedRecent > 0 && <span>最近读过的 {result.removedRecent} 个没有再出现。</span>}
          {result.removedShown > 0 && (
            <span>最近展示过的 {result.removedShown} 个先没有重复。</span>
          )}
          {result.shownFallback && (
            <span>可选单元不多了，这一轮可能会和前几批重复。</span>
          )}
          {result.recentFallback && <span>可选单元不多了，读过的也可能再次出现。</span>}
          {result.items.length < 9 && (
            <span>这一轮只有 {result.items.length} 个通过筛选，全部列在这里。</span>
          )}
        </div>
      )}

      {main ? (
        <section className="main-result" aria-labelledby="main-result-title">
          <h2 id="main-result-title" className="section-label">
            {result.weak ? "先读这一篇" : "最稳的一篇"}
          </h2>
          <MainCard item={main} result={result} onRead={onRead} />
        </section>
      ) : (
        <div className="results-empty">
          <h2>这一轮没有合适的单元。</h2>
          <p>可以放宽内容偏好，或者调整时间和体裁再试。</p>
          <button type="button" className="btn btn--primary" onClick={onAdjust}>
            调整条件
          </button>
        </div>
      )}

      {rest.length > 0 && (
        <section className="more-results" aria-labelledby="more-results-title">
          <div className="section-head">
            <h2 id="more-results-title" className="section-label">
              同一批里还可以读
            </h2>
            <span className="section-count">
              02 — {String(result.items.length).padStart(2, "0")}
            </span>
          </div>
          <ol className="rank-list">
            {rest.map((item, index) => {
              const subtitle = unitSubtitle(item.unit);
              return (
                <li key={item.unit.id}>
                  <button type="button" className="rank-row" onClick={() => onRead(item.unit)}>
                    <span className="rank-row__number">{String(index + 2).padStart(2, "0")}</span>
                    <span className="rank-row__title">
                      <span className="rank-row__work">《{item.unit.workTitle}》</span>
                      {subtitle && <span className="rank-row__unit">{subtitle}</span>}
                      <span className="rank-row__meta">
                        {item.unit.author} · {FORM_LABELS[item.unit.form]} · {item.unit.readingMinutes} 分钟 ·{" "}
                        {item.unit.weather} · {unitKindLabel(item.unit)}
                      </span>
                      {(item.tooLong || item.unit.contentWarnings.length > 0 || item.freeHit) && (
                        <span className="rank-row__tags">
                          {item.freeHit && <span className="tag tag--free">因你写的话</span>}
                          {item.tooLong && <span className="tag tag--quiet">稍长</span>}
                          <WarningLine item={item} />
                        </span>
                      )}
                      <span className="rank-row__reason">{item.reason}</span>
                    </span>
                    <span className="rank-row__label">{item.label}</span>
                    <ArrowRight className="rank-row__arrow" />
                  </button>
                </li>
              );
            })}
          </ol>
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
