import type { TextUnit } from "./types";

const IGNORED = /[\s，。！？、；：“”‘’（）《》〈〉…—·,.!?;:'"()[\]{}<>/\\|~`@#$%^&*+=_-]/g;

function normalize(input: string): string {
  return input.replace(IGNORED, "").toLowerCase();
}

export function bigrams(input: string): Map<string, number> {
  const text = normalize(input);
  const counts = new Map<string, number>();
  for (let i = 0; i < text.length - 1; i += 1) {
    const pair = text.slice(i, i + 2);
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  return counts;
}

export function cosineSimilarity(left: string, right: string): number {
  const a = bigrams(left);
  const b = bigrams(right);
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  a.forEach((count, key) => {
    aNorm += count * count;
    const other = b.get(key);
    if (other) dot += count * other;
  });
  b.forEach((count) => {
    bNorm += count * count;
  });
  if (aNorm === 0 || bNorm === 0) return 0;
  return dot / Math.sqrt(aNorm * bNorm);
}

export function flattenUnit(unit: TextUnit): string[] {
  if (unit.form === "poem") return unit.stanzas.flat();
  return unit.sections.flat();
}

export function extractSentences(unit: TextUnit): string[] {
  const lines = flattenUnit(unit);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const parts = line.match(/[^。！？!?；;\n]+[。！？!?；;]?/g) ?? [];
    for (const part of parts) {
      const sentence = part.trim();
      if (sentence.length < 8 || sentence.length > 78) continue;
      if (seen.has(sentence)) continue;
      seen.add(sentence);
      result.push(sentence);
    }
  }
  return result.slice(0, 16);
}
