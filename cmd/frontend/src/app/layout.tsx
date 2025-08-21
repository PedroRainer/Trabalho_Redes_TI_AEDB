import './globals.css';
import { LoggerProvider } from '../hooks/useLogger';


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="pt-BR">
<body>
<LoggerProvider>
{children}
</LoggerProvider>
</body>
</html>
);
}