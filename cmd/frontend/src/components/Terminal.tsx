'use client';


import { useLogger } from '../hooks/useLogger';


export default function Terminal() {
const { logs } = useLogger();
return (
<div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded h-64 overflow-y-auto font-mono text-sm">
{logs.map((log, i) => (
<div key={i} className="text-green-400">{log}</div>
))}
</div>
);
}