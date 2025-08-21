'use client';

import React from 'react';
import './terminal.css';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
      </div>
      <div className="terminal-body">
        {logs.map((log, index) => (
          <pre key={index} className="terminal-line">{log}</pre>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
