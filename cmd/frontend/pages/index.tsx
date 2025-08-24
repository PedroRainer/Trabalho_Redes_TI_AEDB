import Terminal from '../src/components/Terminal';
import SocketControls from '../src/components/SocketControls';
import { useLogger } from '../src/hooks/useLogger';

export default function Home() {
  const { logs } = useLogger();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Socket Test UI</h1>
      <SocketControls />
      <Terminal logs={logs} />
    </div>
  );
}
