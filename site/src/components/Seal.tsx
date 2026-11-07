import type { CSSProperties } from "react";

interface SealProps {
  label: string;
  size?: "sm" | "md" | "lg";
  rotation?: number;
  selected?: boolean;
  className?: string;
}

function splitLabel(label: string): string[] {
  const chars = Array.from(label);
  if (chars.length <= 2) return [label];
  return [chars.slice(0, 2).join(""), chars.slice(2).join("")];
}

function defaultRotation(label: string): number {
  const sum = Array.from(label).reduce((value, char) => value + char.charCodeAt(0), 0);
  return ((sum % 13) - 6) * 0.9;
}

export function Seal({ label, size = "md", rotation, selected = false, className = "" }: SealProps) {
  const lines = splitLabel(label);
  const style = {
    "--seal-rotate": `${rotation ?? defaultRotation(label)}deg`,
  } as CSSProperties;
  return (
    <span
      className={`seal seal--${size}${selected ? " is-selected" : ""} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <span className="seal__inner">
        {lines.map((line) => (
          <span key={line} className="seal__line">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}
