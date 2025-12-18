import { useEffect, useState } from 'react';

export function useRealTimeStats(modelId: string, interval: number = 5000) {
  const [stats, setStats] = useState({
    totalInferences: 0,
    totalDownloads: 0,
    activeUsers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/models/${modelId}/stats`);
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, interval);

    return () => clearInterval(intervalId);
  }, [modelId, interval]);

  return { stats, loading };
}

export function useRealtimeModels(interval: number = 10000) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.models || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };

    fetchModels();
    const intervalId = setInterval(fetchModels, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { models, loading };
}
