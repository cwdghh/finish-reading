import { MOODS, NEEDS } from "../data/moods";
import type {
  Answers,
  MatchBreakdown,
  RankedUnit,
  ResultLabel,
  TextUnit,
} from "./types";
import { cosineSimilarity } from "./textStats";

const WEIGHTS = {
  need: 0.25,
  mood: 0.2,
  free: 0.15,
  time: 0.15,
  form: 0.1,
  affect: 0.1,
  difficulty: 0.05,
};

const KEYWORD_GROUPS: { words: string[]; tags: string[] }[] = [
  { words: ["累", "疲惫", "没力气", "困", "不想睡", "熬夜"], tags: ["安静", "陪伴", "夜", "闲适"] },
  { words: ["烦", "堵", "难受", "委屈", "想哭", "焦虑", "不安"], tags: ["安慰", "温柔", "安静"] },
  { words: ["孤独", "一个人", "寂寞", "没人", "空"], tags: ["陪伴", "孤独", "夜"] },
  { words: ["想家", "家", "父母", "妈妈", "爸爸", "亲人", "想念"], tags: ["亲情", "怀旧", "温柔"] },
  { words: ["逃", "离开", "躲", "现实", "压力", "喘不过气"], tags: ["逃离", "美", "安静", "自然"] },
  { words: ["力气", "振作", "坚持", "勇气", "加油", "推一把"], tags: ["力量", "豁达", "点醒", "希望"] },
  { words: ["开心", "高兴", "不错", "轻松", "好心情"], tags: ["轻盈", "美", "浪漫", "明亮"] },
  { words: ["笑", "好笑", "有趣", "轻松一点"], tags: ["逗笑", "轻松", "童趣"] },
  { words: ["明白", "想通", "点醒", "真话", "答案"], tags: ["点醒", "豁达", "力量"] },
  { words: ["美", "好看", "风景", "月亮", "雪", "雨", "花"], tags: ["美", "自然", "夜", "浪漫"] },
  { words: ["睡不着", "夜里", "晚上", "深夜"], tags: ["夜", "安静", "陪伴"] },
  { words: ["离别", "告别", "再见", "走"], tags: ["离别", "温柔", "怀旧"] },
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function targetTags(freeText: string): Set<string> {
  const tags = new Set<string>();
  for (const group of KEYWORD_GROUPS) {
    if (group.words.some((word) => freeText.includes(word))) {
      group.tags.forEach((tag) => tags.add(tag));
    }
  }
  return tags;
}

function freeScore(unit: TextUnit, freeText: string): number {
  const text = freeText.trim();
  if (!text) return 0.65;
  const targets = targetTags(text);
  const unitTags = new Set([...unit.moodTags, ...unit.needTags]);
  let keywordScore = 0;
  if (targets.size > 0) {
    let matched = 0;
    targets.forEach((tag) => {
      if (unitTags.has(tag)) matched += 1;
    });
    keywordScore = clamp(matched / Math.min(3, targets.size), 0, 1);
  }
  const corpus = [
    unit.workTitle,
    unit.moodTags.join(" "),
    unit.needTags.join(" "),
    unit.moodDescription,
    unit.whyItFits,
  ].join("。");
  const similarity = clamp(cosineSimilarity(text, corpus) * 2.4, 0, 1);
  return clamp(0.18 + keywordScore * 0.52 + similarity * 0.3, 0, 1);
}

function moodScore(unit: TextUnit, affinity: string[]): number {
  if (affinity.length === 0) return 0.62;
  const tags = new Set(unit.moodTags);
  let matched = 0;
  affinity.forEach((tag) => {
    if (tags.has(tag)) matched += 1;
  });
  return clamp(0.34 + (matched / 2.4) * 0.66, 0, 1);
}

function needScore(unit: TextUnit, needTag: string | null): number {
  if (!needTag) return 0.72;
  return unit.needTags.includes(needTag) ? 1 : 0.2;
}

function timeScore(minutes: number, available: number): number {
  if (minutes <= available) {
    return 1 - ((available - minutes) / available) * 0.15;
  }
  return clamp(available / minutes - 0.15, 0.18, 0.85);
}

function formScore(unit: TextUnit, form: Answers["form"]): number {
  if (form === "any") return 0.78;
  return unit.form === form ? 1 : 0.45;
}

function affectScore(unit: TextUnit, valence: number, arousal: number): number {
  const distance = Math.abs(unit.valence - valence) * 0.65 + Math.abs(unit.arousal - arousal) * 0.35;
  return clamp(1 - distance * 0.85, 0.12, 1);
}

function difficultyScore(unit: TextUnit, target: number): number {
  return 1 - Math.abs(unit.difficulty - target) / 2;
}

function buildBreakdown(unit: TextUnit, answers: Answers, mood: (typeof MOODS)[number], needTag: string | null): MatchBreakdown {
  return {
    need: needScore(unit, needTag),
    mood: moodScore(unit, mood.affinity),
    free: freeScore(unit, answers.freeText),
    time: timeScore(unit.readingMinutes, answers.minutes),
    form: formScore(unit, answers.form),
    affect: affectScore(unit, mood.valence, mood.arousal),
    difficulty: difficultyScore(unit, mood.difficulty),
  };
}

function weighted(breakdown: MatchBreakdown): number {
  return (
    breakdown.need * WEIGHTS.need +
    breakdown.mood * WEIGHTS.mood +
    breakdown.free * WEIGHTS.free +
    breakdown.time * WEIGHTS.time +
    breakdown.form * WEIGHTS.form +
    breakdown.affect * WEIGHTS.affect +
    breakdown.difficulty * WEIGHTS.difficulty
  );
}

function shorten(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function makeReason(unit: TextUnit, answers: Answers, tooLong: boolean): string {
  const need = NEEDS.find((item) => item.id === answers.needId);
  const mood = MOODS.find((item) => item.id === answers.moodId);
  const free = answers.freeText.trim();
  let opening = "";
  if (free && need?.tag) {
    opening = `你选了“${need.label}”，也说了“${shorten(free, 22)}”。`;
  } else if (free) {
    opening = `你写到“${shorten(free, 24)}”。`;
  } else if (need?.tag) {
    opening = `你选了“${need.label}”。`;
  } else if (mood) {
    opening = `你此刻是“${mood.label}”。`;
  }
  const ending = tooLong
    ? `比这次的时间稍长，但可以慢慢读。`
    : unit.readingMinutes <= 5
      ? `几分钟就能读完。`
      : `大约 ${unit.readingMinutes} 分钟。`;
  return `${opening}${unit.whyItFits}${ending}`;
}

export interface MatchResult {
  items: RankedUnit[];
  totalBeforeFilters: number;
  removedByWarnings: number;
  removedRecent: number;
  recentFallback: boolean;
}

export function rankTexts(
  texts: TextUnit[],
  answers: Answers,
  recentIds: string[] = [],
): MatchResult {
  const mood = MOODS.find((item) => item.id === answers.moodId) ?? MOODS[5];
  const need = NEEDS.find((item) => item.id === answers.needId) ?? NEEDS[5];
  const avoid = new Set(answers.avoid);
  const safe = texts.filter(
    (unit) => !unit.contentWarnings.some((warning) => avoid.has(warning)),
  );
  const removedByWarnings = texts.length - safe.length;

  let pool = safe;
  let recentFallback = false;
  if (recentIds.length > 0) {
    const fresh = safe.filter((unit) => !recentIds.includes(unit.id));
    if (fresh.length >= 5) {
      pool = fresh;
    } else {
      recentFallback = true;
    }
  }
  const removedRecent = safe.length - pool.length;

  const scored = pool.map((unit) => {
    const breakdown = buildBreakdown(unit, answers, mood, need.tag);
    return {
      unit,
      base: weighted(breakdown),
      adjusted: weighted(breakdown),
      breakdown,
    };
  });

  scored.sort((a, b) => b.base - a.base);

  const authorCount = new Map<string, number>();
  const formCount = new Map<string, number>();
  const selected: typeof scored = [];
  const remaining = [...scored];
  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestValue = -Infinity;
    remaining.forEach((item, index) => {
      const value =
        item.base -
        0.035 * (authorCount.get(item.unit.author) ?? 0) -
        0.012 * (formCount.get(item.unit.form) ?? 0);
      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });
    const [picked] = remaining.splice(bestIndex, 1);
    picked.adjusted = bestValue;
    selected.push(picked);
    authorCount.set(picked.unit.author, (authorCount.get(picked.unit.author) ?? 0) + 1);
    formCount.set(picked.unit.form, (formCount.get(picked.unit.form) ?? 0) + 1);
  }

  const items: RankedUnit[] = selected.map((item, index) => {
    const label: ResultLabel = index < 3 ? "很合" : index < 7 ? "挺合" : "可以看看";
    const tooLong = item.unit.readingMinutes > answers.minutes;
    return {
      unit: item.unit,
      score: item.adjusted,
      label,
      breakdown: item.breakdown,
      reason: makeReason(item.unit, answers, tooLong),
      tooLong,
    };
  });

  return {
    items,
    totalBeforeFilters: texts.length,
    removedByWarnings,
    removedRecent,
    recentFallback,
  };
}

export function estimatedLabel(score: number): ResultLabel {
  if (score >= 0.8) return "很合";
  if (score >= 0.66) return "挺合";
  return "可以看看";
}
