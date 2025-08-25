import type { NextApiRequest } from 'next';
import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import net from 'net';

export const config = { api: { bodyParser: false } };

/**
 * Em dev (npm run dev): conecta no Go local 127.0.0.1:1234
 * Em produção (Docker): conecta no serviço 'views:1234'
 * Pode sobrescrever com variáveis de ambiente TCP_HOST/TCP_PORT
 */
const TCP_HOST =
  process.env.TCP_HOST ||
  (process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'views');

const TCP_PORT = Number(process.env.TCP_PORT || 1234);

let initialized = false;

export default function handler(req: NextApiRequest, res: any) {
  const srv: Server & { wss?: WebSocketServer } = res.socket.server as any;

  // instala o listener de upgrade uma única vez
  if (!srv.wss && !initialized) {
    const wss = new WebSocketServer({ noServer: true });

    srv.on('upgrade', (request: any, socket: any, head: Buffer) => {
      const urlPath = (request.url || '').split('?')[0]; // ex: /api/tcp
      if (urlPath !== '/api/tcp') {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        // 1) ABRIR TCP (na hora do upgrade)
        const tcp = net.createConnection(
          { host: TCP_HOST, port: TCP_PORT },
          () => {
            try { ws.send(`[INFO] TCP conectado em ${TCP_HOST}:${TCP_PORT}`); } catch {}
            tcp.setNoDelay(true);
            tcp.setKeepAlive(true, 15_000); // keepalive TCP a cada 15s
          }
        );

        // 2) MANTER ABERTO → encaminhar dados nos dois sentidos
        ws.on('message', (msg) => {
          // opcional: lidar com comandos de controle
          const s = msg.toString();
          if (s === '__PING__') return; // ignore pings vindos do cliente
          tcp.write(s.endsWith('\n') ? s : s + '\n');
        });

        tcp.on('data', (data) => {
          if (ws.readyState === ws.OPEN) {
            try { ws.send(data.toString()); } catch {}
          }
        });

        // ping/pong WS para evitar timeouts por inatividade
        const pingIv = setInterval(() => {
          if (ws.readyState !== ws.OPEN) return;
          try { ws.ping(); } catch {}
        }, 20_000);

        ws.on('pong', () => { /* opcional: registrar liveness */ });

        // 3) FECHAR LIMPO
        const closeBoth = (reason?: string) => {
          clearInterval(pingIv);
          try { tcp.end(); } catch {}
          try { tcp.destroy(); } catch {}
          try { if (ws.readyState === ws.OPEN) ws.close(1000, reason || 'closing'); } catch {}
        };

        ws.on('close', () => closeBoth('ws-close'));
        ws.on('error', () => closeBoth('ws-error'));

        tcp.on('end', () => closeBoth('tcp-end'));
        tcp.on('close', () => closeBoth('tcp-close'));
        tcp.on('error', (err) => {
          try { ws.send(`[ERRO TCP] ${err.message}`); } catch {}
          closeBoth('tcp-error');
        });
      });
    });

    (srv as any).wss = wss;
    initialized = true;
    console.log(`[WS] bridge /api/tcp pronto → TCP ${TCP_HOST}:${TCP_PORT}`);
  }

  // Força a inicialização do listener acima numa chamada HTTP
  res.status(200).end('WS bridge ready');
}
