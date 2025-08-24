'use client';


import { createContext, useContext, useState } from 'react';


type LoggerContextType = {
logs: string[];
addLog: (msg: string) => void;
};


const LoggerContext = createContext<LoggerContextType>({ logs: [], addLog: () => {} });


export function LoggerProvider({ children }: { children: React.ReactNode }) {
const [logs, setLogs] = useState<string[]>([]);


const addLog = (msg: string) => {
setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
};


return (
<LoggerContext.Provider value={{ logs, addLog }}>
{children}
</LoggerContext.Provider>
);
}


export const useLogger = () => useContext(LoggerContext);