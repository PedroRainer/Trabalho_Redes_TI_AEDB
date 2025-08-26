import Terminal from '../src/components/Terminal';
import SocketControls from '../src/components/SocketControls';
import { useLogger } from '../src/hooks/useLogger';

export default function Home() {
  const { logs } = useLogger();

  return (
    <main className="mengao mengao-bg">
      <div className="mengao-container">
        <header className="mengao-card">
          <h1 className="mengao-title">
            <span className="bar" /> Socket Test UI — Flamengo Version
          </h1>
          <p style={{opacity:.9, marginTop:'.25rem'}}>
            Cliente WebSocket ⇄ Bridge (upgrade) ⇄ Servidor TCP
          </p>
        </header>

        <section className="mengao-card" style={{marginTop:'1rem'}}>
          <div className="row">
            
            <SocketControls />
          </div>
        </section>

        <section className="mengao-card" style={{marginTop:'1rem'}}>
         
          <div className="terminal">
            <Terminal logs={logs} />
          </div>
        </section>
      </div>
    </main>
  );
}