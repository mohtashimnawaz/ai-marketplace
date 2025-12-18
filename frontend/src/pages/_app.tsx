import '@/styles/globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/contexts/WalletContext'
import Layout from '@/components/Layout'
import { Rajdhani, Orbitron } from 'next/font/google'

const rajdhani = Rajdhani({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const orbitron = Orbitron({ 
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <div className={`${rajdhani.variable} ${orbitron.variable}`}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </WalletProvider>
    </QueryClientProvider>
  )
}
