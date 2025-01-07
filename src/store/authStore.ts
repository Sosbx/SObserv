import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUserStore } from './userStore';
import { useToastStore } from './toastStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isRegistering: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  linkProfileToUser: (profileData: any) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  loadUserProfile: (uid: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialLoading: true,
      error: null,
      rememberMe: false,
      
      setRememberMe: (value: boolean) => set({ rememberMe: value }),

      loadUserProfile: async (uid: string) => {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            useUserStore.getState().updateProfile({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              rpps: data.rpps || '',
              adeli: data.adeli || '',
              signature: data.signature || null,
              specialty: data.specialty || '',
              address: data.address || '',
              city: data.city || '',
              organization: data.organization || ''
            });

            const isH24Email = get().user?.email?.endsWith('@h24scm.com');
            const isProfileComplete = data.firstName && 
                                   data.lastName && 
                                   (!isH24Email || (data.rpps && data.adeli));
            
            return isProfileComplete;
          } else {
            await setDoc(doc(db, 'profiles', uid), {
              email: get().user?.email,
              createdAt: new Date(),
            });
            return false;
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          return false;
        }
      },

      signInWithEmail: async (email, password, isRegistering) => {
        try {
          set({ loading: true, error: null });
          
          const persistenceType = get().rememberMe ? browserLocalPersistence : browserSessionPersistence;
          await setPersistence(auth, persistenceType);
          
          let userCredential;
          
          if (isRegistering) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await setDoc(doc(db, 'profiles', userCredential.user.uid), {
              email: userCredential.user.email,
              createdAt: new Date(),
            });
            useToastStore.getState().addToast(
              'Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.',
              'info'
            );
            set({ loading: false });
            return;
          } else {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
              useToastStore.getState().addToast(
                'Veuillez vérifier votre email avant de vous connecter.',
                'error'
              );
              await firebaseSignOut(auth);
              set({ loading: false });
              return;
            }
          }
          
          const isProfileComplete = await get().loadUserProfile(userCredential.user.uid);
          
          set({ user: userCredential.user, loading: false });
          useToastStore.getState().addToast(
            isRegistering ? 'Compte créé avec succès' : 'Connexion réussie',
            'success'
          );

          // Redirect to profile page only if profile is incomplete
          if (!isRegistering && !isProfileComplete) {
            window.location.href = '/profile';
          } else {
            window.location.href = '/';
          }
        } catch (error: any) {
          let errorMessage = 'Une erreur est survenue';
          if (error.code === 'auth/invalid-email') {
            errorMessage = 'Adresse email invalide';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Aucun compte associé à cette adresse email';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect';
          } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Cette adresse email est déjà utilisée';
          }
          set({ error: errorMessage, loading: false });
          useToastStore.getState().addToast(errorMessage, 'error');
          throw new Error(errorMessage);
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          const persistenceType = get().rememberMe ? browserLocalPersistence : browserSessionPersistence;
          await setPersistence(auth, persistenceType);
          
          googleProvider.setCustomParameters({
            prompt: 'select_account'
          });
          
          try {
            // First try popup
            const result = await signInWithPopup(auth, googleProvider);
            await handleAuthResult(result);
          } catch (error: any) {
            if (error.code === 'auth/popup-blocked') {
              // If popup is blocked, fallback to redirect
              await signInWithRedirect(auth, googleProvider);
              const result = await getRedirectResult(auth);
              if (result) {
                await handleAuthResult(result);
              }
            } else {
              throw error;
            }
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
          useToastStore.getState().addToast(error.message, 'error');
          throw error;
        }
      },

      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null, loading: false });
          useUserStore.getState().clearProfile();
          useToastStore.getState().addToast('Déconnexion réussie', 'success');
        } catch (error: any) {
          set({ error: error.message, loading: false });
          useToastStore.getState().addToast(error.message, 'error');
        }
      },

      deleteAccount: async (password: string) => {
        try {
          const { user } = useAuthStore.getState();
          if (!user || !user.email) throw new Error('Aucun utilisateur connecté');

          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);

          const userRef = doc(db, 'profiles', user.uid);
          const profileDoc = await getDoc(userRef);

          if (profileDoc.exists()) {
            await deleteDoc(userRef);

            const favoritesRef = collection(db, `users/${user.uid}/favorites`);
            const favoritesSnapshot = await getDocs(favoritesRef);
            await Promise.all(favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref)));

            const overridesRef = collection(db, `users/${user.uid}/overrides`);
            const overridesSnapshot = await getDocs(overridesRef);
            await Promise.all(overridesSnapshot.docs.map(doc => deleteDoc(doc.ref)));
          }
          
          await deleteUser(user);
          
          set({ user: null, loading: false, error: null });
          useUserStore.getState().clearProfile();
          useToastStore.getState().addToast('Compte supprimé avec succès', 'success');
        } catch (error: any) {
          console.error('Erreur lors de la suppression du compte:', error);
          let errorMessage = 'Une erreur est survenue lors de la suppression du compte.';
          
          if (error.code === 'auth/user-token-expired') {
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter et réessayer.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect.';
          }
          
          set({ error: errorMessage, loading: false });
          useToastStore.getState().addToast(errorMessage, 'error');
          throw new Error(errorMessage);
        }
      },

      linkProfileToUser: async (profileData) => {
        try {
          const { user } = useAuthStore.getState();
          if (!user) throw new Error('Aucun utilisateur connecté');

          await setDoc(doc(db, 'profiles', user.uid), {
            ...profileData,
            email: user.email,
            updatedAt: new Date(),
          });

          await get().loadUserProfile(user.uid);
          useToastStore.getState().addToast('Profil mis à jour avec succès', 'success');
        } catch (error: any) {
          set({ error: error.message });
          useToastStore.getState().addToast(error.message, 'error');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        rememberMe: state.rememberMe 
      }),
    }
  )
);

const handleAuthResult = async (result: any) => {
  if (!result.user.emailVerified) {
    await sendEmailVerification(result.user);
    useToastStore.getState().addToast(
      'Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.',
      'info'
    );
    await firebaseSignOut(auth);
    return;
  }

  const profileDoc = await getDoc(doc(db, 'profiles', result.user.uid));
  const profileData = {
    email: result.user.email,
    firstName: result.user.displayName?.split(' ')[0] || '',
    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
    updatedAt: new Date(),
  };

  if (!profileDoc.exists()) {
    await setDoc(doc(db, 'profiles', result.user.uid), {
      ...profileData,
      createdAt: new Date(),
    });
  }

  const isProfileComplete = await useAuthStore.getState().loadUserProfile(result.user.uid);
  
  useAuthStore.setState({ user: result.user, loading: false });
  useToastStore.getState().addToast('Connexion réussie', 'success');

  // Redirect to profile page only if profile is incomplete
  if (!isProfileComplete) {
    window.location.href = '/profile';
  } else {
    window.location.href = '/';
  }
};

// Écouter les changements d'authentification
onAuthStateChanged(auth, async (user) => {
  const store = useAuthStore.getState();
  store.initialLoading = false;
  
  if (user) {
    useAuthStore.setState({ user, loading: false });
    const isProfileComplete = await store.loadUserProfile(user.uid);
    if (!isProfileComplete && window.location.pathname !== '/profile') {
      window.location.href = '/profile';
    }
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});