import { STAMPS, unitKindLabel, unitSubtitle } from "../data/moods";
import type { HistoryRecord } from "../lib/types";
import { formatDate } from "../lib/storage";
import { Seal } from "./Seal";

export type FinishCardRecord = Omit<
  Pick<
    HistoryRecord,
    | "workTitle"
    | "unitTitle"
    | "unitType"
    | "author"
    | "form"
    | "weather"
    | "readingMinutes"
    | "preMood"
    | "postMood"
    | "note"
    | "quote"
    | "stampIds"
    | "finishedAt"
  >,
  "postMood"
> & { postMood: HistoryRecord["postMood"] | "" };

function kindOf(record: FinishCardRecord): string {
  const unitType =
    record.unitType ??
    (record.unitTitle === "全文" || record.unitTitle === "整首" ? "full" : "excerpt");
  return unitKindLabel({ unitType, form: record.form });
}

interface FinishCardProps {
  record: FinishCardRecord;
  variant?: "preview" | "saved";
}

const FORM_SHORT: Record<HistoryRecord["form"], string> = {
  poem: "诗",
  prose: "散文",
  fiction: "小说",
  classical: "古文",
};

export function FinishCard({ record, variant = "preview" }: FinishCardProps) {
  const stamps = record.stampIds
    .map((id) => STAMPS.find((stamp) => stamp.id === id))
    .filter((stamp): stamp is (typeof STAMPS)[number] => Boolean(stamp));

  return (
    <article className={`finish-card finish-card--${variant}`} aria-label="读完卡片">
      <div className="finish-card__grain" aria-hidden="true" />
      <header className="finish-card__head">
        <span className="finish-card__brand">读完</span>
        <span className="finish-card__date">{formatDate(record.finishedAt)}</span>
      </header>

      <div className="finish-card__title">
        <h3>《{record.workTitle}》</h3>
        {unitSubtitle({ unitTitle: record.unitTitle }) && (
          <p className="finish-card__unit">{unitSubtitle({ unitTitle: record.unitTitle })}</p>
        )}
        <p className="finish-card__byline">
          {record.author} · {FORM_SHORT[record.form]} · {kindOf(record)} ·{" "}
          {record.readingMinutes} 分钟
        </p>
      </div>

      <blockquote className="finish-card__quote">
        <span className="finish-card__quote-mark" aria-hidden="true">
          “
        </span>
        <p>{record.quote}</p>
      </blockquote>

      {record.note && <p className="finish-card__note">你写下的：{record.note}</p>}

      <div className="finish-card__mood">
        <span>读前 · {record.preMood}</span>
        <span className="finish-card__arrow" aria-hidden="true">
          →
        </span>
        <span>读后 · {record.postMood || "还没选"}</span>
      </div>

      <div className="finish-card__bottom">
        <div className="finish-card__meta">
          <span>{record.weather}</span>
          <span className="finish-card__meta-dot">·</span>
          <span>一个阅读单元</span>
        </div>
        {stamps.length > 0 && (
          <div className="finish-card__stamps" aria-label="印章">
            {stamps.map((stamp, index) => (
              <Seal
                key={stamp.id}
                label={stamp.label}
                size="lg"
                rotation={[-5, 3, 6][index] ?? 0}
                className="finish-card__seal"
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
