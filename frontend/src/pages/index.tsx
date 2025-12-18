import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Download, Zap, Search } from 'lucide-react'
import ModelCard from '@/components/ModelCard'
import { fetchModels } from '@/lib/api'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  })

  const filteredModels = models?.filter((model: any) =>
    model.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>AI Marketplace - Decentralized AI Model Trading on Solana</title>
        <meta name="description" content="Buy, sell, and run AI models on the blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              Decentralized AI Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300">
              Trade, deploy, and monetize AI models on Solana
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/explore" className="btn btn-primary text-lg px-8 py-3">
                Explore Models
              </Link>
              <Link href="/creator" className="btn bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-lg px-8 py-3">
                List Your Model
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why AI Marketplace?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                <h3 className="text-xl font-semibold mb-2">Pay-Per-Use</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Run inferences without buying the entire model. Pay only for what you use.
                </p>
              </div>
              <div className="card text-center">
                <Download className="w-12 h-12 mx-auto mb-4 text-secondary-600" />
                <h3 className="text-xl font-semibold mb-2">Full Ownership</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Purchase models outright with NFT-gated access control on-chain.
                </p>
              </div>
              <div className="card text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Deploy models to edge compute nodes for fast, decentralized inference.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Models</h2>
              <Link href="/explore" className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search models..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Models Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading models...</p>
              </div>
            ) : filteredModels && filteredModels.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.slice(0, 6).map((model: any) => (
                  <ModelCard key={model.pubkey} model={model} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No models found. Be the first to list one!
                </p>
                <Link href="/creator" className="btn btn-primary mt-4">
                  List Your Model
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join the decentralized AI revolution. Connect your wallet to begin.
            </p>
            <Link href="/explore" className="btn btn-primary text-lg px-8 py-3">
              Browse Models
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
