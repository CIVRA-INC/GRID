import { create } from 'zustand';

// 1. Define the shape of our state
interface AppState {
  isLoading: boolean;
  error: string | null;
  createPostForm: {
    content: string;
    isAnonymous: boolean;
  };
}

// 2. Define the actions that can modify the state
interface AppActions {
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateCreatePostForm: (field: string, value: any) => void;
  resetCreatePostForm: () => void;
}

// 3. Create the store with the initial state and actions
const useAppStore = create<AppState & AppActions>((set) => ({
  // Initial State
  isLoading: false,
  error: null,
  createPostForm: {
    content: '',
    isAnonymous: false,
  },

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateCreatePostForm: (field, value) => set((state) => ({
    createPostForm: {
      ...state.createPostForm,
      [field]: value,
    },
  })),
  resetCreatePostForm: () => set({
    createPostForm: { content: '', isAnonymous: false },
  }),
}));

export default useAppStore;