import rawTexts from "./texts.json";
import type { TextUnit } from "../lib/types";

export const TEXTS = rawTexts as TextUnit[];

export const TEXT_BY_ID = new Map(TEXTS.map((text) => [text.id, text]));
