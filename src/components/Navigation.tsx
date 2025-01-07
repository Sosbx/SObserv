import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ClipboardList,
  Waves,
  FileText,
  UserCircle2,
  HelpCircle,
  Download,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ProfileIcon } from './ProfileIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const getSubtitle = () => {
    const path = window.location.pathname;
    switch (path) {
      case '/echo':
        return 'Compte rendu d\'échographie';
      case '/prescription':
        return 'Ordonnances';
      case '/profile':
        return 'Profil Médecin';
      case '/tutorial':
        return 'Tutoriels';
      case '/useful-links':
        return 'Liens utiles';
      default:
        return 'Observations médicales';
    }
  };

  const mainNavItems = [
    {
      to: '/',
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Observations médicales'
    },
    {
      to: '/echo',
      icon: <Waves className="h-5 w-5" />,
      label: 'Échographie',
      requiresH24: true
    },
    {
      to: '/prescription',
      icon: <FileText className="h-5 w-5" />,
      label: 'Ordonnances',
      requiresH24: true
    },
    {
      to: '/profile',
      icon: <UserCircle2 className="h-5 w-5" />,
      label: 'Profil'
    },
    {
      to: '/useful-links',
      icon: <LinkIcon className="h-5 w-5" />,
      label: 'Liens utiles'
    }
  ];

  return (
    <header className="bg-white shadow-lg fixed w-full top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primary-700 hover:text-primary-800 focus:outline-none transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex items-center justify-center flex-col">
            <h1 className="text-3xl font-black drop-shadow-sm">
              <div className="flex items-center gap-3">
                <img 
                  src="/icone.png" 
                  alt="SObserv Logo" 
                  className="h-10 w-10 object-contain drop-shadow"
                />
                <div className="flex items-baseline tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 text-transparent bg-clip-text">
                  <span>S</span>
                  <span>O</span>
                  <span className="font-light">b</span>
                  <span>s</span>
                  <span className="font-light">erv</span>
                </div>
              </div>
            </h1>
            <h2 className="text-sm text-primary-700 mt-0.5 font-medium">{getSubtitle()}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <ProfileIcon />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 transform transition-transform duration-200">
            <div className="h-full flex flex-col">
              <div className="pt-24 px-6 pb-6 flex-1">
                <nav className="space-y-1">
                  {mainNavItems.map((item) => {
                    if (item.requiresH24 && !user?.email?.endsWith('@h24scm.com')) {
                      return (
                        <div 
                          key={item.to}
                          className="flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg cursor-not-allowed"
                          title="Réservé aux utilisateurs @h24scm.com"
                        >
                          {item.icon}
                          {item.label}
                        </div>
                      );
                    }
                    
                    return (
                      <Link 
                        key={item.to}
                        to={item.to} 
                        className="flex items-center gap-3 px-4 py-3 text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="my-4 border-t border-gray-200" />

                  <Link 
                    to="/tutorial" 
                    className="flex items-center gap-3 px-4 py-3 text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5" />
                    Tutoriels
                  </Link>

                  {deferredPrompt && (
                    <button
                      onClick={() => {
                        handleInstall();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200 w-full"
                    >
                      <Download className="h-5 w-5" />
                      Ajouter à l'écran d'accueil
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      Déconnexion
                    </button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;