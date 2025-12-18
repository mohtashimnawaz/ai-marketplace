import Head from 'next/head'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Grid, List, Sparkles, TrendingUp, Clock, DollarSign } from 'lucide-react'
import ModelCard from '@/components/ModelCard'
import { fetchModels } from '@/lib/api'
import { useUserStore } from '@/lib/store'

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high'
type ViewMode = 'grid' | 'list'

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { trackSearch } = useUserStore()

  const { data: models, isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
    refetchInterval: 30000,
  })

  const categories = [
    { id: 'all', name: 'All Models', icon: Sparkles },
    { id: 'nlp', name: 'NLP', icon: Sparkles },
    { id: 'vision', name: 'Computer Vision', icon: Sparkles },
    { id: 'audio', name: 'Audio', icon: Sparkles },
    { id: 'generative', name: 'Generative', icon: Sparkles },
  ]

  const filteredAndSortedModels = useMemo(() => {
    if (!models) return []

    let filtered = models.filter((model: any) => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    switch (sortBy) {
      case 'newest':
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-low':
        filtered.sort((a: any, b: any) => (a.inferencePrice || 0) - (b.inferencePrice || 0))
        break
      case 'price-high':
        filtered.sort((a: any, b: any) => (b.inferencePrice || 0) - (a.inferencePrice || 0))
        break
      case 'popular':
      default:
        filtered.sort((a: any, b: any) => (b.totalInferences || 0) - (a.totalInferences || 0))
    }

    return filtered
  }, [models, searchQuery, sortBy, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim())
    }
  }

  return (
    <>
      <Head>
        <title>Explore AI Models | Dece AI</title>
        <meta name="description" content="Discover and explore AI models on the decentralized marketplace" />
      </Head>

      <main className="min-h-screen bg-slate-950">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400">
                Explore AI Models
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Discover cutting-edge AI models from creators around the world
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search models by name, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </form>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  {filteredAndSortedModels.length} models found
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-rose-400 mb-4">Failed to load models</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredAndSortedModels.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No models found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Models Grid */}
            {!isLoading && !error && filteredAndSortedModels.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredAndSortedModels.map((model: any) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
