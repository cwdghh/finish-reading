import { MOODS } from "../data/moods";
import type { MoodLeaf } from "./types";

interface KeywordGroup {
  words: string[];
  themes: string[];
  tags: string[];
  leafIds: string[];
  needIds: string[];
}

export const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    words: ["累", "疲惫", "没力气", "困", "不想睡", "熬夜"],
    themes: ["疲惫", "夜"],
    tags: ["安静", "陪伴", "夜", "闲适"],
    leafIds: ["tired"],
    needIds: ["comfort", "company"],
  },
  {
    words: ["烦", "堵", "难受", "委屈", "想哭", "焦虑", "不安"],
    themes: ["心里堵", "委屈"],
    tags: ["安慰", "温柔", "安静"],
    leafIds: ["blocked", "wronged"],
    needIds: ["comfort", "company"],
  },
  {
    words: ["孤独", "一个人", "寂寞", "没人", "空"],
    themes: ["孤独", "想被陪"],
    tags: ["陪伴", "孤独", "夜"],
    leafIds: ["blocked", "tired"],
    needIds: ["company"],
  },
  {
    words: ["想家", "家", "父母", "妈妈", "爸爸", "亲人", "想念"],
    themes: ["想念", "家"],
    tags: ["亲情", "怀旧", "温柔"],
    leafIds: ["wronged", "tired"],
    needIds: ["comfort", "company"],
  },
  {
    words: ["逃", "离开", "躲", "现实", "压力", "喘不过气"],
    themes: ["想逃开", "压力"],
    tags: ["逃离", "美", "安静", "自然"],
    leafIds: ["escape", "restless"],
    needIds: ["beauty"],
  },
  {
    words: ["力气", "振作", "坚持", "勇气", "加油", "推一把"],
    themes: ["需要力气"],
    tags: ["力量", "豁达", "点醒", "希望"],
    leafIds: ["strength"],
    needIds: ["insight"],
  },
  {
    words: ["开心", "高兴", "不错", "轻松", "好心情"],
    themes: ["还不错", "轻松"],
    tags: ["轻盈", "美", "浪漫", "明亮"],
    leafIds: ["good", "light"],
    needIds: ["laugh", "beauty"],
  },
  {
    words: ["笑", "好笑", "有趣", "轻松一点"],
    themes: ["想笑", "轻松"],
    tags: ["逗笑", "轻松", "童趣"],
    leafIds: ["light"],
    needIds: ["laugh"],
  },
  {
    words: ["明白", "想通", "点醒", "真话", "答案"],
    themes: ["想被点醒"],
    tags: ["点醒", "豁达", "力量"],
    leafIds: ["strength", "restless"],
    needIds: ["insight"],
  },
  {
    words: ["美", "好看", "风景", "月亮", "雪", "雨", "花"],
    themes: ["想看美的东西"],
    tags: ["美", "自然", "夜", "浪漫"],
    leafIds: ["escape", "light"],
    needIds: ["beauty"],
  },
  {
    words: ["睡不着", "夜里", "晚上", "深夜", "停不下来", "脑子"],
    themes: ["脑子停不下来", "夜"],
    tags: ["夜", "安静", "陪伴"],
    leafIds: ["restless", "tired"],
    needIds: ["comfort", "company"],
  },
  {
    words: ["离别", "告别", "再见", "走"],
    themes: ["离别"],
    tags: ["离别", "温柔", "怀旧"],
    leafIds: ["wronged"],
    needIds: ["comfort", "company"],
  },
  {
    words: ["无聊", "没意思", "提不起", "空落落"],
    themes: ["提不起劲"],
    tags: ["轻盈", "逗笑", "闲适"],
    leafIds: ["tired", "blocked"],
    needIds: ["laugh"],
  },
  {
    words: ["怕", "害怕", "担心", "紧张", "慌"],
    themes: ["不安"],
    tags: ["安慰", "安静", "陪伴"],
    leafIds: ["blocked", "restless"],
    needIds: ["comfort", "company"],
  },
];

export interface FreeInference {
  themes: string[];
  tags: string[];
  leafIds: string[];
  needIds: string[];
  matchedWords: string[];
}

const EMPTY_INFERENCE: FreeInference = {
  themes: [],
  tags: [],
  leafIds: [],
  needIds: [],
  matchedWords: [],
};

export function inferFreeInput(text: string): FreeInference {
  const value = text.trim();
  if (!value) return EMPTY_INFERENCE;

  const themes: string[] = [];
  const tags: string[] = [];
  const leafIds: string[] = [];
  const needIds: string[] = [];
  const matchedWords: string[] = [];

  for (const group of KEYWORD_GROUPS) {
    const hit = group.words.find((word) => value.includes(word));
    if (!hit) continue;
    matchedWords.push(hit);
    group.themes.forEach((theme) => {
      if (!themes.includes(theme)) themes.push(theme);
    });
    group.tags.forEach((tag) => {
      if (!tags.includes(tag)) tags.push(tag);
    });
    group.leafIds.forEach((id) => {
      if (!leafIds.includes(id)) leafIds.push(id);
    });
    group.needIds.forEach((id) => {
      if (!needIds.includes(id)) needIds.push(id);
    });
  }

  return {
    themes: themes.slice(0, 4),
    tags,
    leafIds: leafIds.slice(0, 2),
    needIds: needIds.slice(0, 3),
    matchedWords: matchedWords.slice(0, 3),
  };
}

export function suggestedLeaves(inference: FreeInference): MoodLeaf[] {
  return inference.leafIds
    .map((id) => MOODS.find((mood) => mood.id === id))
    .filter((mood): mood is MoodLeaf => Boolean(mood));
}
