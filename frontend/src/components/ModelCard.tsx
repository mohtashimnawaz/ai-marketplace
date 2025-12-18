import Link from 'next/link'
import { Download, Zap, TrendingUp } from 'lucide-react'

interface ModelCardProps {
  model: any
}

const ModelCard = ({ model }: ModelCardProps) => {
  return (
    <Link href={`/models/${model.pubkey}`}>
      <div className="card hover:shadow-xl transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{model.name || 'Unnamed Model'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {model.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-primary-600">
            <Zap className="w-4 h-4" />
            <span>{model.totalInferences || 0} runs</span>
          </div>
          <div className="flex items-center gap-1 text-secondary-600">
            <Download className="w-4 h-4" />
            <span>{model.totalDownloads || 0} downloads</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500">Inference</p>
            <p className="font-semibold">{(model.inferencePrice || 0) / 1e9} SOL</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Download</p>
            <p className="font-semibold">{(model.downloadPrice || 0) / 1e9} SOL</p>
          </div>
          <button className="btn btn-primary btn-sm">
            View Details
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ModelCard
