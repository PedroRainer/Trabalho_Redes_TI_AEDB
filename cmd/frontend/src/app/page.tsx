'use client';

import SocketControls from '../components/SocketControls';
import Terminal from '../components/Terminal';
import { useLogger } from '../hooks/useLogger';

export default function Home() {
  const { logs } = useLogger();

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Socket Test UI</h1>
      
      <div className="mb-8">
        <SocketControls />
      </div>

      <Terminal logs={logs} />
    </main>
  );
}
