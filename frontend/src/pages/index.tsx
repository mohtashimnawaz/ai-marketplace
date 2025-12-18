import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
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
  const [showText, setShowText] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)
  
  const [stats, setStats] = useState({
    totalModels: 0,
    totalInferences: 0,
    activeUsers: 0
  })
  
  useEffect(() => {
    // Reset and trigger animation on mount
    setShowText(false)
    const timer = setTimeout(() => {
      setShowText(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])
  
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-lime-500 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03]"></div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg border border-slate-700">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500"></span>
                </span>
                <span className="text-gray-300">Live on Solana Devnet</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider">
                {showText && (
                  <span 
                    ref={textRef}
                    className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400"
                    style={{
                      animation: 'revealText 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    }}
                  >
                    Decentralized AI
                  </span>
                )}
                {!showText && (
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400 opacity-0">
                    Decentralized AI
                  </span>
                )}
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-lime-400 via-cyan-400 to-rose-400">
                  Marketplace
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-gray-400 leading-relaxed">
                Trade, deploy, and monetize AI models on Solana blockchain with pay-per-use or full ownership
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/explore" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.7)] transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore Models
                </Link>
                <Link href="/creator" className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/80 backdrop-blur-sm text-white font-semibold rounded-xl shadow-lg border border-slate-600 hover:border-rose-400 hover:shadow-[0_0_30px_rgba(251,113,133,0.3)] transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  List Your Model
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12 max-w-4xl mx-auto">
                <div className="text-center p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{stats.totalModels}+</div>
                  <div className="text-sm text-gray-400 mt-1">AI Models</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <div className="text-3xl md:text-4xl font-bold text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]">{stats.totalInferences.toLocaleString()}+</div>
                  <div className="text-sm text-gray-400 mt-1">Inferences</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <div className="text-3xl md:text-4xl font-bold text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]">{stats.activeUsers}+</div>
                  <div className="text-sm text-gray-400 mt-1">Active Users</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">24/7</div>
                  <div className="text-sm text-gray-400 mt-1">Availability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-24 px-4 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-600 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-600 rounded-full filter blur-3xl opacity-20"></div>
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400 tracking-widest">Why Choose Our Marketplace?</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-wide">Experience the future of AI model trading with blockchain technology</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="group relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-all duration-300 hover:-translate-y-2 border border-slate-700 hover:border-cyan-500/50">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500 rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 blur-xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                    <Zap className="w-8 h-8 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white tracking-wide">Pay-Per-Use</h3>
                  <p className="text-gray-400 leading-relaxed tracking-wide">
                    Run inferences without buying the entire model. Pay only for what you use with micro-transactions on Solana.
                  </p>
                </div>
              </div>
              <div className="group relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(251,113,133,0.15)] transition-all duration-300 hover:-translate-y-2 border border-slate-700 hover:border-rose-500/50">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-500 rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 blur-xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,113,133,0.4)]">
                    <Download className="w-8 h-8 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white tracking-wide">Full Ownership</h3>
                  <p className="text-gray-400 leading-relaxed tracking-wide">
                    Purchase models outright with NFT-gated access control enforced on-chain. True digital ownership.
                  </p>
                </div>
              </div>
              <div className="group relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(163,230,53,0.15)] transition-all duration-300 hover:-translate-y-2 border border-slate-700 hover:border-lime-500/50 sm:col-span-2 lg:col-span-1">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-lime-500 rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 blur-xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(163,230,53,0.4)]">
                    <Sparkles className="w-8 h-8 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white tracking-wide">Instant Deployment</h3>
                  <p className="text-gray-400 leading-relaxed">
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

        <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-600/10 to-rose-600/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-lime-600/10 to-amber-600/10 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white tracking-widest">Featured Models</h2>
                <p className="text-gray-400 tracking-wide">Discover the most popular AI models</p>
              </div>
              <Link href="/explore" className="group inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold">
                View All Models
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search models by name or description..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-lg text-lg text-white placeholder-gray-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700 mb-6">
                  <Sparkles className="w-10 h-10 text-cyan-400" />
                </div>
                <p className="text-xl text-white mb-4 font-semibold">No models yet</p>
                <p className="text-gray-400 mb-8">Be the first creator to list an AI model!</p>
                <Link href="/creator" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.7)] transform hover:-translate-y-1 transition-all duration-200">
                  <Upload className="w-5 h-5" />
                  List Your Model
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-rose-600 to-orange-600 rounded-full filter blur-[150px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full filter blur-[150px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-lime-600 to-emerald-600 rounded-full filter blur-[150px] opacity-15 animate-blob animation-delay-4000"></div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03]"></div>
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-rose-400 to-lime-400 tracking-widest animate-glow">Ready to Get Started?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed tracking-wide">
              Join thousands of creators and users building the future of decentralized AI. Connect your wallet to begin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.7)] transform hover:-translate-y-1 transition-all duration-200">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Browse Models
              </Link>
              <Link href="/creator" className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/80 backdrop-blur-sm text-white font-semibold rounded-xl border border-slate-600 hover:border-rose-400 hover:shadow-[0_0_30px_rgba(251,113,133,0.3)] transform hover:-translate-y-1 transition-all duration-200">
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
