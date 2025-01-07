import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useAuthStore } from '../store/authStore';

interface EmailLoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string, isRegistering: boolean) => Promise<void>;
  disableRegistration?: boolean;
}

export function EmailLoginModal({ onClose, onLogin, disableRegistration }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { resetPassword, setRememberMe, rememberMe } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onLogin(email, password, isRegistering);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error: any) {
      throw error;
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal
        onClose={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPassword}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {isRegistering ? 'Créer un compte' : 'Connexion'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-center">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-center"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-center">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-center"
            required
            minLength={6}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Rester connecté
          </label>
        </div>

        {!isRegistering && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 pt-2">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
          >
            {isRegistering ? 'S\'inscrire' : 'Se connecter'}
          </button>

          {!disableRegistration && (
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isRegistering ? 'Déjà un compte ?' : 'Créer un compte'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}