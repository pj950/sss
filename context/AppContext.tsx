
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AppState, Team, Judge, Criterion, Rating } from '../types';

const initialState: AppState = {
  teams: [],
  judges: [],
  criteria: [],
  ratings: [],
  activeTeamId: null,
  isSetupLocked: false,
};

// Define a type for the context that includes the state and the async functions
interface AppContextType {
  state: AppState;
  loading: boolean;
  addTeam: (name: string) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  addJudge: (name: string) => Promise<void>;
  removeJudge: (id: string) => Promise<void>;
  addCriterion: (name: string, maxScore: number) => Promise<void>;
  removeCriterion: (id: string) => Promise<void>;
  toggleLockSetup: (lock: boolean) => Promise<void>;
  setActiveTeam: (teamId: string | null) => Promise<void>;
  submitRating: (rating: Omit<Rating, 'judge_id'>, judgeId: string) => Promise<void>;
  systemReset: () => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  state: initialState,
  loading: true,
  addTeam: async () => {},
  removeTeam: async () => {},
  addJudge: async () => {},
  removeJudge: async () => {},
  addCriterion: async () => {},
  removeCriterion: async () => {},
  toggleLockSetup: async () => {},
  setActiveTeam: async () => {},
  submitRating: async () => {},
  systemReset: async () => {},
});

// Helper function to handle API requests
async function apiRequest(action: string, payload?: any) {
  const response = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({error: 'Failed to parse server error response.'}));
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
}


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const response = await fetch('/api');
      if (response.ok) {
        const data = await response.json();
        setState(data);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error(
          "Failed to fetch state from API.", 
          errorData ? `Server error: ${errorData.error}` : `Status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Network error while fetching state:", error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  }, [loading]);

  // Initial fetch and polling
  useEffect(() => {
    fetchState();
    const intervalId = setInterval(fetchState, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, [fetchState]);

  const contextValue: AppContextType = {
    state,
    loading,
    addTeam: async (name) => {
      try {
        await apiRequest('ADD_TEAM', { name });
        fetchState();
      } catch (error: any) {
        alert(`Failed to add team: ${error.message}`);
      }
    },
    removeTeam: async (id) => {
      try {
        await apiRequest('REMOVE_TEAM', { id });
        fetchState();
      } catch (error: any) {
        alert(`Failed to remove team: ${error.message}`);
      }
    },
    addJudge: async (name) => {
      try {
        await apiRequest('ADD_JUDGE', { name });
        fetchState();
      } catch (error: any) {
        alert(`Failed to add judge: ${error.message}`);
      }
    },
    removeJudge: async (id) => {
      try {
        await apiRequest('REMOVE_JUDGE', { id });
        fetchState();
      } catch (error: any) {
        alert(`Failed to remove judge: ${error.message}`);
      }
    },
    addCriterion: async (name, maxScore) => {
      try {
        await apiRequest('ADD_CRITERION', { name, maxScore });
        fetchState();
      } catch (error: any) {
        alert(`Failed to add criterion: ${error.message}`);
      }
    },
    removeCriterion: async (id) => {
      try {
        await apiRequest('REMOVE_CRITERION', { id });
        fetchState();
      } catch (error: any) {
        alert(`Failed to remove criterion: ${error.message}`);
      }
    },
    toggleLockSetup: async (isLocked) => {
      try {
        await apiRequest('SET_LOCK_SETUP', { isLocked });
        fetchState();
      } catch (error: any) {
        alert(`Failed to toggle lock: ${error.message}`);
      }
    },
    setActiveTeam: async (teamId) => {
      try {
        await apiRequest('SET_ACTIVE_TEAM', { teamId });
        fetchState();
      } catch (error: any) {
        alert(`Failed to set active team: ${error.message}`);
      }
    },
    submitRating: async (rating, judgeId) => {
      try {
        await apiRequest('SUBMIT_RATING', { ...rating, judgeId });
        fetchState();
      } catch (error: any) {
        alert(`Failed to submit rating: ${error.message}`);
      }
    },
    systemReset: async () => {
        if (window.confirm("!CRITICAL! This will wipe all data in the database permanently. Are you sure?")) {
            try {
                await apiRequest('SYSTEM_RESET');
                fetchState();
            } catch (error: any) {
                alert(`Failed to reset system: ${error.message}`);
            }
        }
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};