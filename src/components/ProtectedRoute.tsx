import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginButton } from './LoginButton';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireH24Email?: boolean;
}

export function ProtectedRoute({ children, requireH24Email = false }: ProtectedRouteProps) {
  const { user, loading, initialLoading } = useAuthStore();
  const location = useLocation();
  const isH24Email = user?.email?.endsWith('@h24scm.com');

  if (initialLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Vérification de l'email
  if (user && !user.emailVerified) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-600">Email non vérifié</h2>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Veuillez vérifier votre adresse email avant d'accéder à cette page. 
                  Un email de vérification vous a été envoyé à l'adresse {user.email}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (requireH24Email && !isH24Email) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Accès non autorisé</h2>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Cette fonctionnalité est réservée aux utilisateurs avec une adresse email @h24scm.com. 
                  Vous pouvez toujours utiliser la gestion des favoris avec votre compte actuel.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/') {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Connexion requise</h2>
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Connectez-vous pour gérer vos favoris. Tous les utilisateurs peuvent créer un compte pour cette fonctionnalité.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-center">
            Veuillez vous connecter pour accéder à cette page
          </p>
          
          <LoginButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}