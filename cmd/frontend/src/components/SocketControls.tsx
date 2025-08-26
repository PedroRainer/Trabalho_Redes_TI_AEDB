
'use client';

import { useRef, useState } from 'react';
import { useLogger } from '../hooks/useLogger';

export default function SocketControls() {
  const { addLog } = useLogger();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Garante que o listener de upgrade (/api/tcp) seja inicializado no Next
  const ensureBridge = async () => {
    try {
      await fetch('/api/tcp', { method: 'GET', cache: 'no-store' });
      await new Promise((r) => setTimeout(r, 10));
    } catch {
      addLog('⚠️ Falha ao inicializar bridge (/api/tcp)');
    }
  };

  const sendOnce = async (overrideText?: string) => {
    const text = (overrideText ?? message).trim();
    if (!text) return;

    // Evita abrir outra conexão enquanto a atual ainda não foi fechada
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      addLog('⚠️ Aguarde a conexão atual fechar antes de enviar novamente.');
      return;
    }

    setSending(true);
    try {
      await ensureBridge();

      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${proto}://${location.host}/api/tcp`;
      addLog(`🔌 Conectando WebSocket… (${url})`);

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
        addLog('✅ Conexão iniciada');
        ws.send(text.endsWith('\n') ? text : text + '\n');
        addLog('📤 ' + text);
        if (!overrideText) setMessage('');
      };

      ws.onmessage = (e) => {
        addLog('📩 ' + e.data);
        // Fecha automaticamente após a primeira resposta
        safeClose(1000, 'done');
      };

      ws.onerror = () => {
        addLog('❌ Erro na conexão WebSocket');
        safeClose(1011, 'ws-error');
      };

      ws.onclose = (ev) => {
        if (!closed) {
          wsRef.current = null;
          setSending(false);
        }
        addLog(`🔒 Conexão fechada (code=${ev.code}${ev.reason ? `, reason=${ev.reason}` : ''})`);
      };
    } catch (err: any) {
      setSending(false);
      addLog('⚠️ Falha no envio: ' + (err?.message ?? String(err)));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia; Shift+Enter insere nova linha
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
          onClick={() => sendOnce()}
          disabled={sending || !message.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
        <button
          onClick={() => sendOnce('ping')}
          disabled={sending}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          title='Envia "ping" em one-shot'
        >
          Enviar ping
        </button>
      </div>
    </div>
  );
}
