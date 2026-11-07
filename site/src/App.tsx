import { useEffect, useMemo, useState } from "react";
import { MOODS } from "./data/moods";
import { TEXTS } from "./data/texts";
import type { Answers, AppView, HistoryRecord, TextUnit } from "./lib/types";
import { rankTexts, type MatchResult } from "./lib/match";
import {
  loadHistory,
  loadPrefs,
  recentUnitIds,
  saveHistory,
  savePrefs,
} from "./lib/storage";
import { CheckIn } from "./components/CheckIn";
import { Results } from "./components/Results";
import { Reading } from "./components/Reading";
import { Finish } from "./components/Finish";
import { HistoryView } from "./components/HistoryView";
import { SourceDrawer } from "./components/SourceDrawer";
import { SiteHeader } from "./components/SiteHeader";

interface ReadingPayload {
  durationSeconds: number;
  readingNotes: string[];
}

export default function App() {
  const [prefs] = useState(loadPrefs);
  const [answers, setAnswers] = useState<Answers>({
    moodId: "",
    needId: "",
    minutes: prefs.minutes,
    form: prefs.form,
    freeText: "",
    avoid: prefs.avoid,
  });
  const [step, setStep] = useState(1);
  const [view, setView] = useState<AppView>("checkin");
  const [history, setHistory] = useState<HistoryRecord[]>(loadHistory);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [activeUnit, setActiveUnit] = useState<TextUnit | null>(null);
  const [readingPayload, setReadingPayload] = useState<ReadingPayload>({
    durationSeconds: 0,
    readingNotes: [],
  });
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const preMoodLabel = useMemo(
    () => MOODS.find((item) => item.id === answers.moodId)?.label ?? "此刻",
    [answers.moodId],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, step]);

  const handleChange = (patch: Partial<Answers>) => {
    setAnswers((current) => ({ ...current, ...patch }));
  };

  const handleNext = () => {
    setStep((current) => Math.min(3, current + 1));
  };

  const handleBack = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSelectStep = (nextStep: number) => {
    if (nextStep <= step) setStep(nextStep);
  };

  const handleStart = () => {
    const nextPrefs = {
      minutes: answers.minutes,
      form: answers.form,
      avoid: answers.avoid,
    };
    savePrefs(nextPrefs);
    const nextResult = rankTexts(TEXTS, answers, recentUnitIds(history));
    setResult(nextResult);
    setView("results");
  };

  const handleRematch = () => {
    setView("checkin");
    setStep(1);
  };

  const handleRead = (unit: TextUnit) => {
    setActiveUnit(unit);
    setReadingPayload({ durationSeconds: 0, readingNotes: [] });
    setView("reading");
  };

  const handleExitReading = () => {
    setActiveUnit(null);
    setView("results");
  };

  const handleReadingFinish = (payload: ReadingPayload) => {
    setReadingPayload(payload);
    setView("finish");
  };

  const handleSave = (record: HistoryRecord) => {
    const latest = loadHistory();
    if (latest.some((item) => item.id === record.id)) {
      setHistory(latest);
      return;
    }
    const next = [record, ...latest];
    saveHistory(next);
    setHistory(next);
  };

  const handleAgain = () => {
    const latest = loadHistory();
    setHistory(latest);
    setResult(rankTexts(TEXTS, answers, recentUnitIds(latest)));
    setActiveUnit(null);
    setView("results");
  };

  const handleHome = () => {
    const latest = loadPrefs();
    setAnswers({
      moodId: "",
      needId: "",
      minutes: latest.minutes,
      form: latest.form,
      freeText: "",
      avoid: latest.avoid,
    });
    setStep(1);
    setActiveUnit(null);
    setView("checkin");
  };

  const showHeader = view === "checkin" || view === "results";

  return (
    <div className="site-shell" data-view={view}>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      {showHeader && (
        <SiteHeader
          historyCount={history.length}
          onHome={handleHome}
          onHistory={() => setView("history")}
          onSources={() => setSourcesOpen(true)}
        />
      )}

      <main className="site-main" id="main-content">
        {view === "checkin" && (
          <CheckIn
            step={step}
            answers={answers}
            historyCount={history.length}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
            onSelectStep={handleSelectStep}
            onStart={handleStart}
          />
        )}

        {view === "results" && result && (
          <Results
            result={result}
            answers={answers}
            onRead={handleRead}
            onRematch={handleRematch}
            onSources={() => setSourcesOpen(true)}
          />
        )}

        {view === "reading" && activeUnit && (
          <Reading
            unit={activeUnit}
            onExit={handleExitReading}
            onFinish={handleReadingFinish}
          />
        )}

        {view === "finish" && activeUnit && (
          <Finish
            unit={activeUnit}
            preMoodLabel={preMoodLabel}
            readingNotes={readingPayload.readingNotes}
            durationSeconds={readingPayload.durationSeconds}
            onSave={handleSave}
            onAgain={handleAgain}
            onHome={handleHome}
            onSources={() => setSourcesOpen(true)}
          />
        )}

        {view === "history" && (
          <HistoryView
            records={history}
            onBack={handleHome}
            onSources={() => setSourcesOpen(true)}
          />
        )}
      </main>

      {(view === "checkin" || view === "results") && (
        <footer className="site-footer">
          <span>读完 · 不读完一本书，也可以读完一个晚上。</span>
          <span>公共版权文本 · 本地保存 · 无账号</span>
        </footer>
      )}

      {sourcesOpen && <SourceDrawer onClose={() => setSourcesOpen(false)} />}
    </div>
  );
}
