"use client";
import { useWS } from "@/hooks/useWS";
import { FormEvent } from "react";
export default function Home() {
  const { ready, msgs, send } = useWS("/ws");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("m") as HTMLInputElement;
    const text = input.value.trim();
    if (text) { send(text); input.value = ""; }
  };
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Go WebSocket + Next.js</h1>
      <div>Status: {ready ? "Conectado ✅" : "Desconectado ❌"}</div>
      <div style={{ border: "1px solid #ddd", height: 300, overflow: "auto", padding: 12, marginTop: 12 }}>
        {msgs.map((m, i) => <div key={i}>{m}</div>)}
      </div>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input name="m" placeholder="Mensagem" style={{ flex: 1, padding: 10 }} />
        <button type="submit">Enviar</button>
      </form>
    </main>
  );
}
