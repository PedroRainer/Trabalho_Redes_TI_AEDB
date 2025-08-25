// cmd/frontend/src/components/SocketControls.tsx
'use client';

import { useState } from 'react';
import { useLogger } from '../hooks/useLogger';

export default function SocketControls() {
  const { addLog } = useLogger();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendOnce = async () => {
    const text = message.trim();
    if (!text) return;

    setSending(true);
    try {
      // 1) inicializa o bridge no Next (instala o listener de upgrade)
      await fetch('/api/tcp', { method: 'GET' }).catch(() => {});

      // 2) abre WS para o mesmo host/porta da página
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${proto}://${location.host}/api/tcp`;
      const ws = new WebSocket(url);

      let closed = false;
      const safeClose = (code = 1000, reason = 'one-shot') => {
        if (closed) return;
        closed = true;
        try { ws.close(code, reason); } catch {}
        setSending(false);
      };

      // timeout de segurança (fecha se nada voltar)
      const guard = setTimeout(() => {
        addLog('⏱️ Sem resposta do servidor (timeout curto)');
        safeClose(1000, 'timeout');
      }, 1500);

      ws.onopen = () => {
        // 3) envia com newline (scanner do Go lê linha por linha)
        ws.send(text.endsWith('\n') ? text : text + '\n');
        addLog('📤 ' + text);
      };

      ws.onmessage = (e) => {
        clearTimeout(guard);
        addLog('📩 ' + e.data);
        // 4) fecha após a primeira resposta
        safeClose(1000, 'done');
      };

      ws.onerror = () => {
        clearTimeout(guard);
        addLog('❌ Erro na conexão WebSocket');
        safeClose(1011, 'ws-error');
      };

      ws.onclose = () => {
        clearTimeout(guard);
        if (!closed) setSending(false);
      };
    } catch (err: any) {
      setSending(false);
      addLog('⚠️ Falha no envio: ' + (err?.message ?? String(err)));
    } finally {
      setMessage('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia; Shift+Enter quebra linha
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending) sendOnce();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite sua mensagem (Enter para enviar, Shift+Enter para nova linha)"
          rows={2}
          className="flex-1 px-3 py-2 rounded border border-gray-300 text-black resize-y min-h-[44px]"
          disabled={sending}
        />
        <button
          onClick={sendOnce}
          disabled={sending || !message.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {sending ? 'Enviando…' : 'Enviar (one-shot)'}
        </button>
      </div>

      {/* opcional: um botão de teste rápido sem digitar */}
      <div>
        <button
          onClick={() => { setMessage('ping'); }}
          disabled={sending}
          className="text-sm underline"
        >
          Preencher com "ping"
        </button>
      </div>
    </div>
  );
}
