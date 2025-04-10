import { persist } from 'zustand/middleware'
import { create } from 'zustand'

export interface UserState {
  currentUser: string
  setUser: (user: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: "guest", // Default to guest user
      setUser: (user: string) => {
        if (!user) return; // Don't allow empty user
        const userToSet = user || get().currentUser; // Use current user as fallback
        console.log('User store updating to:', userToSet);
        set({ currentUser: userToSet });
      },
    }),
    {
      name: 'friday-user-storage',
      // Only store currentUser in localStorage
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)
