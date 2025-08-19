"use client";
import { useEffect, useMemo, useRef } from "react";
import type { LogEntry } from "@/hooks/useLogger";

export default function Terminal({
  logs,
  onClear
}: {
  logs: LogEntry[];
  onClear?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // auto-scroll ao fim sempre que entrar log novo
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const lines = useMemo(() => logs.map(l => {
    const t = l.ts.toLocaleTimeString();
    const lvl =
      l.level === "success" ? "SUCCESS" :
      l.level === "error"   ? "ERROR"   :
      l.level === "warn"    ? "WARN"    : "INFO";
    return `[${t}] ${lvl}: ${l.msg}`;
  }), [logs]);

  return (
    <div style={{
      borderTop: "1px solid #e5e7eb",
      background: "#0b1020",
      color: "#c7d2fe",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      marginTop: 24,
      borderRadius: 8,
      overflow: "hidden"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "#111827",
        color: "#e5e7eb",
        fontSize: 13
      }}>
        <strong>Terminal de Logs</strong>
        <div style={{display:"flex", gap:8}}>
          <button
            onClick={onClear}
            style={{
              background: "transparent",
              border: "1px solid #374151",
              color: "#e5e7eb",
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer"
            }}
            title="Limpar logs"
          >
            Limpar
          </button>
        </div>
      </div>
      <div
        ref={ref}
        style={{
          height: 220,
          overflow: "auto",
          padding: 12,
          whiteSpace: "pre-wrap",
          lineHeight: 1.45,
          fontSize: 13
        }}
      >
        {lines.length === 0 ? (
          <div style={{opacity: .7}}>sem logs ainda…</div>
        ) : lines.map((ln, i) => <div key={i}>{ln}</div>)}
      </div>
    </div>
  );
}
