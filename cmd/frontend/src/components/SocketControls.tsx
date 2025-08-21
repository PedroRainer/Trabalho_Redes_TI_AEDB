'use client';


import { useState } from 'react';
import { useLogger } from '../hooks/useLogger';


export default function SocketControls() {
const { addLog } = useLogger();
const [socket, setSocket] = useState<null | WebSocket>(null);


const handleConnect = async () => {
try {
const ws = new WebSocket('ws://localhost:8080/ws');
ws.onopen = () => addLog('✅ Conexão WebSocket aberta');
ws.onmessage = (e) => addLog('📩 Recebido: ' + e.data);
ws.onerror = () => addLog('❌ Erro na conexão WebSocket');
ws.onclose = () => addLog('🔒 Conexão WebSocket fechada');
setSocket(ws);
} catch (error) {
addLog('Erro ao conectar: ' + (error as Error).message);
}
};


const handleSendMessage = () => {
if (socket && socket.readyState === WebSocket.OPEN) {
socket.send('Mensagem do cliente');
addLog('📤 Enviado: Mensagem do cliente');
} else {
addLog('⚠️ WebSocket não está conectado');
}
};


return (
<div className="mt-4 flex gap-4">
<button onClick={handleConnect} className="bg-blue-500 text-white px-4 py-2 rounded">Conectar</button>
<button onClick={handleSendMessage} className="bg-green-500 text-white px-4 py-2 rounded">Enviar Mensagem</button>
</div>
);
}