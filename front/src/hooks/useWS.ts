"use client";
import { useEffect, useRef, useState } from "react";

export type UseWS = {
  ready: boolean;
  msgs: string[];
  send: (text: string) => boolean;
};

export function useWS(path: string): UseWS {
  const wsRef = useRef<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [msgs, setMsgs] = useState<string[]>([]);

  useEffect(() => {
    const proto =
      typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
    const host = typeof window !== "undefined" ? window.location.host : "";
    const ws = new WebSocket(`${proto}://${host}${path}`);
    wsRef.current = ws;

    ws.onopen = () => setReady(true);
    ws.onmessage = (e) => setMsgs((m) => [...m, String(e.data)]);
    ws.onclose = () => setReady(false);
    ws.onerror = () => setReady(false);

    return () => ws.close();
  }, [path]);

  const send = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
      return true;
    }
    return false;
  };

  return { ready, msgs, send };
}
