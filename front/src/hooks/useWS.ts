"use client";
import { useEffect, useRef, useState } from "react";
export function useWS(path: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [msgs, setMsgs] = useState<string[]>([]);
  useEffect(() => {
    const proto = typeof window !== "undefined" && location.protocol === "https:" ? "wss" : "ws";
    const host = typeof window !== "undefined" ? location.host : "";
    const ws = new WebSocket(`${proto}://${host}${path}`);
    wsRef.current = ws;
    ws.onopen = () => setReady(true);
    ws.onmessage = (e) => setMsgs((m) => [...m, String(e.data)]);
    ws.onclose = () => setReady(false);
    ws.onerror = () => setReady(false);
    return () => ws.close();
  }, [path]);
  const send = (text: string) => wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(text);
  return { ready, msgs, send };
}
