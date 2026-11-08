import { STAMPS, unitKindLabel, unitSubtitle } from "../data/moods";
import type { HistoryRecord } from "./types";
import { formatDate } from "./storage";

const WIDTH = 1080;
const HEIGHT = 1350;
const INK = "#2B2A26";
const PAPER = "#F5F0E6";
const SURFACE = "#FBF7EF";
const MUTED = "#5E6859";
const ACCENT = "#A44A3F";
const SERIF = '"Songti SC", "STSong", "Noto Serif CJK SC", serif';
const SANS = '"PingFang SC", "Noto Sans CJK SC", sans-serif';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of Array.from(text)) {
    const candidate = current + char;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = char;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines) {
    const consumed = lines.join("").length;
    if (consumed < Array.from(text).length) {
      let last = lines[lines.length - 1];
      while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[lines.length - 1] = `${last}…`;
    }
  }
  return lines;
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  label: string,
  centerX: number,
  centerY: number,
  size: number,
  rotation: number,
) {
  const chars = Array.from(label);
  const lines = chars.length <= 2 ? [label] : [chars.slice(0, 2).join(""), chars.slice(2).join("")];
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = "rgba(164, 74, 63, 0.055)";
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 5;
  ctx.strokeRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-size / 2 + 12, -size / 2 + 12, size - 24, size - 24);
  ctx.fillStyle = ACCENT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(size * 0.27)}px ${SERIF}`;
  const lineHeight = Math.round(size * 0.3);
  const startY = -((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, startY + index * lineHeight);
  });
  ctx.restore();
}

function seededNoise(): () => number {
  let seed = 20261107;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function renderFinishCard(record: HistoryRecord): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const random = seededNoise();
  for (let i = 0; i < 1800; i += 1) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    ctx.fillStyle = `rgba(43, 42, 38, ${0.012 + random() * 0.02})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  ctx.strokeStyle = "rgba(43, 42, 38, 0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 46, WIDTH - 92, HEIGHT - 92);
  ctx.strokeStyle = "rgba(43, 42, 38, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, WIDTH - 124, HEIGHT - 124);

  // Header
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 34px ${SERIF}`;
  ctx.fillText("读完", 92, 130);
  ctx.font = `18px ${SANS}`;
  ctx.fillStyle = MUTED;
  ctx.fillText("F I N I S H   R E A D I N G", 176, 126);
  ctx.textAlign = "right";
  ctx.fillText(formatDate(record.finishedAt), WIDTH - 92, 128);

  // Red accent rule
  ctx.fillStyle = ACCENT;
  ctx.fillRect(92, 162, 64, 3);

  // Title block: the work is the headline; full/excerpt is metadata.
  const unitType =
    record.unitType ??
    (record.unitTitle === "全文" || record.unitTitle === "整首" ? "full" : "excerpt");
  const kind = unitKindLabel({ unitType, form: record.form });
  const subtitle = unitSubtitle({ unitTitle: record.unitTitle });
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `600 64px ${SERIF}`;
  const titleLines = wrapText(ctx, `《${record.workTitle}》`, 860, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 92, 300 + index * 78);
  });

  const titleBottom = 300 + (titleLines.length - 1) * 78;
  if (subtitle) {
    ctx.fillStyle = MUTED;
    ctx.font = `28px ${SERIF}`;
    ctx.fillText(subtitle, 92, titleBottom + 52);
  }

  const bylineY = titleBottom + (subtitle ? 104 : 52);
  ctx.fillStyle = MUTED;
  ctx.font = `22px ${SANS}`;
  ctx.fillText(
    `${record.author} · ${kind} · ${record.readingMinutes} 分钟 · ${record.weather}`,
    92,
    bylineY,
  );

  // A faint ink character keeps the middle of the card from feeling empty.
  ctx.save();
  ctx.globalAlpha = 0.038;
  ctx.fillStyle = ACCENT;
  ctx.font = `600 520px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText("读", 790, 1010);
  ctx.restore();
  ctx.textAlign = "left";

  // Quote, vertically balanced between title and the footer
  ctx.font = `34px ${SERIF}`;
  const quoteLines = wrapText(ctx, record.quote, 830, 5);
  const quoteLineHeight = 61;
  const quoteBlockHeight = Math.max(1, quoteLines.length) * quoteLineHeight;
  const quoteRegionTop = bylineY + 62;
  const quoteRegionBottom = record.note ? 840 : 940;
  const quoteTop = Math.min(
    quoteRegionBottom - quoteBlockHeight,
    quoteRegionTop + Math.max(0, (quoteRegionBottom - quoteRegionTop - quoteBlockHeight) / 2),
  );
  ctx.fillStyle = ACCENT;
  ctx.font = `600 76px ${SERIF}`;
  ctx.fillText("“", 88, quoteTop + 12);
  ctx.fillStyle = INK;
  ctx.font = `34px ${SERIF}`;
  quoteLines.forEach((line, index) => {
    ctx.fillText(line, 142, quoteTop + 48 + index * quoteLineHeight);
  });
  const quoteBottom = quoteTop + 48 + Math.max(1, quoteLines.length) * quoteLineHeight;

  // Note
  let contentBottom = quoteBottom;
  if (record.note) {
    ctx.fillStyle = MUTED;
    ctx.font = `22px ${SANS}`;
    const noteLines = wrapText(
      ctx,
      `你写下的：${record.note}`,
      860,
      quoteLines.length >= 4 ? 1 : 2,
    );
    noteLines.forEach((line, index) => {
      ctx.fillText(line, 92, quoteBottom + 42 + index * 36);
    });
    contentBottom = quoteBottom + 42 + noteLines.length * 36;
  }

  // Editorial divider
  const ruleY = Math.min(1000, Math.max(900, contentBottom + 50));
  ctx.strokeStyle = "rgba(43, 42, 38, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(92, ruleY);
  ctx.lineTo(WIDTH - 92, ruleY);
  ctx.stroke();
  ctx.save();
  ctx.translate(WIDTH / 2, ruleY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(-5, -5, 10, 10);
  ctx.fillStyle = PAPER;
  ctx.fillRect(-2.5, -2.5, 5, 5);
  ctx.restore();

  // Mood
  const moodY = 1060;
  ctx.fillStyle = INK;
  ctx.font = `22px ${SANS}`;
  ctx.fillText("读前", 92, moodY);
  ctx.fillStyle = MUTED;
  ctx.font = `26px ${SERIF}`;
  ctx.fillText(record.preMood, 148, moodY + 1);
  ctx.fillStyle = ACCENT;
  ctx.font = `22px ${SANS}`;
  ctx.fillText("→", 286, moodY);
  ctx.fillStyle = INK;
  ctx.font = `22px ${SANS}`;
  ctx.fillText("读后", 330, moodY);
  ctx.fillStyle = MUTED;
  ctx.font = `26px ${SERIF}`;
  ctx.fillText(record.postMood, 386, moodY + 1);

  // Stamps
  const stamps = record.stampIds
    .map((id) => STAMPS.find((stamp) => stamp.id === id))
    .filter((stamp): stamp is (typeof STAMPS)[number] => Boolean(stamp));
  if (stamps.length > 0) {
    const size = 104;
    const gap = 22;
    const totalWidth = stamps.length * size + (stamps.length - 1) * gap;
    const startX = WIDTH - 92 - totalWidth + size / 2;
    stamps.forEach((stamp, index) => {
      drawStamp(
        ctx,
        stamp.label,
        startX + index * (size + gap),
        1135,
        size,
        [-5, 3, 6][index] ?? 0,
      );
    });
  }

  // Footer
  ctx.strokeStyle = "rgba(43, 42, 38, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(92, HEIGHT - 126);
  ctx.lineTo(WIDTH - 92, HEIGHT - 126);
  ctx.stroke();
  ctx.fillStyle = MUTED;
  ctx.font = `18px ${SANS}`;
  ctx.fillText("一个阅读单元 · 读完", 92, HEIGHT - 86);
  ctx.textAlign = "right";
  ctx.fillStyle = SURFACE;
  ctx.fillStyle = ACCENT;
  ctx.font = `20px ${SERIF}`;
  ctx.fillText("不读完一本书，也可以读完一个晚上。", WIDTH - 92, HEIGHT - 86);

  return canvas;
}

export function downloadFinishCard(record: HistoryRecord): void {
  const canvas = renderFinishCard(record);
  const link = document.createElement("a");
  const date = formatDate(record.finishedAt).replace(/\./g, "");
  link.download = `读完-${date}-${record.workTitle}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
