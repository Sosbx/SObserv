import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from '../components/SignatureCanvas';
import { Save, Trash2, UserCircle, MapPin, Building, Award, FileText, KeyRound, AlertTriangle, LogOut } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

function ProfilePage() {
  const { user, signOut, deleteAccount } = useAuthStore();
  const { profile, updateProfile } = useUserStore();
  const isH24Email = user?.email?.endsWith('@h24scm.com');
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    rpps: profile.rpps || '',
    adeli: profile.adeli || '',
    specialty: profile.specialty || 'Médecin généraliste',
    email: user?.email || '',
    address: profile.address || '',
    city: profile.city || '',
    organization: profile.organization || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureLoaded, setSignatureLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(!profile.firstName && !profile.lastName);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const updateCanvasSize = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setCanvasSize({ 
        width: Math.min(width, 600),
        height: Math.min(width * 0.5, 300)
      });
    }
  };

  useEffect(() => {
    if (profile.signature && signatureRef.current && !signatureLoaded && canvasSize.width > 0) {
      const img = new Image();
      img.onload = () => {
        const canvas = signatureRef.current;
        if (canvas) {
          canvas.clear();
          const ctx = canvas.getCanvas().getContext('2d');
          if (ctx) {
            const ratio = Math.min(
              (canvasSize.width * 0.8) / img.width,
              (canvasSize.height * 0.8) / img.height
            );
            const newWidth = img.width * ratio;
            const newHeight = img.height * ratio;
            const x = (canvasSize.width - newWidth) / 2;
            const y = (canvasSize.height - newHeight) / 2;
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
            ctx.drawImage(img, x, y, newWidth, newHeight);
            setSignatureLoaded(true);
          }
        }
      };
      img.src = profile.signature;
    }
  }, [profile.signature, signatureLoaded, canvasSize]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordError((error as Error).message);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    try {
      await deleteAccount(deletePassword);
    } catch (error) {
      setDeleteError((error as Error).message);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (isH24Email) {
      if (!/^\d+$/.test(formData.rpps)) {
        newErrors.rpps = 'Le RPPS doit contenir uniquement des chiffres';
      }
      if (!/^\d+$/.test(formData.adeli)) {
        newErrors.adeli = 'Le numéro ADELI doit contenir uniquement des chiffres';
      }
    }
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'La spécialité est requise';
    }
    if (!signatureRef.current?.toData().length && !profile.signature) {
      newErrors.signature = 'La signature est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Veuillez vous connecter pour enregistrer votre profil');
      return;
    }

    if (validateForm()) {
      const canvas = signatureRef.current?.getCanvas();
      let signatureDataUrl = profile.signature;
      
      if (canvas && signatureRef.current?.toData().length) {
        signatureDataUrl = canvas.toDataURL();
      }

      try {
        await updateProfile({
          ...formData,
          signature: signatureDataUrl,
        });
        setIsFirstLogin(false);
        alert('Profil enregistré avec succès');
      } catch (error) {
        alert('Erreur lors de l\'enregistrement du profil');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const clearSignature = async () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureLoaded(false);
      if (errors.signature) {
        setErrors(prev => ({ ...prev, signature: '' }));
      }
      
      try {
        await updateProfile({
          ...formData,
          signature: null,
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la signature:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
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
                  Connectez-vous pour accéder à votre profil médecin
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => {/* Handle email login */}}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Email</span>
            </button>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-12 h-px bg-gray-300"></div>
              <span>ou</span>
              <div className="w-12 h-px bg-gray-300"></div>
            </div>

            <button
              onClick={() => {/* Handle Google login */}}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary-900">Profil Médecin</h1>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      {isH24Email ? (
        <div className="bg-primary-50 border-l-4 border-primary-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-primary-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-700">
                Accès complet aux fonctionnalités
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Accès restreint : Les ordonnances et l'échographie sont réservées aux utilisateurs @h24scm.com
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary-800">
              <UserCircle className="h-6 w-6" />
              <h3>Informations personnelles</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Modifier le mot de passe
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary-800 mb-4">
            <Award className="h-6 w-6" />
            <h3>Informations professionnelles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                RPPS {!isH24Email && <span className="text-gray-500">(réservé aux utilisateurs @h24scm.com)</span>}
              </label>
              <input
                type="text"
                name="rpps"
                value={formData.rpps}
                onChange={handleInputChange}
                disabled={!isH24Email}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.rpps ? 'border-red-300' : 'border-gray-300'
                } ${!isH24Email ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
              {errors.rpps && (
                <p className="mt-1 text-sm text-red-600">{errors.rpps}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ADELI {!isH24Email && <span className="text-gray-500">(réservé aux utilisateurs @h24scm.com)</span>}
              </label>
              <input
                type="text"
                name="adeli"
                value={formData.adeli}
                onChange={handleInputChange}
                disabled={!isH24Email}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.adeli ? 'border-red-300' : 'border-gray-300'
                } ${!isH24Email ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
              {errors.adeli && (
                <p className="mt-1 text-sm text-red-600">{errors.adeli}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Spécialité
            </label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                errors.specialty ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.specialty && (
              <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Organisation/Cabinet
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary-800 mb-4">
            <MapPin className="h-6 w-6" />
            <h3>Adresse professionnelle</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ville
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary-800 mb-4">
            <FileText className="h-6 w-6" />
            <h3>Signature</h3>
          </div>

          <div>
            <div ref={containerRef} className="border border-gray-300 rounded-lg p-4 bg-white" style={{ height: '300px' }}>
              {canvasSize.width > 0 && (
                <SignatureCanvas
                  ref={signatureRef}
                  width={canvasSize.width - 32}
                  height={240}
                  className="w-full h-full"
                />
              )}
            </div>
            {errors.signature && (
              <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
            )}
            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer la signature
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer mon compte
          </button>
        </div>
      </form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Changer le mot de passe</h2>
            {passwordSuccess ? (
              <div className="text-green-600 mb-4">
                Mot de passe modifié avec succès !
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Changer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Supprimer le compte</h2>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Attention ! Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmez votre mot de passe
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer définitivement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;