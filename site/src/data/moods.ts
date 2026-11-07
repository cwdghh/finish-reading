import type {
  ContentWarning,
  Form,
  MoodOption,
  NeedOption,
  StoredPrefs,
} from "../lib/types";

export const MOODS: MoodOption[] = [
  {
    id: "tired",
    label: "累但不想睡",
    sub: "身体关机了，脑子还在转",
    valence: 0.38,
    arousal: 0.22,
    affinity: ["安静", "陪伴", "温柔", "夜", "闲适"],
    difficulty: 1,
  },
  {
    id: "blocked",
    label: "心里有点堵",
    sub: "说不出具体为什么",
    valence: 0.25,
    arousal: 0.4,
    affinity: ["安慰", "温柔", "怀旧", "安静", "亲情"],
    difficulty: 1,
  },
  {
    id: "escape",
    label: "想逃开一会儿",
    sub: "不想面对现实",
    valence: 0.36,
    arousal: 0.34,
    affinity: ["美", "逃离", "自然", "安静", "浪漫"],
    difficulty: 1,
  },
  {
    id: "strength",
    label: "需要一点力气",
    sub: "想被推一把",
    valence: 0.42,
    arousal: 0.62,
    affinity: ["力量", "豁达", "点醒", "希望", "明亮"],
    difficulty: 2,
  },
  {
    id: "good",
    label: "今天还不错",
    sub: "想延长一点好心情",
    valence: 0.78,
    arousal: 0.62,
    affinity: ["轻盈", "美", "浪漫", "童趣", "明亮"],
    difficulty: 2,
  },
  {
    id: "unclear",
    label: "说不清",
    sub: "那就随便看看",
    valence: 0.5,
    arousal: 0.5,
    affinity: [],
    difficulty: 2,
  },
];

export const NEEDS: NeedOption[] = [
  { id: "comfort", label: "被安慰", sub: "有人坐在旁边，不急着说话", tag: "安慰" },
  { id: "laugh", label: "被逗笑", sub: "想笑一下，不想被教育", tag: "逗笑" },
  { id: "insight", label: "被点醒", sub: "需要一句真话", tag: "点醒" },
  { id: "company", label: "被陪着", sub: "不想一个人待着", tag: "陪伴" },
  { id: "beauty", label: "想看美的东西", sub: "让眼睛先离开现实", tag: "美" },
  { id: "any", label: "都行", sub: "把选择交给你", tag: null },
];

export const TIMES = [
  { value: 5 as const, label: "5 分钟", sub: "一首诗，或一个很短的段落" },
  { value: 15 as const, label: "15 分钟", sub: "一个短篇，一次完整的散步" },
  { value: 25 as const, label: "25 分钟", sub: "长一点的单元，或两个短单元" },
];

export const FORMS: { value: Form | "any"; label: string; sub: string }[] = [
  { value: "poem", label: "诗", sub: "诗与词" },
  { value: "prose", label: "散文", sub: "一个人、一处景" },
  { value: "fiction", label: "小说", sub: "一个完整的场景" },
  { value: "classical", label: "古文", sub: "原文与短注" },
  { value: "any", label: "随便", sub: "都可以" },
];

export const FORM_LABELS: Record<Form, string> = {
  poem: "诗",
  prose: "散文",
  fiction: "小说",
  classical: "古文",
};

export const CONTENT_WARNINGS: ContentWarning[] = [
  "死亡",
  "离别",
  "疾病",
  "暴力",
  "沉重意象",
];

export const DEFAULT_PREFS: StoredPrefs = {
  minutes: 15,
  form: "any",
  avoid: [],
};

export interface StampDef {
  id: string;
  label: string;
  group: "情绪" | "状态" | "内容";
}

export const STAMPS: StampDef[] = [
  { id: "comforted", label: "被安慰", group: "情绪" },
  { id: "awake", label: "被点醒", group: "情绪" },
  { id: "laugh", label: "想笑", group: "情绪" },
  { id: "cry", label: "想哭", group: "情绪" },
  { id: "calm", label: "平静", group: "情绪" },
  { id: "power", label: "有力量", group: "情绪" },
  { id: "night", label: "夜读", group: "状态" },
  { id: "slow", label: "慢读", group: "状态" },
  { id: "done", label: "读完", group: "状态" },
  { id: "again", label: "想再读", group: "状态" },
  { id: "line", label: "好句子", group: "内容" },
  { id: "keep", label: "想记住", group: "内容" },
];

export const STAMP_GROUPS: StampDef["group"][] = ["情绪", "状态", "内容"];

export const POST_MOODS = ["更松了", "差不多", "更沉了"] as const;
