"use client";
import { useCallback, useMemo, useRef, useState } from "react";

export type LogLevel = "info" | "success" | "error" | "warn";
export interface LogEntry {
  id: string;
  ts: Date;
  level: LogLevel;
  msg: string;
}

export function useLogger(max = 500) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  const push = useCallback((level: LogLevel, msg: string) => {
    const id = `${Date.now()}-${idRef.current++}`;
    setLogs((prev) => {
      const next = [...prev, { id, ts: new Date(), level, msg }];
      if (next.length > max) next.splice(0, next.length - max);
      return next;
    });
  }, [max]);

  const api = useMemo(() => ({
    info: (m: string) => push("info", m),
    success: (m: string) => push("success", m),
    error: (m: string) => push("error", m),
    warn: (m: string) => push("warn", m),
    clear: () => setLogs([]),
    logs,
    async run(name: string, fn: () => Promise<void> | void) {
      const start = performance.now();
      api.info(`▶ ${name}...`);
      try {
        await fn();
        const ms = Math.round(performance.now() - start);
        api.success(`✓ ${name} concluído em ${ms} ms`);
      } catch (e: any) {
        const ms = Math.round(performance.now() - start);
        api.error(`✗ ${name} falhou em ${ms} ms — ${e?.message ?? e}`);
        throw e;
      }
    }
  }), [push, logs]);

  return api;
}
