import type { CSSProperties } from "react";
import { CONTENT_WARNINGS, FORMS, MOODS, NEEDS, TIMES } from "../data/moods";
import type { Answers, ContentWarning } from "../lib/types";
import { ArrowLeft, ArrowRight } from "./icons";

interface StepRailProps {
  step: number;
  onSelect: (step: number) => void;
}

function StepRail({ step, onSelect }: StepRailProps) {
  const labels = ["此刻", "想要", "时间"];
  return (
    <ol className="step-rail" aria-label="签到进度">
      {labels.map((label, index) => {
        const number = index + 1;
        const state = number === step ? "current" : number < step ? "done" : "todo";
        return (
          <li key={label} className={`step-rail__item is-${state}`}>
            <button
              type="button"
              className="step-rail__button"
              onClick={() => onSelect(number)}
              disabled={number > step}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="step-rail__number">0{number}</span>
              <span className="step-rail__label">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

interface CheckInProps {
  step: number;
  answers: Answers;
  historyCount: number;
  onChange: (patch: Partial<Answers>) => void;
  onNext: () => void;
  onBack: () => void;
  onSelectStep: (step: number) => void;
  onStart: () => void;
}

export function CheckIn({
  step,
  answers,
  historyCount,
  onChange,
  onNext,
  onBack,
  onSelectStep,
  onStart,
}: CheckInProps) {
  const mood = MOODS.find((item) => item.id === answers.moodId);
  const need = NEEDS.find((item) => item.id === answers.needId);
  const time = TIMES.find((item) => item.value === answers.minutes);
  const form = FORMS.find((item) => item.value === answers.form);

  const toggleWarning = (warning: ContentWarning) => {
    const next = answers.avoid.includes(warning)
      ? answers.avoid.filter((item) => item !== warning)
      : [...answers.avoid, warning];
    onChange({ avoid: next });
  };

  return (
    <div className="checkin view-enter" key={step}>
      <aside className="checkin-aside" aria-hidden="true">
        <div className="mark-stack">
          <span className="mark-stack__char">读</span>
          <span className="mark-stack__char mark-stack__char--offset">完</span>
        </div>
        <div className="mark-seal-wrap">
          <span className="mark-seal">读</span>
          <span className="mark-seal-caption">不必读完一本书</span>
        </div>
        <p className="mark-note">一个安静的阅读处方笺。选一点心情，读一个短单元，留下一枚印章。</p>
        <div className="mark-rule" />
      </aside>

      <section className="checkin-panel">
        <StepRail step={step} onSelect={onSelectStep} />

        {step === 1 && (
          <div className="checkin-step">
            <header className="step-heading">
              <p className="kicker">01 / 此刻</p>
              <h1>此刻，你更接近哪一种？</h1>
              <p className="step-lede">不用解释。选一个最接近的就好。</p>
            </header>

            <div className="mood-grid">
              {MOODS.map((item, index) => {
                const selected = answers.moodId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="choice-card"
                    aria-pressed={selected}
                    onClick={() => onChange({ moodId: item.id })}
                    style={{ "--card-order": index } as CSSProperties}
                  >
                    <span className="choice-card__index">0{index + 1}</span>
                    <span className="choice-card__label">{item.label}</span>
                    <span className="choice-card__sub">{item.sub}</span>
                    {selected && <span className="choice-stamp" aria-hidden="true">印</span>}
                  </button>
                );
              })}
            </div>

            <div className="free-line">
              <label htmlFor="free-text" className="free-line__label">
                也可以留一句话
                <span>可以跳过</span>
              </label>
              <div className="free-line__row">
                <textarea
                  id="free-text"
                  className="free-line__input"
                  rows={2}
                  maxLength={60}
                  value={answers.freeText}
                  placeholder="例如：今天有点累，但还想再撑一会儿。"
                  onChange={(event) => onChange({ freeText: event.target.value })}
                />
                <span className="free-line__count" aria-hidden="true">
                  {answers.freeText.length}/60
                </span>
              </div>
            </div>

            {historyCount > 0 && (
              <p className="local-note">处方笺里已有 {historyCount} 次阅读，只保存在这台设备上。</p>
            )}

            <div className="step-actions">
              <span className="step-hint">选好之后，继续</span>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!answers.moodId}
                onClick={onNext}
              >
                下一步 <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="checkin-step">
            <header className="step-heading">
              <p className="kicker">02 / 想要</p>
              <h1>你想被怎样对待？</h1>
              <p className="step-lede">没有正确答案。选你此刻最想要的那个。</p>
            </header>

            <div className="need-grid">
              {NEEDS.map((item, index) => {
                const selected = answers.needId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="need-card"
                    aria-pressed={selected}
                    onClick={() => onChange({ needId: item.id })}
                    style={{ "--card-order": index } as CSSProperties}
                  >
                    <span className="need-card__index">0{index + 1}</span>
                    <span className="need-card__label">{item.label}</span>
                    <span className="need-card__sub">{item.sub}</span>
                    {selected && <span className="choice-stamp" aria-hidden="true">印</span>}
                  </button>
                );
              })}
            </div>

            <div className="step-actions step-actions--split">
              <button type="button" className="btn btn--text" onClick={onBack}>
                <ArrowLeft /> 上一步
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!answers.needId}
                onClick={onNext}
              >
                继续 <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="checkin-step">
            <header className="step-heading">
              <p className="kicker">03 / 时间</p>
              <h1>现在，有多少时间？</h1>
              <p className="step-lede">时间只是偏好，不是门槛。读不完也没关系。</p>
            </header>

            <fieldset className="field-group">
              <legend>可用时间</legend>
              <div className="time-grid">
                {TIMES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className="time-card"
                    aria-pressed={answers.minutes === item.value}
                    onClick={() => onChange({ minutes: item.value })}
                  >
                    <span className="time-card__number">{item.value}</span>
                    <span className="time-card__unit">分钟</span>
                    <span className="time-card__sub">{item.sub}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend>想读什么</legend>
              <div className="form-chips">
                {FORMS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className="chip chip--large"
                    aria-pressed={answers.form === item.value}
                    onClick={() => onChange({ form: item.value })}
                  >
                    <span>{item.label}</span>
                    <small>{item.sub}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend>不想碰到的内容</legend>
              <p className="field-hint">选中后会直接避开，不只是在排序里降权。</p>
              <div className="form-chips form-chips--compact">
                {CONTENT_WARNINGS.map((warning) => (
                  <button
                    key={warning}
                    type="button"
                    className="chip"
                    aria-pressed={answers.avoid.includes(warning)}
                    onClick={() => toggleWarning(warning)}
                  >
                    {warning}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="summary-strip" aria-live="polite">
              <span className="summary-strip__label">这次的处方</span>
              <span>{mood?.label ?? "未选状态"}</span>
              <span className="summary-strip__dot">·</span>
              <span>{need?.label ?? "未选需求"}</span>
              <span className="summary-strip__dot">·</span>
              <span>{time?.label ?? "15 分钟"}</span>
              <span className="summary-strip__dot">·</span>
              <span>{form?.label ?? "随便"}</span>
              {answers.avoid.length > 0 && (
                <>
                  <span className="summary-strip__dot">·</span>
                  <span>避开 {answers.avoid.join("、")}</span>
                </>
              )}
            </div>

            <div className="step-actions step-actions--split">
              <button type="button" className="btn btn--text" onClick={onBack}>
                <ArrowLeft /> 上一步
              </button>
              <button type="button" className="btn btn--primary" onClick={onStart}>
                看看读什么 <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
