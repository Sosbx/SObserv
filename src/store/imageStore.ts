import { create } from 'zustand';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

interface ImageStore {
  images: UploadedImage[];
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (imageId: string) => void;
  clearImages: () => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  uploading: false,
  error: null,

  uploadImage: async (file: File) => {
    try {
      set({ uploading: true, error: null });
      
      // Créer une URL temporaire pour l'image
      const url = URL.createObjectURL(file);
      const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const newImage: UploadedImage = {
        id: imageId,
        name: file.name,
        url
      };

      set(state => ({
        images: [...state.images, newImage],
        uploading: false
      }));
    } catch (error) {
      set({ 
        error: (error as Error).message,
        uploading: false
      });
      console.error('Error creating image URL:', error);
    }
  },

  deleteImage: (imageId: string) => {
    set(state => {
      // Libérer l'URL de l'image
      const image = state.images.find(img => img.id === imageId);
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      
      return {
        images: state.images.filter(img => img.id !== imageId)
      };
    });
  },

  clearImages: () => {
    set(state => {
      // Libérer toutes les URLs
      state.images.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
      
      return { images: [] };
    });
  }
}));