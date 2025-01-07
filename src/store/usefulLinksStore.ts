import { create } from 'zustand';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  updateDoc, 
  writeBatch, 
  getDoc,
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

export interface UsefulLink {
  id: string;
  title: string;
  description: string;
  url: string;
  isSystem?: boolean;
  order: number;
  category?: string;
}

const DEFAULT_LINKS: UsefulLink[] = [
  {
    id: 'sos-pratique',
    title: 'SOS pratique',
    description: 'Filières courtes',
    url: 'https://sites.google.com/h24scm.com/sos-pratique/filières-courtes?authuser=0',
    isSystem: true,
    order: 1
  },
  {
    id: 'fmc',
    title: 'FMC',
    description: 'Accès au drive FMC de SOS',
    url: 'https://drive.google.com/drive/folders/1nCRlJD_T_rqvY_MJdzBD1xzUrKR0Bohf?usp=drive_link',
    isSystem: true,
    order: 2
  },
  {
    id: 'omniprat',
    title: 'OMNIprat',
    description: 'Aide à la cotation',
    url: 'https://omniprat.org/cotation/',
    isSystem: true,
    order: 3
  },
  {
    id: 'certdc',
    title: 'CertDC',
    description: 'CertDC',
    url: 'https://certdc.inserm.fr/certdc-public/#/mairies-etablissements-raccordes',
    isSystem: true,
    order: 4
  },
  {
    id: 'antibioclic',
    title: 'Antibioclic',
    description: 'Antibiothérapie rationnelle en soins primaires',
    url: 'https://antibioclic.com',
    isSystem: true,
    order: 5
  },
  {
    id: 'lecrat',
    title: 'Le CRAT',
    description: 'Centre de Référence sur les Agents Tératogènes',
    url: 'https://www.lecrat.fr',
    isSystem: true,
    order: 6
  },
  {
    id: 'pharmacie-garde',
    title: 'Pharmacie de garde',
    description: 'Trouvez la pharmacie de garde la plus proche',
    url: 'https://www.resogardes.com/index.php',
    isSystem: true,
    order: 7
  }
];

interface UsefulLinksState {
  links: UsefulLink[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  loadLinks: () => Promise<void>;
  addLink: (link: Omit<UsefulLink, 'id' | 'order'>) => Promise<void>;
  updateLink: (id: string, link: Partial<UsefulLink>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (links: UsefulLink[]) => Promise<void>;
  cleanup: () => void;
}

export const useUsefulLinksStore = create<UsefulLinksState>((set, get) => ({
  links: [],
  loading: false,
  error: null,
  unsubscribe: null,

  loadLinks: async () => {
    const { user } = useAuthStore.getState();
    const currentUnsubscribe = get().unsubscribe;

    // Cleanup existing subscription if any
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    try {
      set({ loading: true, error: null });

      // Start with default links
      let allLinks = [...DEFAULT_LINKS];

      if (user) {
        // Subscribe to user's custom links
        const userLinksRef = collection(db, `users/${user.uid}/usefulLinks`);
        const userLinksQuery = query(userLinksRef);
        
        // Subscribe to preferences document for link orders
        const preferencesRef = doc(db, `users/${user.uid}/preferences/linkOrder`);

        // Create a combined subscription
        const unsubscribe = onSnapshot(
          userLinksQuery,
          async (snapshot) => {
            try {
              // Get custom links
              const userLinks = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
              })) as UsefulLink[];

              // Get link orders
              const preferencesDoc = await getDoc(preferencesRef);
              const linkOrders = preferencesDoc.exists() 
                ? preferencesDoc.data() as Record<string, number>
                : {};

              // Apply custom orders to default links if they exist
              allLinks = DEFAULT_LINKS.map(link => ({
                ...link,
                order: linkOrders[link.id] !== undefined ? linkOrders[link.id] : link.order
              }));

              // Add user's custom links
              allLinks = [...allLinks, ...userLinks].sort((a, b) => a.order - b.order);

              set({ links: allLinks, loading: false });
            } catch (error) {
              console.error('Error processing real-time update:', error);
            }
          },
          (error) => {
            console.error('Error in real-time subscription:', error);
            set({ error: (error as Error).message, loading: false });
          }
        );

        set({ unsubscribe });
      } else {
        // Not logged in - just show default links in their original order
        set({ 
          links: allLinks,
          loading: false 
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error loading links:', error);
    }
  },

  addLink: async (link) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      const userLinksRef = collection(db, `users/${user.uid}/usefulLinks`);
      const newLinkRef = doc(userLinksRef);
      
      const currentLinks = get().links;
      const maxOrder = Math.max(...currentLinks.map(l => l.order), 0);
      
      const newLink = {
        ...link,
        id: newLinkRef.id,
        order: maxOrder + 1,
        createdAt: new Date()
      };

      await setDoc(newLinkRef, newLink);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error adding link:', error);
    }
  },

  updateLink: async (id: string, link: Partial<UsefulLink>) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const linkRef = doc(db, `users/${user.uid}/usefulLinks/${id}`);
      
      await updateDoc(linkRef, {
        ...link,
        updatedAt: new Date()
      });

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error updating link:', error);
    }
  },

  deleteLink: async (id: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const linkRef = doc(db, `users/${user.uid}/usefulLinks/${id}`);
      await deleteDoc(linkRef);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error deleting link:', error);
    }
  },

  reorderLinks: async (links: UsefulLink[]) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      
      const batch = writeBatch(db);
      
      // Prepare orders for all links
      const systemLinkOrders: Record<string, number> = {};
      
      links.forEach((link, index) => {
        if (link.isSystem) {
          // Store system link orders
          systemLinkOrders[link.id] = index;
        } else {
          // Update custom link orders
          const linkRef = doc(db, `users/${user.uid}/usefulLinks/${link.id}`);
          batch.update(linkRef, { order: index });
        }
      });

      // Save system link orders in preferences
      const preferencesRef = doc(db, `users/${user.uid}/preferences/linkOrder`);
      batch.set(preferencesRef, systemLinkOrders);
      
      await batch.commit();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.error('Error reordering links:', error);
      throw error;
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ unsubscribe: null });
  }
}));