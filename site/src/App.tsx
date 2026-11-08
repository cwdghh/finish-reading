import { useEffect, useMemo, useState } from "react";
import { MOOD_BY_ID } from "./data/moods";
import { TEXTS } from "./data/texts";
import type { Answers, AppView, HistoryRecord, TextUnit } from "./lib/types";
import { makeBaseSeed, makeBatchSeed, rankTexts, type MatchResult } from "./lib/match";
import {
  getSessionNonce,
  loadBatchCache,
  loadHistory,
  loadPrefs,
  recentUnitIds,
  recordShown,
  saveBatchCache,
  saveHistory,
  savePrefs,
  shownUnitIds,
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

const BATCH_SIZE = 9;

function todayKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export default function App() {
  const [prefs] = useState(loadPrefs);
  const [answers, setAnswers] = useState<Answers>({
    branchId: "",
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
  const [batchIndex, setBatchIndex] = useState(0);
  const [activeUnit, setActiveUnit] = useState<TextUnit | null>(null);
  const [readingPayload, setReadingPayload] = useState<ReadingPayload>({
    durationSeconds: 0,
    readingNotes: [],
  });
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sessionNonce = useMemo(getSessionNonce, []);

  const preMoodLabel = useMemo(
    () =>
      MOOD_BY_ID.get(answers.moodId)?.label ??
      (answers.freeText.trim() ? "按一句话来配" : "未选状态"),
    [answers.moodId, answers.freeText],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, step]);

  const handleChange = (patch: Partial<Answers>) => {
    setAnswers((current) => ({ ...current, ...patch }));
  };

  const generateBatch = (
    nextBatchIndex: number,
    options: { excludeIds?: string[] } = {},
  ) => {
    const baseSeed = makeBaseSeed(answers, todayKey());
    const seed = makeBatchSeed(baseSeed, sessionNonce, nextBatchIndex);
    const cached = loadBatchCache();
    const useCached = nextBatchIndex === 0 && cached?.seed === baseSeed;
    const next = rankTexts(TEXTS, answers, {
      seed,
      recentIds: recentUnitIds(history),
      shownIds: useCached ? [] : shownUnitIds(),
      excludeIds: options.excludeIds ?? [],
      preferredIds: useCached ? cached.ids : undefined,
      batchSize: BATCH_SIZE,
      batchIndex: nextBatchIndex,
    });
    setResult(next);
    setBatchIndex(nextBatchIndex);
    setView("results");
    recordShown(next.items.map((item) => item.unit.id));
    if (nextBatchIndex === 0) {
      saveBatchCache({
        seed,
        ids: next.items.map((item) => item.unit.id),
        createdAt: new Date().toISOString(),
        batchIndex: 0,
      });
    }
  };

  const handleStart = () => {
    savePrefs({ minutes: answers.minutes, form: answers.form, avoid: answers.avoid });
    generateBatch(0);
  };

  const handleShuffle = () => {
    if (!result) return;
    generateBatch(batchIndex + 1, {
      excludeIds: result.items.map((item) => item.unit.id),
    });
  };

  const handleAdjust = () => {
    setView("checkin");
    setStep(4);
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
    generateBatch(0);
  };

  const handleHome = () => {
    const latest = loadPrefs();
    setAnswers({
      branchId: "",
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
            onGoToStep={setStep}
            onStart={handleStart}
            onDirectStart={handleStart}
          />
        )}

        {view === "results" && result && (
          <Results
            result={result}
            answers={answers}
            onRead={handleRead}
            onAdjust={handleAdjust}
            onShuffle={handleShuffle}
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
            onHistory={() => setView("history")}
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
