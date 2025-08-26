
import Terminal from '../src/components/Terminal';
import SocketControls from '../src/components/SocketControls';
import { useLogger } from '../src/hooks/useLogger';


export default function Home() {
  const { logs } = useLogger();

  return (
    <main className="body">
      <div className='body'>
        <header>
          <h1 className="h1">
            <span /> Socket Test UI — Flamengo Version
          </h1>
          <p>
            Cliente WebSocket ⇄ Bridge (upgrade) ⇄ Servidor TCP
          </p>
        </header>

        <section>
          <div className='button'>
            <SocketControls />
          </div>
        </section>

        <section>
          <div>
            <Terminal logs={logs} />
          </div>
        </section>
      </div>
    </main>
  );
}