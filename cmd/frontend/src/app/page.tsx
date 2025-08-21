import SocketControls from '../components/SocketControls';
import Terminal from '../components/Terminal';


export default function Home() {
return (
<main className="min-h-screen p-8 bg-black text-white">
<h1 className="text-2xl font-bold">Microsocket Test UI</h1>
<SocketControls />
<Terminal />
</main>
);
}