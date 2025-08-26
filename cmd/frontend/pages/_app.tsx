import type { AppProps } from 'next/app';
import '../src/styles/terminal.css'; 
import '../src/styles/global.css';


import { LoggerProvider } from '../src/hooks/useLogger';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LoggerProvider>
      <Component {...pageProps} />
    </LoggerProvider>
  );
}
