import type {
  ContentWarning,
  Form,
  MoodBranch,
  MoodBranchId,
  MoodLeaf,
  NeedOption,
  StoredPrefs,
  TextUnit,
} from "../lib/types";

export const MOOD_BRANCHES: MoodBranch[] = [
  {
    id: "low",
    label: "低落",
    sub: "心里有点沉，提不起劲",
    leaves: ["blocked", "escape", "wronged"],
  },
  {
    id: "tired",
    label: "疲惫",
    sub: "身体或脑子，总有一边累了",
    leaves: ["tired", "strength", "restless"],
  },
  {
    id: "good",
    label: "还不错",
    sub: "心情尚可，想把它延长一点",
    leaves: ["good", "light"],
  },
];

export const MOODS: MoodLeaf[] = [
  {
    id: "blocked",
    branch: "low",
    label: "心里有点堵",
    sub: "说不出具体为什么",
    valence: 0.25,
    arousal: 0.4,
    affinity: ["安慰", "温柔", "怀旧", "安静", "亲情"],
    difficulty: 1,
  },
  {
    id: "escape",
    branch: "low",
    label: "想逃开一会儿",
    sub: "不想面对现实",
    valence: 0.36,
    arousal: 0.34,
    affinity: ["美", "逃离", "自然", "安静", "浪漫"],
    difficulty: 1,
  },
  {
    id: "wronged",
    branch: "low",
    label: "有点委屈",
    sub: "明明不是你的错，却说不出口",
    valence: 0.2,
    arousal: 0.45,
    affinity: ["安慰", "温柔", "陪伴", "怀旧", "亲情"],
    difficulty: 1,
  },
  {
    id: "tired",
    branch: "tired",
    label: "累但不想睡",
    sub: "身体关机了，脑子还在转",
    valence: 0.38,
    arousal: 0.22,
    affinity: ["安静", "陪伴", "温柔", "夜", "闲适"],
    difficulty: 1,
  },
  {
    id: "strength",
    branch: "tired",
    label: "需要一点力气",
    sub: "想被推一把",
    valence: 0.42,
    arousal: 0.62,
    affinity: ["力量", "豁达", "点醒", "希望", "明亮"],
    difficulty: 2,
  },
  {
    id: "restless",
    branch: "tired",
    label: "脑子停不下来",
    sub: "想法一层叠一层，安静不下来",
    valence: 0.36,
    arousal: 0.72,
    affinity: ["安静", "点醒", "夜", "陪伴", "逃离"],
    difficulty: 2,
  },
  {
    id: "good",
    branch: "good",
    label: "今天还不错",
    sub: "想延长一点好心情",
    valence: 0.78,
    arousal: 0.62,
    affinity: ["轻盈", "美", "浪漫", "童趣", "明亮"],
    difficulty: 2,
  },
  {
    id: "light",
    branch: "good",
    label: "想轻松一点",
    sub: "不要沉重，也不想被教育",
    valence: 0.82,
    arousal: 0.58,
    affinity: ["轻盈", "逗笑", "童趣", "明亮", "闲适"],
    difficulty: 1,
  },
  {
    id: "unclear",
    branch: "unclear",
    label: "说不清",
    sub: "那就随便看看",
    valence: 0.5,
    arousal: 0.5,
    affinity: [],
    difficulty: 2,
  },
];

export const MOOD_BY_ID = new Map(MOODS.map((mood) => [mood.id, mood]));

export const NEEDS: NeedOption[] = [
  { id: "comfort", label: "被安慰", sub: "有人坐在旁边，不急着说话", tag: "安慰" },
  { id: "laugh", label: "被逗笑", sub: "想笑一下，不想被教育", tag: "逗笑" },
  { id: "insight", label: "被点醒", sub: "需要一句真话", tag: "点醒" },
  { id: "company", label: "被陪着", sub: "不想一个人待着", tag: "陪伴" },
  { id: "beauty", label: "想看美的东西", sub: "让眼睛先离开现实", tag: "美" },
  { id: "any", label: "都行", sub: "把选择交给你", tag: null },
];

export const NEED_BY_ID = new Map(NEEDS.map((need) => [need.id, need]));

export const NEED_ORDER: Record<MoodBranchId, string[]> = {
  low: ["comfort", "company", "insight", "any", "laugh", "beauty"],
  tired: ["comfort", "laugh", "insight", "any", "company", "beauty"],
  good: ["laugh", "beauty", "insight", "any", "comfort", "company"],
  unclear: ["comfort", "laugh", "insight", "company", "beauty", "any"],
};

export function orderedNeeds(branchId: MoodBranchId | ""): NeedOption[] {
  const order = NEED_ORDER[branchId || "unclear"];
  return order
    .map((id) => NEED_BY_ID.get(id))
    .filter((need): need is NeedOption => Boolean(need));
}

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

export function unitKindLabel(unit: Pick<TextUnit, "unitType" | "form">): string {
  if (unit.unitType === "excerpt") return "节选";
  return unit.form === "poem" ? "整首" : "全文";
}

export function unitSubtitle(unit: Pick<TextUnit, "unitTitle">): string {
  return unit.unitTitle === "全文" || unit.unitTitle === "整首" ? "" : unit.unitTitle;
}

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
