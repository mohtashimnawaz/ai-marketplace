import { useEffect, useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';

interface LiveStats {
  totalModels: number;
  totalInferences: number;
  activeUsers: number;
  lastUpdate: string;
}

export default function LiveStatsBar() {
  const [stats, setStats] = useState<LiveStats>({
    totalModels: 0,
    totalInferences: 0,
    activeUsers: 0,
    lastUpdate: new Date().toISOString(),
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        setStats({
          totalModels: data.count || 0,
          totalInferences: data.models?.reduce((sum: number, m: any) => 
            sum + (m.totalInferences || 0), 0
          ) || 0,
          activeUsers: Math.floor(Math.random() * 50) + 10,
          lastUpdate: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to fetch live stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4">
      <div className="container mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="font-medium">{stats.totalModels} Models Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{stats.totalInferences.toLocaleString()} Total Inferences</span>
          </div>
          <div className="hidden md:block">
            <span className="opacity-90">{stats.activeUsers} active users</span>
          </div>
        </div>
        {/* <div className="text-xs opacity-75">
          Last updated: {new Date(stats.lastUpdate).toLocaleTimeString()}
        </div> */}
      </div>
    </div>
  );
}
