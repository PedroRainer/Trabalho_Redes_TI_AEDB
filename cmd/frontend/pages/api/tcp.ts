import type { NextApiRequest } from 'next';
import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import net from 'net';

export const config = { api: { bodyParser: false } };

const TCP_HOST = process.env.TCP_HOST || (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'views');
const TCP_PORT = Number(process.env.TCP_PORT || 1234);

let initialized = false;

export default function handler(req: NextApiRequest, res: any) {
  const srv: Server & { wss?: WebSocketServer } = res.socket.server as any;

  if (!srv.wss && !initialized) {
    const wss = new WebSocketServer({ noServer: true });

    srv.on('upgrade', (request: any, socket: any, head: Buffer) => {
      const urlPath = (request.url || '').split('?')[0];
      if (urlPath !== '/api/tcp') {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const tcp = net.createConnection({ host: TCP_HOST, port: TCP_PORT }, () => {
          try { ws.send(`[INFO] Bridge conectado ao TCP ${TCP_HOST}:${TCP_PORT}`); } catch {}
        });

        ws.on('message', (msg) => tcp.write(msg.toString() + '\n'));
        tcp.on('data', (data) => { try { ws.send(data.toString()); } catch {} });

        ws.on('close', () => tcp.end());
        ws.on('error', () => tcp.end());
        tcp.on('error', (err) => {
          try { ws.send(`[ERRO TCP] ${err.message}`); } catch {}
          try { ws.close(); } catch {}
        });
      });
    });

    (srv as any).wss = wss;
    initialized = true;
    console.log(`[WS] bridge /api/tcp inicializado → TCP ${TCP_HOST}:${TCP_PORT}`);
  }

  // Responde algo rápido para a chamada HTTP "init"
  res.status(200).end('WS bridge ready');
}
