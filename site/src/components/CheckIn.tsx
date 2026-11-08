import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  CONTENT_WARNINGS,
  FORMS,
  MOOD_BRANCHES,
  MOOD_BY_ID,
  MOODS,
  NEED_BY_ID,
  TIMES,
  orderedNeeds,
} from "../data/moods";
import type { Answers, ContentWarning, MoodBranch, MoodLeaf, NeedOption } from "../lib/types";
import { inferFreeInput, suggestedLeaves } from "../lib/freeInput";
import { ArrowLeft, ArrowRight } from "./icons";

interface StepRailProps {
  step: number;
  branchId: Answers["branchId"];
  onSelect: (step: number) => void;
}

function StepRail({ step, branchId, onSelect }: StepRailProps) {
  const labels = ["此刻", "更具体", "想要", "时间"];
  return (
    <ol className="step-rail" aria-label="签到进度">
      {labels.map((label, index) => {
        const number = index + 1;
        const state = number === step ? "current" : number < step ? "done" : "todo";
        const skipped = number === 2 && branchId === "unclear";
        return (
          <li
            key={label}
            className={`step-rail__item is-${state}${skipped ? " is-skipped" : ""}`}
          >
            <button
              type="button"
              className="step-rail__button"
              onClick={() => onSelect(number)}
              disabled={number >= step || skipped}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="step-rail__number">{skipped ? "略" : `0${number}`}</span>
              <span className="step-rail__label">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function PrescriptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={`prescription-row${value ? " is-filled" : ""}`}>
      <dt>{label}</dt>
      <dd key={value}>{value || "—"}</dd>
    </div>
  );
}

function Prescription({
  answers,
  moodLabel,
  branchLabel,
  needLabel,
}: {
  answers: Answers;
  moodLabel: string;
  branchLabel: string;
  needLabel: string;
}) {
  const free = answers.freeText.trim();
  return (
    <div className="prescription" aria-label="实时处方签">
      <div className="prescription__head">
        <span>处方签</span>
        <span className="prescription__live">正在写</span>
      </div>
      <dl className="prescription__rows">
        <PrescriptionRow
          label="此刻"
          value={moodLabel || (free ? "按一句话来配" : branchLabel)}
        />
        <PrescriptionRow label="想要" value={needLabel} />
        <PrescriptionRow
          label="时间"
          value={`${answers.minutes} 分钟${
            answers.form === "any" ? "" : ` · ${FORMS.find((item) => item.value === answers.form)?.label ?? ""}`
          }`}
        />
      </dl>
      {free && <p className="prescription__free">“{free.length > 32 ? `${free.slice(0, 32)}…` : free}”</p>}
      <p className="prescription__hint">
        {free ? "这句话会进入匹配，不会上传。" : "不必说得准确，选一个最接近的就好。"}
      </p>
    </div>
  );
}

interface CheckInProps {
  step: number;
  answers: Answers;
  historyCount: number;
  onChange: (patch: Partial<Answers>) => void;
  onGoToStep: (step: number) => void;
  onStart: () => void;
  onDirectStart: () => void;
}

const STEP_TITLES: Record<number, string> = {
  1: "此刻，你更接近哪一种？",
  2: "更像哪一种？",
  3: "你想被怎样对待？",
  4: "现在，有多少时间？",
};

export function CheckIn({
  step,
  answers,
  historyCount,
  onChange,
  onGoToStep,
  onStart,
  onDirectStart,
}: CheckInProps) {
  const [showMoreNeeds, setShowMoreNeeds] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const advanceTimer = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);

  const branch = MOOD_BRANCHES.find((item) => item.id === answers.branchId);
  const leaves = branch ? MOODS.filter((mood) => mood.branch === branch.id) : [];
  const mood = MOOD_BY_ID.get(answers.moodId);
  const need = NEED_BY_ID.get(answers.needId);
  const time = TIMES.find((item) => item.value === answers.minutes);
  const form = FORMS.find((item) => item.value === answers.form);
  const inference = useMemo(() => inferFreeInput(answers.freeText), [answers.freeText]);
  const leafSuggestions = useMemo(() => suggestedLeaves(inference), [inference]);
  const needs = useMemo(() => orderedNeeds(answers.branchId), [answers.branchId]);
  const primaryNeeds = needs.slice(0, 4);
  const extraNeeds = needs.slice(4);

  useEffect(() => {
    if (answers.needId && extraNeeds.some((item) => item.id === answers.needId)) {
      setShowMoreNeeds(true);
    }
  }, [answers.needId, extraNeeds]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const title = step === 2 && branch ? `${branch.label}的时候，${STEP_TITLES[2]}` : STEP_TITLES[step];
    setAnnouncement(`第 ${step} 步，${title}`);
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step, branch]);

  const scheduleStep = (nextStep: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      onGoToStep(nextStep);
    }, 280);
  };

  const cancelScheduled = () => {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const handleBranch = (nextBranch: MoodBranch) => {
    onChange({ branchId: nextBranch.id, moodId: "" });
    setShowMoreNeeds(false);
    scheduleStep(2);
  };

  const handleSkipMood = () => {
    onChange({ branchId: "unclear", moodId: "unclear" });
    setShowMoreNeeds(false);
    scheduleStep(3);
  };

  const handleLeaf = (leaf: MoodLeaf) => {
    onChange({ branchId: leaf.branch, moodId: leaf.id });
    scheduleStep(3);
  };

  const handleNeed = (nextNeed: NeedOption) => {
    onChange({ needId: nextNeed.id });
    scheduleStep(4);
  };

  const toggleSuggestion = (leaf: MoodLeaf) => {
    cancelScheduled();
    if (answers.moodId === leaf.id) {
      onChange({ moodId: "", branchId: leaf.branch });
      return;
    }
    onChange({ moodId: leaf.id, branchId: leaf.branch });
  };

  const toggleWarning = (warning: ContentWarning) => {
    const next = answers.avoid.includes(warning)
      ? answers.avoid.filter((item) => item !== warning)
      : [...answers.avoid, warning];
    onChange({ avoid: next });
  };

  const handleBack = () => {
    cancelScheduled();
    if (step === 3 && answers.branchId === "unclear") {
      onGoToStep(1);
      return;
    }
    if (step > 1) onGoToStep(step - 1);
  };

  const handlePrimary = () => {
    cancelScheduled();
    if (step === 1) {
      if (answers.moodId && answers.moodId !== "unclear") {
        onGoToStep(3);
      } else if (answers.branchId && answers.branchId !== "unclear") {
        onGoToStep(2);
      } else if (answers.freeText.trim()) {
        onDirectStart();
      } else {
        onChange({ branchId: "unclear", moodId: "unclear" });
        onGoToStep(3);
      }
      return;
    }
    if (step === 2) {
      onGoToStep(3);
      return;
    }
    if (step === 3) {
      if (!answers.needId) onChange({ needId: "any" });
      onGoToStep(4);
      return;
    }
    onStart();
  };

  const primaryLabel =
    step === 1
      ? answers.freeText.trim() &&
        (!answers.branchId || answers.branchId === "unclear")
        ? "就按这句话配"
        : answers.branchId && answers.branchId !== "unclear"
          ? "下一步"
          : "说不清，先跳过"
      : step === 2
        ? "跳过，先选想要"
        : step === 3
          ? "都行，继续"
          : "生成处方";

  const moodLabel = branch && mood ? `${branch.label} · ${mood.label}` : mood?.label ?? "";
  const branchLabel = branch?.label ?? "";
  const needLabel = need?.label ?? "";

  return (
    <div className="checkin">
      <aside className="checkin-aside">
        <div className="aside-brand">
          <div className="mark-stack mark-stack--compact" aria-hidden="true">
            <span className="mark-stack__char">读</span>
            <span className="mark-stack__char mark-stack__char--offset">完</span>
          </div>
          <div className="mark-seal-wrap">
            <span className="mark-seal" aria-hidden="true">读</span>
            <span className="mark-seal-caption">不必读完一本书</span>
          </div>
        </div>
        <Prescription
          answers={answers}
          moodLabel={moodLabel}
          branchLabel={branchLabel}
          needLabel={needLabel}
        />
        <p className="mark-note">
          一个安静的阅读处方笺。选一点心情，读一个短单元，留下一枚印章。
        </p>
      </aside>

      <section className="checkin-panel">
        <StepRail
          step={step}
          branchId={answers.branchId}
          onSelect={(nextStep) => {
            cancelScheduled();
            onGoToStep(nextStep);
          }}
        />
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <div className="checkin-step" key={step}>
          {step === 1 && (
            <>
              <header className="step-heading">
                <p className="kicker">01 / 此刻</p>
                <h1 ref={headingRef} tabIndex={-1}>
                  此刻，你更接近哪一种？
                </h1>
                <p className="step-lede">不用解释。选一个最接近的就好，也可以直接写一句话。</p>
              </header>

              <div className="branch-grid">
                {MOOD_BRANCHES.map((item, index) => {
                  const selected = answers.branchId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="branch-card"
                      aria-pressed={selected}
                      onClick={() => handleBranch(item)}
                      style={{ "--card-order": index } as CSSProperties}
                    >
                      <span className="branch-card__index">0{index + 1}</span>
                      <span className="branch-card__label">{item.label}</span>
                      <span className="branch-card__sub">{item.sub}</span>
                      <span className="branch-card__leaves">
                        {item.leaves
                          .map((id) => MOOD_BY_ID.get(id)?.label)
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                      {selected && <span className="choice-stamp" aria-hidden="true">印</span>}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="branch-card branch-card--skip"
                  aria-pressed={answers.branchId === "unclear"}
                  onClick={handleSkipMood}
                >
                  <span className="branch-card__index">—</span>
                  <span className="branch-card__label">说不清</span>
                  <span className="branch-card__sub">先跳过，直接去选想要的感觉</span>
                  {answers.branchId === "unclear" && (
                    <span className="choice-stamp" aria-hidden="true">印</span>
                  )}
                </button>
              </div>

              <div className="free-line">
                <label htmlFor="free-text" className="free-line__label">
                  或者直接说一句
                  <span>一句话也能开始</span>
                </label>
                <div className="free-line__row">
                  <textarea
                    id="free-text"
                    className="free-line__input"
                    rows={2}
                    maxLength={80}
                    value={answers.freeText}
                    placeholder="例如：今天有点累，但还想再撑一会儿。"
                    onChange={(event) => onChange({ freeText: event.target.value })}
                  />
                  <span className="free-line__count" aria-hidden="true">
                    {answers.freeText.length}/80
                  </span>
                </div>

                {inference.themes.length > 0 && (
                  <div className="free-hints">
                    <div className="free-hints__line">
                      <span className="free-hints__label">听起来更像</span>
                      {leafSuggestions.length > 0 ? (
                        leafSuggestions.map((leaf) => (
                          <button
                            key={leaf.id}
                            type="button"
                            className="chip chip--suggest"
                            aria-pressed={answers.moodId === leaf.id}
                            onClick={() => toggleSuggestion(leaf)}
                          >
                            {leaf.label}
                          </button>
                        ))
                      ) : (
                        <span className="free-hints__none">还没对上具体心情，也可以直接开始</span>
                      )}
                    </div>
                    <div className="free-hints__line">
                      <span className="free-hints__label">你提到</span>
                      {inference.themes.map((theme) => (
                        <span key={theme} className="tag tag--quiet">
                          {theme}
                        </span>
                      ))}
                    </div>
                    <p className="free-hints__note">标签可以点选修改；不选心情也能继续。</p>
                  </div>
                )}

                {answers.freeText.trim() && answers.branchId && (
                  <button type="button" className="link-button free-line__direct" onClick={onDirectStart}>
                    只按这句话配，不再选时间和体裁
                  </button>
                )}
              </div>

              {historyCount > 0 && (
                <p className="local-note">处方笺里已有 {historyCount} 次阅读，只保存在这台设备上。</p>
              )}
            </>
          )}

          {step === 2 && branch && (
            <>
              <header className="step-heading">
                <p className="kicker">02 / 更具体</p>
                <h1 ref={headingRef} tabIndex={-1}>
                  {branch.label}的时候，更像哪一种？
                </h1>
                <p className="step-lede">不用选得特别准。选一个最接近的，也可以跳过。</p>
              </header>

              <div className="leaf-grid">
                {leaves.map((leaf, index) => {
                  const selected = answers.moodId === leaf.id;
                  return (
                    <button
                      key={leaf.id}
                      type="button"
                      className="leaf-card"
                      aria-pressed={selected}
                      onClick={() => handleLeaf(leaf)}
                      style={{ "--card-order": index } as CSSProperties}
                    >
                      <span className="leaf-card__index">0{index + 1}</span>
                      <span className="leaf-card__label">{leaf.label}</span>
                      <span className="leaf-card__sub">{leaf.sub}</span>
                      {selected && <span className="choice-stamp" aria-hidden="true">印</span>}
                    </button>
                  );
                })}
              </div>

              <div className="inline-back">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    cancelScheduled();
                    onGoToStep(1);
                  }}
                >
                  <ArrowLeft /> 换个方向
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <header className="step-heading">
                <p className="kicker">03 / 想要</p>
                <h1 ref={headingRef} tabIndex={-1}>
                  你想被怎样对待？
                </h1>
                <p className="step-lede">
                  {answers.branchId === "unclear"
                    ? "没选心境也没关系。选一个你现在最想要的，或者都行。"
                    : `按“${branch?.label ?? "此刻"}”帮你排了顺序。没有正确答案。`}
                </p>
              </header>

              <div className="need-grid need-grid--primary">
                {primaryNeeds.map((item, index) => {
                  const selected = answers.needId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="need-card"
                      aria-pressed={selected}
                      onClick={() => handleNeed(item)}
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

              <div className="more-choice">
                <button
                  type="button"
                  className="btn btn--text"
                  aria-expanded={showMoreNeeds}
                  onClick={() => setShowMoreNeeds((value) => !value)}
                >
                  {showMoreNeeds ? "收起更多选择" : "更多选择"}
                </button>
                {showMoreNeeds && (
                  <div className="need-grid need-grid--extra">
                    {extraNeeds.map((item, index) => {
                      const selected = answers.needId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="need-card need-card--compact"
                          aria-pressed={selected}
                          onClick={() => handleNeed(item)}
                          style={{ "--card-order": index } as CSSProperties}
                        >
                          <span className="need-card__label">{item.label}</span>
                          <span className="need-card__sub">{item.sub}</span>
                          {selected && <span className="choice-stamp" aria-hidden="true">印</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <header className="step-heading">
                <p className="kicker">04 / 时间</p>
                <h1 ref={headingRef} tabIndex={-1}>
                  现在，有多少时间？
                </h1>
                <p className="step-lede">时间和体裁只是偏好，不是门槛。读不完也没关系。</p>
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

              <details className="more-prefs">
                <summary>更多偏好（可选）</summary>
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
              </details>

              <div className="summary-strip" aria-live="polite">
                <span className="summary-strip__label">这次的处方</span>
                <span>{moodLabel || "未选状态"}</span>
                <span className="summary-strip__dot">·</span>
                <span>{need?.label ?? "都行"}</span>
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
            </>
          )}
        </div>

        <div className="checkin-bar">
          <div className="checkin-bar__summary" aria-live="polite">
            <span>{moodLabel || branchLabel || (answers.freeText.trim() ? "按一句话" : "此刻未选")}</span>
            <span className="checkin-bar__dot">·</span>
            <span>{needLabel || "想要未选"}</span>
            <span className="checkin-bar__dot">·</span>
            <span>{answers.minutes} 分钟</span>
          </div>
          <div className="checkin-bar__actions">
            {step > 1 && (
              <button
                type="button"
                className="icon-button checkin-bar__back"
                onClick={handleBack}
                aria-label="上一步"
              >
                <ArrowLeft />
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={handlePrimary}>
              {primaryLabel} <ArrowRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
