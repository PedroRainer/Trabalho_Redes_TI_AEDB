"use client";
import { FormEvent, useState } from "react";
import { useLogger } from "@/hooks/useLogger";
import Terminal from "@/components/Terminal";

export default function Home() {
  const log = useLogger();
  const [msgs, setMsgs] = useState<string[]>([]);

  async function enviarViaTCP(text: string) {
    const r = await fetch("/api/tcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    setMsgs((m) => [...m, String(j.reply ?? "").trim()]);
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("m") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;

    await log.run("Enviar via TCP", async () => {
      await enviarViaTCP(text);
    });
    input.value = "";
  };

  const ping = async () => {
    await log.run("Ping (TCP)", async () => {
      await enviarViaTCP("ping");
    });
  };

  return (
    <main style={{ maxWidth: 820, margin: "32px auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 4 }}>Next.js → TCP → Go</h1>
      <div style={{ marginBottom: 16, opacity: 0.85 }}>
        Tráfego de dados entre serviços é <strong>socket TCP puro</strong>.
      </div>

      <div style={{
        border: "1px solid #ddd", height: 300, overflow: "auto",
        padding: 12, marginTop: 12, borderRadius: 8
      }}>
        {msgs.length === 0 ? <div style={{opacity:.65}}>sem mensagens ainda…</div> :
          msgs.map((m, i) => <div key={i}>{m}</div>)
        }
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input name="m" placeholder="Mensagem" style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }} />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Enviar
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={ping} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Ping (TCP)
        </button>
      </div>

      <Terminal logs={log.logs} onClear={log.clear} />
    </main>
  );
}
