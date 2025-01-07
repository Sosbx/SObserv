import { create } from 'zustand';
import { doc, collection, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

export interface EchoFavorite {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EchoFavoritesState {
  favorites: EchoFavorite[];
  loading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  addFavorite: (favorite: Omit<EchoFavorite, 'id' | 'order'>) => Promise<void>;
  updateFavorite: (id: string, favorite: Partial<EchoFavorite>) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  reorderFavorites: (favorites: EchoFavorite[]) => Promise<void>;
}

export const useEchoFavoritesStore = create<EchoFavoritesState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  loadFavorites: async () => {
    const { user } = useAuthStore.getState();

    try {
      set({ loading: true, error: null });

      if (user) {
        const favoritesRef = collection(db, `users/${user.uid}/echoFavorites`);
        const snapshot = await getDocs(favoritesRef);
        
        const favorites = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as EchoFavorite[];

        set({ 
          favorites: favorites.sort((a, b) => a.order - b.order),
          loading: false 
        });
      } else {
        set({ favorites: [], loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error loading echo favorites:', error);
    }
  },

  addFavorite: async (favorite) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      const favoritesRef = collection(db, `users/${user.uid}/echoFavorites`);
      const newFavoriteRef = doc(favoritesRef);
      
      const currentFavorites = get().favorites;
      const maxOrder = Math.max(...currentFavorites.map(f => f.order), 0);
      
      await setDoc(newFavoriteRef, {
        ...favorite,
        order: maxOrder + 1,
        createdAt: new Date()
      });

      await get().loadFavorites();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error adding echo favorite:', error);
    }
  },

  updateFavorite: async (id: string, favorite: Partial<EchoFavorite>) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const favoriteRef = doc(db, `users/${user.uid}/echoFavorites/${id}`);
      
      await updateDoc(favoriteRef, {
        ...favorite,
        updatedAt: new Date()
      });

      await get().loadFavorites();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error updating echo favorite:', error);
    }
  },

  deleteFavorite: async (id: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const favoriteRef = doc(db, `users/${user.uid}/echoFavorites/${id}`);
      await deleteDoc(favoriteRef);
      await get().loadFavorites();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error deleting echo favorite:', error);
    }
  },

  reorderFavorites: async (favorites: EchoFavorite[]) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      const batch = db.batch();
      favorites.forEach((favorite, index) => {
        const favoriteRef = doc(db, `users/${user.uid}/echoFavorites/${favorite.id}`);
        batch.update(favoriteRef, { order: index });
      });
      
      await batch.commit();
      set({ favorites, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error reordering echo favorites:', error);
    }
  },
}));