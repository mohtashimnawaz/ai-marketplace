import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Download, Zap, Search, Upload } from 'lucide-react'
import ModelCard from '@/components/ModelCard'
import RecommendedModels from '@/components/RecommendedModels'
import LiveStatsBar from '@/components/LiveStatsBar'
import { fetchModels } from '@/lib/api'
import { useUserStore } from '@/lib/store'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const { trackSearch } = useUserStore()
  
  const [stats, setStats] = useState({
    totalModels: 0,
    totalInferences: 0,
    activeUsers: 0
  })
  
  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        trackSearch(searchQuery)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, trackSearch])
  
  useEffect(() => {
    // Update stats based on models data
    if (models) {
      setStats(prev => ({
        ...prev,
        totalModels: models.length
      }))
    }
  }, [models])

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
        <LiveStatsBar />

        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          {/* Animated Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-gray-950 dark:via-teal-950 dark:to-gray-950"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-400 dark:bg-teal-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-400 dark:bg-cyan-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-400 dark:bg-emerald-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">Live on Solana Devnet</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 animate-gradient">
                  Decentralized AI
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">
                  Marketplace
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
                Trade, deploy, and monetize AI models on Solana blockchain with pay-per-use or full ownership
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/explore" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore Models
                </Link>
                <Link href="/creator" className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  List Your Model
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">{stats.totalModels}+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">AI Models</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalInferences.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inferences</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeUsers}+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Availability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/30 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200 dark:bg-teal-900/30 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-teal-600">Why Choose Our Marketplace?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Experience the future of AI model trading with blockchain technology</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="group relative bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-cyan-100 dark:border-gray-700">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-200 dark:bg-cyan-900 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Pay-Per-Use</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Run inferences without buying the entire model. Pay only for what you use with micro-transactions on Solana.
                  </p>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-teal-100 dark:border-gray-700">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-200 dark:bg-teal-900 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Full Ownership</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Purchase models outright with NFT-gated access control enforced on-chain. True digital ownership.
                  </p>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-emerald-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 dark:bg-emerald-900 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Instant Deployment</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Deploy models to edge compute nodes for fast, decentralized inference with low latency worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-white dark:bg-gray-800">
          <div className="container mx-auto max-w-6xl">
            <RecommendedModels />
          </div>
        </section>

        <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-white via-cyan-50/30 to-teal-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Featured Models</h2>
                <p className="text-gray-600 dark:text-gray-400">Discover the most popular AI models</p>
              </div>
              <Link href="/explore" className="group inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold">
                View All Models
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search models by name or description..."
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-lg text-lg transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-teal-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : filteredModels && filteredModels.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredModels.slice(0, 6).map((model: any, index: number) => (
                  <div key={model.pubkey} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                    <ModelCard model={model} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 mb-6">
                  <Sparkles className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-xl text-gray-900 dark:text-white mb-4 font-semibold">No models yet</p>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Be the first creator to list an AI model!</p>
                <Link href="/creator" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                  <Upload className="w-5 h-5" />
                  List Your Model
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500 to-green-500 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators and users building the future of decentralized AI. Connect your wallet to begin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Browse Models
              </Link>
              <Link href="/creator" className="group inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Become a Creator
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
