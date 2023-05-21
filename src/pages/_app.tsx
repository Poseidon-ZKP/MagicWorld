import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import WalletProvider from '../providers/WalletProvider';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </QueryClientProvider>
  );
}
