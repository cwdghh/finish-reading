export type Form = "poem" | "prose" | "fiction" | "classical";

export type Pace = "slow" | "steady" | "brisk";

export type Density = "light" | "medium" | "dense";

export type Weather = "晴" | "薄雾" | "小雨" | "夜风" | "雪" | "晚霞";

export type ContentWarning = "死亡" | "离别" | "疾病" | "暴力" | "沉重意象";

export type CopyrightScope = "public-domain-cn-us" | "public-domain-cn";

export interface TextNote {
  term: string;
  text: string;
}

export interface TextUnit {
  id: string;
  workTitle: string;
  unitTitle: string;
  author: string;
  authorDeathYear: number;
  publicationYear: number;
  form: Form;
  unitType: "full" | "excerpt";
  readingMinutes: number;
  difficulty: 1 | 2 | 3;
  pace: Pace;
  density: Density;
  weather: Weather;
  moodTags: string[];
  needTags: string[];
  valence: number;
  arousal: number;
  contentWarnings: ContentWarning[];
  contextBefore: string;
  contextAfter: string;
  sections: string[][];
  stanzas: string[][];
  notes: TextNote[];
  quote: string;
  excerpt: string;
  whyItFits: string;
  moodDescription: string;
  copyrightScope: CopyrightScope;
  sourceName: string;
  sourceUrl: string;
  license: string;
  accessedAt: string;
  checkedAt: string;
}

export interface MoodOption {
  id: string;
  label: string;
  sub: string;
  valence: number;
  arousal: number;
  affinity: string[];
  difficulty: 1 | 2 | 3;
}

export interface NeedOption {
  id: string;
  label: string;
  sub: string;
  tag: string | null;
}

export type ResultLabel = "很合" | "挺合" | "可以看看";

export interface MatchBreakdown {
  need: number;
  mood: number;
  free: number;
  time: number;
  form: number;
  affect: number;
  difficulty: number;
}

export interface RankedUnit {
  unit: TextUnit;
  score: number;
  label: ResultLabel;
  breakdown: MatchBreakdown;
  reason: string;
  tooLong: boolean;
}

export interface Answers {
  moodId: string;
  needId: string;
  minutes: 5 | 15 | 25;
  form: Form | "any";
  freeText: string;
  avoid: ContentWarning[];
}

export type PostMood = "更松了" | "差不多" | "更沉了";

export interface FinishDraft {
  postMood: PostMood;
  note: string;
  quote: string;
  stampIds: string[];
  durationSeconds: number;
}

export interface HistoryRecord {
  id: string;
  unitId: string;
  finishedAt: string;
  workTitle: string;
  unitTitle: string;
  author: string;
  form: Form;
  weather: Weather;
  readingMinutes: number;
  preMood: string;
  postMood: PostMood;
  note: string;
  quote: string;
  stampIds: string[];
  durationSeconds: number;
}

export type AppView = "checkin" | "results" | "reading" | "finish" | "history";

export interface StoredPrefs {
  minutes: 5 | 15 | 25;
  form: Form | "any";
  avoid: ContentWarning[];
}
