// cmd/frontend/src/components/SocketControls.tsx
'use client';

import { useRef, useState } from 'react';
import { useLogger } from '../hooks/useLogger';

export default function SocketControls() {
  const { addLog } = useLogger();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const sendOnce = async () => {
    const text = message.trim();
    if (!text) return;

    // impede abrir outra conexão enquanto há uma em aberto
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      addLog('⚠️ Já existe uma conexão aberta. Feche antes de enviar novamente.');
      return;
    }

    setSending(true);
    try {
      // inicializa o bridge no Next (instala o listener de upgrade)
      await fetch('/api/tcp', { method: 'GET' }).catch(() => {});

      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${proto}://${location.host}/api/tcp`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      let closed = false;
      const safeClose = (code = 1000, reason = 'one-shot') => {
        if (closed) return;
        closed = true;
        try { ws.close(code, reason); } catch {}
        wsRef.current = null;
        setSending(false);
      };

      ws.onopen = () => {
        // envia com newline (Scanner do Go lê por linha)
        ws.send(text.endsWith('\n') ? text : text + '\n');
        addLog('📤 ' + text);
        setMessage('');
      };

      ws.onmessage = (e) => {
        addLog('📩 ' + e.data);
        // fecha automaticamente após a primeira resposta
        safeClose(1000, 'done');
      };

      ws.onerror = () => {
        addLog('❌ Erro na conexão WebSocket');
        safeClose(1011, 'ws-error');
      };

      ws.onclose = () => {
        if (!closed) {
          // fechado pelo servidor/usuário sem passar pelo safeClose
          wsRef.current = null;
          setSending(false);
        }
        addLog('🔒 Conexão fechada');
      };
    } catch (err: any) {
      setSending(false);
      addLog('⚠️ Falha no envio: ' + (err?.message ?? String(err)));
    }
  };

  const handleManualClose = () => {
    const ws = wsRef.current;
    if (!ws) {
      addLog('ℹ️ Não há conexão para fechar');
      return;
    }
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      try {
        ws.close(1000, 'manual-close');
        addLog('⏹️ Fechando conexão por comando do usuário…');
      } catch (err: any) {
        addLog('⚠️ Falha ao fechar: ' + (err?.message ?? String(err)));
      }
    } else {
      addLog('ℹ️ Socket não está aberto');
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
        <button
          onClick={handleManualClose}
          disabled={!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Close connection
        </button>
      </div>

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
