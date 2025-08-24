'use client';

import { useState, useRef } from 'react';
import { useLogger } from '../hooks/useLogger';

export default function SocketControls() {
  const { addLog } = useLogger();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

const handleConnect = async () => {
  if (socketRef.current) {
    addLog('⚠️ Já conectado');
    return;
  }

  try {
    // 1) Chama HTTP para inicializar o bridge no Next
    const initRes = await fetch('/api/tcp', { method: 'GET' });
    if (!initRes.ok) {
      addLog(`⚠️ Inicialização do bridge falhou: HTTP ${initRes.status}`);
    } else {
      addLog('🔧 Bridge inicializado');
    }

    // 2) Abre o WS para o mesmo host/porta da página atual
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/api/tcp`;
    const ws = new WebSocket(url);

    ws.onopen = () => { addLog('✅ Conexão WebSocket aberta'); setConnected(true); };
    ws.onmessage = (e) => addLog('📩 Recebido: ' + e.data);
    ws.onerror = () => addLog('❌ Erro na conexão WebSocket');
    ws.onclose = () => { addLog('🔒 Conexão WebSocket fechada'); setConnected(false); socketRef.current = null; };

    socketRef.current = ws;
  } catch (error) {
    addLog('Erro ao conectar: ' + (error as Error).message);
  }
};


  const handleSendMessage = () => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send('Mensagem do cliente');
      addLog('📤 Enviado: Mensagem do cliente');
    } else {
      addLog('⚠️ WebSocket não está conectado');
    }
  };

  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          onClick={handleConnect}
          disabled={connected}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Conectar
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!connected}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Desconectar
        </button>
      </div>

      <button
        onClick={handleSendMessage}
        disabled={!connected}
        className="bg-green-500 text-white px-4 py-2 rounded w-fit"
      >
        Enviar Mensagem
      </button>
    </div>
  );
}
