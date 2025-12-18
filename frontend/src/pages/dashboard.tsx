import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Download, Zap, Wallet } from 'lucide-react'
import { fetchModelsByCreator, fetchUserAccess, fetchInferenceHistory } from '@/lib/api'
import ModelCard from '@/components/ModelCard'
import Link from 'next/link'

export default function Dashboard() {
  const { publicKey } = useWallet()

  const { data: myModels, isLoading: modelsLoading } = useQuery({
    queryKey: ['myModels', publicKey?.toBase58()],
    queryFn: () => fetchModelsByCreator(publicKey!.toBase58()),
    enabled: !!publicKey,
  })

  const { data: myAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['myAccess', publicKey?.toBase58()],
    queryFn: () => fetchUserAccess(publicKey!.toBase58()),
    enabled: !!publicKey,
  })

  const { data: myHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['myHistory', publicKey?.toBase58()],
    queryFn: () => fetchInferenceHistory(publicKey!.toBase58()),
    enabled: !!publicKey,
  })

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to view your dashboard
          </p>
        </div>
      </div>
    )
  }

  const totalRevenue = myModels?.reduce((sum: number, model: any) => 
    sum + (model.totalRevenue || 0), 0
  ) || 0

  const totalInferences = myModels?.reduce((sum: number, model: any) => 
    sum + (model.totalInferences || 0), 0
  ) || 0

  const totalDownloads = myModels?.reduce((sum: number, model: any) => 
    sum + (model.totalDownloads || 0), 0
  ) || 0

  return (
    <>
      <Head>
        <title>Dashboard - Dece AI</title>
      </Head>

      <div className="min-h-screen bg-slate-950 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Revenue</span>
                <TrendingUp className="w-5 h-5 text-lime-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {(totalRevenue / 1e9).toFixed(4)} SOL
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Inferences</span>
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalInferences}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Downloads</span>
                <Download className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalDownloads}</p>
            </div>
          </div>

          {/* My Models */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">My Models</h2>
              <Link href="/creator" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                List New Model
              </Link>
            </div>

            {modelsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
              </div>
            ) : myModels && myModels.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myModels.map((model: any) => (
                  <ModelCard key={model.pubkey} model={model} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl text-center py-12">
                <p className="text-gray-400 mb-4">
                  You haven't listed any models yet
                </p>
                <Link href="/creator" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all inline-block">
                  List Your First Model
                </Link>
              </div>
            )}
          </section>

          {/* My Access */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">My Model Access</h2>

            {accessLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
              </div>
            ) : myAccess && myAccess.length > 0 ? (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="space-y-4">
                  {myAccess.map((access: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div>
                        <p className="font-semibold text-white">Model Access</p>
                        <p className="text-sm text-gray-400">
                          {access.accessType}
                        </p>
                      </div>
                      <span className="text-lime-400 font-medium">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl text-center py-12">
                <p className="text-gray-400">
                  You haven't purchased access to any models yet
                </p>
              </div>
            )}
          </section>

          {/* Inference History */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white">Recent Inference Activity</h2>

            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
              </div>
            ) : myHistory && myHistory.length > 0 ? (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="space-y-4">
                  {myHistory.slice(0, 10).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div>
                        <p className="font-semibold text-white">Inference Run</p>
                        <p className="text-sm text-gray-400">
                          {new Date(item.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl text-center py-12">
                <p className="text-gray-400">
                  No inference history yet
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
