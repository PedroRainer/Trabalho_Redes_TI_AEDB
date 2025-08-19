"use client";
import { FormEvent, useEffect } from "react";
import { useWS } from "@/hooks/useWS";
import { useLogger } from "@/hooks/useLogger";
import Terminal from "@/components/Terminal";

export default function Home() {
  const { ready, msgs, send } = useWS("/ws");
  const log = useLogger();

  // Loga eventos do WebSocket
  useEffect(() => {
    if (ready) log.success("WebSocket conectado");
    else log.warn("WebSocket desconectado");
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Exemplo: logar chegada de mensagens
  useEffect(() => {
    if (msgs.length) {
      const last = msgs[msgs.length - 1];
      log.info(`Recebido: ${last}`);
    }
  }, [msgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("m") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    await log.run("Enviar mensagem", async () => {
      const ok = send(text);
      if (!ok) throw new Error("socket não está aberto");
    });

    input.value = "";
  };

  // Botões extras só para exemplo de logging
  const ping = async () => {
    await log.run("Ping servidor", async () => {
      const ok = send("ping");
      if (!ok) throw new Error("socket não está aberto");
    });
  };

  const limparChat = async () => {
    await log.run("Limpar chat (visão local)", async () => {
      // como msgs vem do hook, não limpamos aqui;
      // isso é apenas um exemplo de ação logada.
    });
  };

  return (
    <main style={{ maxWidth: 820, margin: "32px auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 4 }}>Go WebSocket + Next.js</h1>
      <div style={{ marginBottom: 16, opacity: 0.85 }}>
        Status: {ready ? "Conectado ✅" : "Desconectado ❌"}
      </div>

      <div style={{
        border: "1px solid #ddd", height: 300, overflow: "auto",
        padding: 12, marginTop: 12, borderRadius: 8
      }}>
        {msgs.map((m, i) => <div key={i}>{m}</div>)}
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input name="m" placeholder="Mensagem" style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }} />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Enviar
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={ping} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Ping
        </button>
        <button onClick={limparChat} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Limpar chat (local)
        </button>
      </div>

      {/* Terminal de logs na parte baixa */}
      <Terminal logs={log.logs} onClear={log.clear} />
    </main>
  );
}
