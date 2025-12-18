import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Download, Zap, Wallet } from 'lucide-react'
import { fetchModelsByCreator, fetchUserAccess, fetchInferenceHistory } from '@/lib/api'
import ModelCard from '@/components/ModelCard'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
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
        <title>Dashboard - AI Marketplace</title>
      </Head>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">
                {(totalRevenue / 1e9).toFixed(4)} SOL
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Total Inferences</span>
                <Zap className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-3xl font-bold">{totalInferences}</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Total Downloads</span>
                <Download className="w-5 h-5 text-secondary-500" />
              </div>
              <p className="text-3xl font-bold">{totalDownloads}</p>
            </div>
          </div>

          {/* My Models */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Models</h2>
              <a href="/creator" className="btn btn-primary">
                List New Model
              </a>
            </div>

            {modelsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : myModels && myModels.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myModels.map((model: any) => (
                  <ModelCard key={model.pubkey} model={model} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't listed any models yet
                </p>
                <a href="/creator" className="btn btn-primary">
                  List Your First Model
                </a>
              </div>
            )}
          </section>

          {/* My Access */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">My Model Access</h2>

            {accessLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : myAccess && myAccess.length > 0 ? (
              <div className="card">
                <div className="space-y-4">
                  {myAccess.map((access: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-semibold">Model Access</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {access.accessType}
                        </p>
                      </div>
                      <span className="text-green-500 font-medium">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't purchased access to any models yet
                </p>
              </div>
            )}
          </section>

          {/* Inference History */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Inference Activity</h2>

            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : myHistory && myHistory.length > 0 ? (
              <div className="card">
                <div className="space-y-4">
                  {myHistory.slice(0, 10).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-semibold">Inference Run</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(item.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                      <Zap className="w-5 h-5 text-primary-500" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
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
