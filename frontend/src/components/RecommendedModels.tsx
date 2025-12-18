import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/store';
import { fetchModels } from '@/lib/api';

interface Model {
  pubkey: string;
  name: string;
  description: string;
  totalInferences: number;
  totalDownloads: number;
  inferencePrice: number;
  downloadPrice: number;
}

export default function RecommendedModels() {
  const { getRecommendations, userActivity } = useUserStore();
  const [recommendedModels, setRecommendedModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const allModels = await fetchModels();
        const recommendedIds = getRecommendations();

        if (recommendedIds.length > 0) {
          // Filter models based on user activity
          const filtered = allModels.filter((m: Model) => 
            recommendedIds.includes(m.pubkey)
          );
          setRecommendedModels(filtered);
        } else {
          // Show trending models if no activity
          const trending = allModels
            .sort((a: Model, b: Model) => 
              (b.totalInferences + b.totalDownloads) - (a.totalInferences + a.totalDownloads)
            )
            .slice(0, 6);
          setRecommendedModels(trending);
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [getRecommendations, userActivity]);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedModels.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-2">
        {userActivity.modelViews.length > 0 ? 'Recommended For You' : 'Trending Models'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {userActivity.modelViews.length > 0 
          ? 'Based on your activity and preferences'
          : 'Popular models in the marketplace'}
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendedModels.map((model) => (
          <a
            key={model.pubkey}
            href={`/models/${model.pubkey}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-2">{model.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {model.description}
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">
                {model.totalInferences} runs
              </span>
              <span className="text-purple-600">
                {model.totalDownloads} downloads
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
