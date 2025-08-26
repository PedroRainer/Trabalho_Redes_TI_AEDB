// cmd/frontend/src/pages/api/tcp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import net from 'net';

export const config = { api: { bodyParser: false } };

const TCP_HOST =
  process.env.TCP_HOST ??
  (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'views');

const TCP_PORT = Number(process.env.TCP_PORT ?? 1234);

type WithWSS = Server & { wss?: WebSocketServer; __wss_inited?: boolean };

function initWSS(srv: WithWSS) {
  if (srv.__wss_inited) return; // Evita reinstalação em ambiente HMR

  const wss = new WebSocketServer({ noServer: true });

  srv.on('upgrade', (req: any, socket: any, head: Buffer) => {
    const urlPath = (req.url || '').split('?')[0];
    if (urlPath !== '/api/tcp') return;

    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log('[WS] upgrade -> /api/tcp');

      // Abre TCP quando o WebSocket é estabelecido
      const tcp = net.createConnection({ host: TCP_HOST, port: TCP_PORT }, () => {
        console.log(`[WS] TCP conectado ${TCP_HOST}:${TCP_PORT}`);
        try { ws.send(`[INFO] Bridge conectado ao TCP ${TCP_HOST}:${TCP_PORT}`); } catch {}
        tcp.setNoDelay(true);
        tcp.setKeepAlive(true, 15_000);

        
        
      });

      // Encaminha WebSocket -> TCP (garantindo newline)
      ws.on('message', (raw: any) => {
        const s = Buffer.isBuffer(raw) ? raw.toString() : String(raw);
        const out = s.endsWith('\n') ? s : s + '\n';
        try { tcp.write(out); } catch {}
      });

      // Encaminha TCP -> WebSocket
      tcp.on('data', (data) => {
        if (ws.readyState === ws.OPEN) {
          try { ws.send(data.toString()); } catch {}
        }
      });

      const pingIv = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          try { ws.ping(); } catch {}
        }
      }, 20000);

      let closed = false;
      const closeBoth = (why: string) => {
        if (closed) return;
        closed = true;
        clearInterval(pingIv);
        try { tcp.end(); } catch {}
        try { tcp.destroy(); } catch {}
        try { if (ws.readyState === ws.OPEN) ws.close(1000, why); } catch {}
        console.log('[WS] closed:', why);
      };

      ws.on('close', () => closeBoth('ws-close'));
      ws.on('error', () => closeBoth('ws-error'));
      tcp.on('end',   () => closeBoth('tcp-end'));
      tcp.on('close', () => closeBoth('tcp-close'));
      tcp.on('error', (err) => {
        try { if (ws.readyState === ws.OPEN) ws.send(`[ERRO TCP] ${err.message}`); } catch {}
        closeBoth('tcp-error');
      });
    });
  });

  (srv as any).wss = wss;
  srv.__wss_inited = true;
  console.log(`[WS] bridge /api/tcp pronto → TCP ${TCP_HOST}:${TCP_PORT}`);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const srv = res.socket.server as WithWSS;
  initWSS(srv);
  // Chamada HTTP atua como gatilho para garantir que o upgrade esteja instalado
  res.status(200).end('WS bridge ready');
}
