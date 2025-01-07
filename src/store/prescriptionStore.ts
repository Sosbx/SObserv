import { create } from 'zustand';
import { doc, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

interface PrescriptionTemplate {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface PrescriptionStore {
  templates: PrescriptionTemplate[];
  loading: boolean;
  error: string | null;
  loadTemplates: () => Promise<void>;
  addTemplate: (template: Omit<PrescriptionTemplate, 'id' | 'createdAt'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const usePrescriptionStore = create<PrescriptionStore>((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  loadTemplates: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const templatesRef = collection(db, `users/${user.uid}/prescriptionTemplates`);
      const snapshot = await getDocs(templatesRef);
      
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as PrescriptionTemplate[];

      set({ templates: templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addTemplate: async (template) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const templatesRef = collection(db, `users/${user.uid}/prescriptionTemplates`);
      const newTemplateRef = doc(templatesRef);
      
      await setDoc(newTemplateRef, {
        ...template,
        createdAt: new Date()
      });

      await get().loadTemplates();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteTemplate: async (id: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true, error: null });
      const templateRef = doc(db, `users/${user.uid}/prescriptionTemplates/${id}`);
      await deleteDoc(templateRef);
      await get().loadTemplates();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));