import { FORM_LABELS, MOOD_BY_ID, NEED_BY_ID } from "../data/moods";
import type {
  Answers,
  MatchBreakdown,
  MatchWeights,
  MoodLeaf,
  RankedUnit,
  ResultLabel,
  TextUnit,
} from "./types";
import { cosineSimilarity } from "./textStats";
import { inferFreeInput, type FreeInference } from "./freeInput";

const DEFAULT_BATCH_SIZE = 9;

const MOOD_WEIGHTS: MatchWeights = {
  need: 0.25,
  mood: 0.2,
  free: 0.15,
  time: 0.15,
  form: 0.1,
  affect: 0.1,
  difficulty: 0.05,
};

const NEUTRAL_WEIGHTS: MatchWeights = {
  need: 0.18,
  mood: 0.05,
  free: 0.36,
  time: 0.15,
  form: 0.1,
  affect: 0.05,
  difficulty: 0.11,
};

const NEED_REASONS: Record<string, string> = {
  comfort: "不急着给答案，句子慢，像有人陪着坐一会儿。",
  laugh: "有一点轻巧的好笑，不拿你开涮。",
  insight: "会把话说透一点，但不训人。",
  company: "有人在场，读起来不显得空。",
  beauty: "景物写得细，能把眼睛从现实里挪开。",
  any: "没有特别限定，读起来不费劲。",
};

const NEUTRAL_MOOD: MoodLeaf = {
  id: "unclear",
  branch: "unclear",
  label: "未选状态",
  sub: "",
  valence: 0.5,
  arousal: 0.5,
  affinity: [],
  difficulty: 2,
};

export interface MatchOptions {
  seed: string;
  recentIds?: string[];
  shownIds?: string[];
  excludeIds?: string[];
  preferredIds?: string[];
  batchSize?: number;
  batchIndex?: number;
}

export interface MatchResult {
  items: RankedUnit[];
  librarySize: number;
  poolSize: number;
  removedByWarnings: number;
  removedRecent: number;
  removedShown: number;
  recentFallback: boolean;
  neutral: boolean;
  weak: boolean;
  freeThemes: string[];
  freeLeafLabels: string[];
  freeHitCount: number;
  weights: MatchWeights;
  seed: string;
  batchIndex: number;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScoredUnit {
  unit: TextUnit;
  base: number;
  breakdown: MatchBreakdown;
  freeHit: boolean;
}

function freeScore(
  unit: TextUnit,
  inference: FreeInference,
  hasText: boolean,
): { score: number; hit: boolean } {
  if (!hasText) return { score: 0.55, hit: false };
  const targets = inference.tags;
  const unitTags = new Set([...unit.moodTags, ...unit.needTags]);
  let keywordMatches = 0;
  targets.forEach((tag) => {
    if (unitTags.has(tag)) keywordMatches += 1;
  });
  const keywordScore =
    targets.length > 0 ? clamp(keywordMatches / Math.min(3, targets.length), 0, 1) : 0;
  const corpus = [
    unit.workTitle,
    unit.moodTags.join(" "),
    unit.needTags.join(" "),
    unit.moodDescription,
    unit.whyItFits,
  ].join("。");
  const similarity = clamp(
    cosineSimilarity(unit.workTitle + "。" + inference.themes.join("。"), corpus) * 2.2,
    0,
    1,
  );
  return {
    score: clamp(0.1 + keywordScore * 0.62 + similarity * 0.34, 0, 1),
    hit: keywordMatches > 0 || similarity > 0.24,
  };
}

function moodScore(unit: TextUnit, mood: MoodLeaf, neutral: boolean): number {
  if (neutral || mood.affinity.length === 0) return 0.5;
  const tags = new Set(unit.moodTags);
  let matched = 0;
  mood.affinity.forEach((tag) => {
    if (tags.has(tag)) matched += 1;
  });
  return clamp(0.3 + (matched / 2.4) * 0.7, 0, 1);
}

function needScore(unit: TextUnit, needTag: string | null): number {
  if (!needTag) return 0.6;
  return unit.needTags.includes(needTag) ? 1 : 0.2;
}

function timeScore(minutes: number, available: number): number {
  if (minutes <= available) {
    return 1 - ((available - minutes) / available) * 0.15;
  }
  return clamp(available / minutes - 0.1, 0.22, 0.9);
}

function formScore(unit: TextUnit, form: Answers["form"]): number {
  if (form === "any") return 0.72;
  return unit.form === form ? 1 : 0.42;
}

function affectScore(unit: TextUnit, mood: MoodLeaf, neutral: boolean): number {
  if (neutral) return 0.5;
  const distance =
    Math.abs(unit.valence - mood.valence) * 0.65 +
    Math.abs(unit.arousal - mood.arousal) * 0.35;
  return clamp(1 - distance * 0.85, 0.12, 1);
}

function difficultyScore(unit: TextUnit, target: number): number {
  return 1 - Math.abs(unit.difficulty - target) / 2;
}

function buildBreakdown(
  unit: TextUnit,
  answers: Answers,
  mood: MoodLeaf,
  needTag: string | null,
  inference: FreeInference,
  neutral: boolean,
): MatchBreakdown {
  const free = freeScore(unit, inference, answers.freeText.trim().length > 0);
  return {
    need: needScore(unit, needTag),
    mood: moodScore(unit, mood, neutral),
    free: free.score,
    time: timeScore(unit.readingMinutes, answers.minutes),
    form: formScore(unit, answers.form),
    affect: affectScore(unit, mood, neutral),
    difficulty: difficultyScore(unit, mood.difficulty),
  };
}

function weighted(breakdown: MatchBreakdown, weights: MatchWeights): number {
  return (
    breakdown.need * weights.need +
    breakdown.mood * weights.mood +
    breakdown.free * weights.free +
    breakdown.time * weights.time +
    breakdown.form * weights.form +
    breakdown.affect * weights.affect +
    breakdown.difficulty * weights.difficulty
  );
}

function pickOne<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

interface ReasonContext {
  answers: Answers;
  mood: MoodLeaf;
  neutral: boolean;
  needLabel: string | null;
  needId: string | null;
  inference: FreeInference;
  weights: MatchWeights;
  tooLong: boolean;
}

function makeReason(item: ScoredUnit, context: ReasonContext): string {
  const { unit, breakdown } = item;
  const hash = hashString(unit.id + context.answers.moodId + context.answers.needId);
  const dimensions = (
    [
      { key: "need" as const, value: breakdown.need * context.weights.need },
      { key: "mood" as const, value: breakdown.mood * context.weights.mood },
      { key: "free" as const, value: breakdown.free * context.weights.free },
      { key: "time" as const, value: breakdown.time * context.weights.time },
      { key: "form" as const, value: breakdown.form * context.weights.form },
      { key: "affect" as const, value: breakdown.affect * context.weights.affect },
    ] as const
  )
    .filter((entry) => {
      if (entry.key === "need") return Boolean(context.needId) && breakdown.need >= 0.9;
      if (entry.key === "mood") return !context.neutral && breakdown.mood >= 0.72;
      if (entry.key === "free") return item.freeHit && context.answers.freeText.trim().length > 0;
      if (entry.key === "time") return breakdown.time >= 0.88;
      if (entry.key === "form") return context.answers.form !== "any" && breakdown.form >= 0.95;
      return !context.neutral && breakdown.affect >= 0.78;
    })
    .sort((a, b) => b.value - a.value);

  const startIndex = dimensions.length > 0 ? hash % dimensions.length : 0;
  const rotated =
    dimensions.length > 0
      ? [...dimensions.slice(startIndex), ...dimensions.slice(0, startIndex)]
      : [];
  const clauses: string[] = [];

  if (rotated.length > 0) {
    const entry = rotated[0];
    if (entry.key === "need" && context.needLabel) {
      const reason = NEED_REASONS[context.needId ?? ""] ?? "";
      clauses.push(
        pickOne(
          [
            `你选了“${context.needLabel}”，${reason}`,
            `按“${context.needLabel}”来找，${reason}`,
            `这篇接住的是“${context.needLabel}”：${reason}`,
          ],
          mulberry32(hash + 1),
        ),
      );
    } else if (entry.key === "mood") {
      const tag = unit.moodTags[0] ?? "安静";
      clauses.push(
        pickOne(
          [
            `“${context.mood.label}”和它的${tag}相近。`,
            `它的${tag}，离你此刻的状态不远。`,
            `这篇的${tag}，正好对上“${context.mood.label}”。`,
          ],
          mulberry32(hash + 2),
        ),
      );
    } else if (entry.key === "free") {
      const word =
        context.inference.matchedWords[0] ?? context.answers.freeText.trim().slice(0, 8);
      clauses.push(
        pickOne(
          [
            `你写到“${word}”，这篇会接住它。`,
            `从“${word}”这个词出发，这篇是个合适的落点。`,
            `你写下的“${word}”，在它的${unit.moodTags[0] ?? "安静"}里能找到回声。`,
          ],
          mulberry32(hash + 3),
        ),
      );
    } else if (entry.key === "time") {
      clauses.push(
        context.tooLong
          ? `比这次的时间多 ${unit.readingMinutes - context.answers.minutes} 分钟，可以慢慢读。`
          : pickOne(
              [
                `${unit.readingMinutes} 分钟，正好。`,
                `时间刚好：${unit.readingMinutes} 分钟。`,
                `不长，${unit.readingMinutes} 分钟。`,
              ],
              mulberry32(hash + 4),
            ),
      );
    } else if (entry.key === "form") {
      clauses.push(
        pickOne(
          [
            `你想读${FORM_LABELS[unit.form]}，这篇正好是。`,
            `按${FORM_LABELS[unit.form]}来挑，就是它了。`,
            `这一篇是${FORM_LABELS[unit.form]}，合你的偏好。`,
          ],
          mulberry32(hash + 5),
        ),
      );
    } else {
      clauses.push(
        pickOne(
          [
            `它的${unit.weather}，和此刻的你接近。`,
            `读起来会是${unit.weather}的感觉。`,
            `${unit.weather}的气息，离你此刻不远。`,
          ],
          mulberry32(hash + 6),
        ),
      );
    }
  }

  if (context.tooLong && !clauses.some((clause) => clause.includes("可以慢慢读"))) {
    clauses.push(`比这次的时间稍长，可以慢慢读。`);
  }
  if (clauses.length < 2) {
    clauses.push(unit.whyItFits);
  }
  return clauses.slice(0, 2).join("");
}

export function labelForScore(score: number): ResultLabel {
  if (score >= 0.82) return "很合";
  if (score >= 0.7) return "挺合";
  return "可以看看";
}

export function rankTexts(
  texts: TextUnit[],
  answers: Answers,
  options: MatchOptions,
): MatchResult {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const mood = MOOD_BY_ID.get(answers.moodId) ?? NEUTRAL_MOOD;
  const neutral =
    answers.moodId === "" || answers.moodId === "unclear" || mood.branch === "unclear";
  const effectiveMood = neutral ? NEUTRAL_MOOD : mood;
  const need = NEED_BY_ID.get(answers.needId);
  const needTag = need?.tag ?? null;
  const inference = inferFreeInput(answers.freeText);
  const weights = neutral ? NEUTRAL_WEIGHTS : MOOD_WEIGHTS;
  const avoid = new Set(answers.avoid);

  const safe = texts.filter((unit) => !unit.contentWarnings.some((warning) => avoid.has(warning)));
  const removedByWarnings = texts.length - safe.length;

  let pool = safe;
  let recentFallback = false;
  const recentIds = options.recentIds ?? [];
  if (recentIds.length > 0) {
    const fresh = safe.filter((unit) => !recentIds.includes(unit.id));
    if (fresh.length >= Math.max(batchSize * 2, 14)) {
      pool = fresh;
    } else {
      recentFallback = true;
    }
  }
  const removedRecent = safe.length - pool.length;

  let removedShown = 0;
  const shownIds = options.shownIds ?? [];
  if (shownIds.length > 0) {
    const fresh = pool.filter((unit) => !shownIds.includes(unit.id));
    if (fresh.length >= Math.max(batchSize * 2, 16)) {
      removedShown = pool.length - fresh.length;
      pool = fresh;
    }
  }

  const excludeIds = options.excludeIds ?? [];
  if (excludeIds.length > 0) {
    const fresh = pool.filter((unit) => !excludeIds.includes(unit.id));
    if (fresh.length >= batchSize) {
      pool = fresh;
    }
  }

  const scored: ScoredUnit[] = pool.map((unit) => {
    const breakdown = buildBreakdown(unit, answers, effectiveMood, needTag, inference, neutral);
    const free = freeScore(unit, inference, answers.freeText.trim().length > 0);
    return {
      unit,
      base: weighted(breakdown, weights),
      breakdown,
      freeHit: free.hit,
    };
  });

  scored.sort((a, b) => b.base - a.base || a.unit.id.localeCompare(b.unit.id));
  const orderMap = new Map<string, ScoredUnit>();
  scored.forEach((item) => orderMap.set(item.unit.id, item));

  const anchors: ScoredUnit[] = [];
  const remaining = [...scored];
  while (anchors.length < Math.min(3, batchSize) && remaining.length > 0) {
    let bestIndex = 0;
    let bestValue = -Infinity;
    remaining.forEach((item, index) => {
      const authorPenalty = anchors.some((anchor) => anchor.unit.author === item.unit.author)
        ? 0.07
        : 0;
      const formPenalty = anchors.some((anchor) => anchor.unit.form === item.unit.form)
        ? 0.015
        : 0;
      const value = item.base - authorPenalty - formPenalty;
      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });
    const [picked] = remaining.splice(bestIndex, 1);
    anchors.push(picked);
  }

  const rest = [...remaining].sort(
    (a, b) => b.base - a.base || a.unit.id.localeCompare(b.unit.id),
  );
  const bands: ScoredUnit[][] = [];
  rest.forEach((item) => {
    const current = bands[bands.length - 1];
    if (current && current[0].base - item.base < 0.04) {
      current.push(item);
    } else {
      bands.push([item]);
    }
  });

  const authorCount = new Map<string, number>();
  const formCount = new Map<string, number>();
  anchors.forEach((item) => {
    authorCount.set(item.unit.author, (authorCount.get(item.unit.author) ?? 0) + 1);
    formCount.set(item.unit.form, (formCount.get(item.unit.form) ?? 0) + 1);
  });

  const ordered: ScoredUnit[] = [...anchors];
  bands.forEach((band, bandIndex) => {
    const random = mulberry32(hashString(`${options.seed}|band|${bandIndex}`));
    const bandPool = [...band];
    while (bandPool.length > 0) {
      let bestIndex = 0;
      let bestValue = -Infinity;
      bandPool.forEach((item, index) => {
        const penalty =
          (authorCount.get(item.unit.author) ?? 0) * 0.035 +
          (formCount.get(item.unit.form) ?? 0) * 0.012;
        const value = item.base - penalty + random() * 0.0001;
        if (value > bestValue) {
          bestValue = value;
          bestIndex = index;
        }
      });
      const [picked] = bandPool.splice(bestIndex, 1);
      ordered.push(picked);
      authorCount.set(picked.unit.author, (authorCount.get(picked.unit.author) ?? 0) + 1);
      formCount.set(picked.unit.form, (formCount.get(picked.unit.form) ?? 0) + 1);
    }
  });

  const preferredIds = options.preferredIds ?? [];
  let finalOrder = ordered;
  if (preferredIds.length > 0) {
    const preferred = preferredIds
      .map((id) => orderMap.get(id))
      .filter((item): item is ScoredUnit => Boolean(item));
    const preferredSet = new Set(preferred.map((item) => item.unit.id));
    finalOrder = [...preferred, ...ordered.filter((item) => !preferredSet.has(item.unit.id))];
  }

  const items: RankedUnit[] = finalOrder.slice(0, batchSize).map((item) => {
    const tooLong = item.unit.readingMinutes > answers.minutes;
    return {
      unit: item.unit,
      score: item.base,
      label: labelForScore(item.base),
      breakdown: item.breakdown,
      reason: makeReason(item, {
        answers,
        mood: effectiveMood,
        neutral,
        needLabel: need?.label ?? null,
        needId: need?.id ?? null,
        inference,
        weights,
        tooLong,
      }),
      tooLong,
      freeHit: item.freeHit,
    };
  });

  // A free-input sentence should point at a handful of recommendations, not every card.
  if (answers.freeText.trim().length > 0 && items.length > 0) {
    const byFree = [...items].sort((a, b) => b.breakdown.free - a.breakdown.free);
    const keep = new Set(
      byFree
        .slice(0, Math.min(5, items.length))
        .filter((item) => item.breakdown.free >= 0.45)
        .map((item) => item.unit.id),
    );
    items.forEach((item) => {
      if (!keep.has(item.unit.id)) item.freeHit = false;
    });
  }

  return {
    items,
    librarySize: texts.length,
    poolSize: pool.length,
    removedByWarnings,
    removedRecent,
    removedShown,
    recentFallback,
    neutral,
    weak: (items[0]?.score ?? 0) < 0.7,
    freeThemes: inference.themes,
    freeLeafLabels: inference.leafIds
      .map((id) => MOOD_BY_ID.get(id)?.label)
      .filter((label): label is string => Boolean(label)),
    freeHitCount: items.filter((item) => item.freeHit).length,
    weights,
    seed: options.seed,
    batchIndex: options.batchIndex ?? 0,
  };
}

export function makeBaseSeed(answers: Answers, dateKey: string): string {
  return `${hashString(
    [
      dateKey,
      answers.branchId,
      answers.moodId,
      answers.needId,
      answers.minutes,
      answers.form,
      answers.freeText.trim(),
    ].join("|"),
  )}`;
}

export function makeBatchSeed(baseSeed: string, nonce: string, batchIndex: number): string {
  if (batchIndex === 0) return baseSeed;
  return `${hashString(`${baseSeed}|${nonce}|${batchIndex}`)}`;
}
