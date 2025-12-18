import '@/styles/globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/contexts/WalletContext'
import Layout from '@/components/Layout'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WalletProvider>
    </QueryClientProvider>
  )
}
