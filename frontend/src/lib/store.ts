import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserActivity {
  modelViews: string[];
  searches: string[];
  purchases: string[];
  inferences: string[];
}

interface UserStore {
  userActivity: UserActivity;
  trackModelView: (modelId: string) => void;
  trackSearch: (query: string) => void;
  trackPurchase: (modelId: string) => void;
  trackInference: (modelId: string) => void;
  getRecommendations: () => string[];
  clearActivity: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userActivity: {
        modelViews: [],
        searches: [],
        purchases: [],
        inferences: [],
      },

      trackModelView: (modelId: string) => {
        set((state) => ({
          userActivity: {
            ...state.userActivity,
            modelViews: [...new Set([modelId, ...state.userActivity.modelViews])].slice(0, 50),
          },
        }));
      },

      trackSearch: (query: string) => {
        set((state) => ({
          userActivity: {
            ...state.userActivity,
            searches: [...new Set([query, ...state.userActivity.searches])].slice(0, 20),
          },
        }));
      },

      trackPurchase: (modelId: string) => {
        set((state) => ({
          userActivity: {
            ...state.userActivity,
            purchases: [...new Set([modelId, ...state.userActivity.purchases])],
          },
        }));
      },

      trackInference: (modelId: string) => {
        set((state) => ({
          userActivity: {
            ...state.userActivity,
            inferences: [modelId, ...state.userActivity.inferences].slice(0, 100),
          },
        }));
      },

      getRecommendations: () => {
        const { modelViews, purchases, inferences } = get().userActivity;
        // Simple recommendation: most viewed and used models
        const allActivity = [...modelViews, ...purchases, ...inferences];
        const frequency = allActivity.reduce((acc, modelId) => {
          acc[modelId] = (acc[modelId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(frequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([modelId]) => modelId);
      },

      clearActivity: () => {
        set({
          userActivity: {
            modelViews: [],
            searches: [],
            purchases: [],
            inferences: [],
          },
        });
      },
    }),
    {
      name: 'user-activity-storage',
    }
  )
);
