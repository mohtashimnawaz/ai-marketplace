import Head from 'next/head'
import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import { Upload, Loader } from 'lucide-react'
import { uploadModel, uploadMetadata } from '@/lib/api'
import { getProgram, getMarketplacePDA, getModelPDA } from '@/lib/anchor'
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function Creator() {
  const { publicKey, sendTransaction, wallet } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inferencePrice: '',
    downloadPrice: '',
    storageType: 'ipfs',
  })
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey || !wallet) {
      alert('Please connect your wallet first')
      return
    }

    if (!modelFile) {
      alert('Please select a model file')
      return
    }

    setLoading(true)

    try {
      // Step 1: Upload model file
      setStep(1)
      const uploadResult = await uploadModel(
        modelFile,
        publicKey.toBase58(),
        formData.storageType
      )

      // Step 2: Upload metadata
      setStep(2)
      const metadataResult = await uploadMetadata({
        name: formData.name,
        description: formData.description,
        framework: 'ONNX',
      })

      // Step 3: Register on-chain
      setStep(3)
      const program = getProgram(connection, wallet.adapter as any)
      const [marketplace] = getMarketplacePDA()

      // Get the next model ID from marketplace
      const marketplaceAccount = await program.account.marketplace.fetch(marketplace) as any
      const modelId = marketplaceAccount.totalModels

      const [modelPDA] = getModelPDA(publicKey, modelId.toNumber())

      const tx = await program.methods
        .registerModel(
          formData.name,
          formData.description,
          uploadResult.modelHash,
          uploadResult.storageUri,
          BigInt(uploadResult.fileSize),
          BigInt(parseFloat(formData.inferencePrice) * LAMPORTS_PER_SOL),
          BigInt(parseFloat(formData.downloadPrice) * LAMPORTS_PER_SOL),
          { sol: {} }
        )
        .accounts({
          model: modelPDA,
          marketplace,
          creator: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('Transaction signature:', tx)

      alert('Model registered successfully!')
      router.push('/my-models')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setStep(1)
    }
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to list models
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>List Your Model - Dece AI</title>
      </Head>

      <div className="min-h-screen bg-slate-950 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400">List Your AI Model</h1>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Model Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Model Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                  placeholder="e.g., Image Classification Model"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Description *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  maxLength={500}
                  placeholder="Describe your model, its capabilities, and use cases..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Model File *
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".onnx,.pkl,.pt,.pth,.h5,.pb,.tflite"
                    className="hidden"
                    id="model-file"
                  />
                  <label
                    htmlFor="model-file"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-cyan-400 mb-4" />
                    <p className="text-sm text-gray-300">
                      {modelFile ? modelFile.name : 'Click to upload model file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: .onnx, .pkl, .pt, .pth, .h5, .pb, .tflite
                    </p>
                  </label>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Inference Price (SOL) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    value={formData.inferencePrice}
                    onChange={(e) => setFormData({ ...formData, inferencePrice: e.target.value })}
                    required
                    placeholder="0.001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Download Price (SOL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    value={formData.downloadPrice}
                    onChange={(e) => setFormData({ ...formData, downloadPrice: e.target.value })}
                    required
                    placeholder="0.1"
                  />
                </div>
              </div>

              {/* Storage Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Storage Provider
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                >
                  <option value="ipfs">IPFS</option>
                  <option value="arweave">Arweave</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-medium bg-gradient-to-r from-cyan-500 to-rose-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    {step === 1 && 'Uploading model...'}
                    {step === 2 && 'Uploading metadata...'}
                    {step === 3 && 'Registering on-chain...'}
                  </span>
                ) : (
                  'List Model'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
