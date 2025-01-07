import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings, Star } from 'lucide-react';
import { useEchoFavoritesStore } from '../../store/echoFavoritesStore';
import { useAuthStore } from '../../store/authStore';
import { LoginButton } from '../LoginButton';

const CATEGORIES = {
  'all': 'Tous',
  'renal': 'Rénal',
  'pleuropulmonaire': 'Pleuro-pulmonaire',
  'tvp': 'TVP',
  'fast': 'FAST',
  'perso': 'Personnalisé'
};

interface EchoFavoritesProps {
  onReportChange: (report: string) => void;
}

const EchoFavorites: React.FC<EchoFavoritesProps> = ({ onReportChange }) => {
  const { user } = useAuthStore();
  const { favorites, loadFavorites, addFavorite, updateFavorite, deleteFavorite } = useEchoFavoritesStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newFavorite, setNewFavorite] = useState({
    title: '',
    content: '',
    category: 'renal'
  });

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const filteredFavorites = favorites.filter(favorite => 
    selectedCategory === 'all' || favorite.category === selectedCategory
  );

  const handleSave = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (editingFavorite) {
      await updateFavorite(editingFavorite.id, newFavorite);
    } else {
      await addFavorite(newFavorite);
    }
    setShowAddModal(false);
    setNewFavorite({ title: '', content: '', category: 'renal' });
    setEditingFavorite(null);
  };

  const handleEdit = (favorite: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setEditingFavorite(favorite);
    setNewFavorite({
      title: favorite.title,
      content: favorite.content,
      category: favorite.category
    });
    setShowAddModal(true);
  };

  const handleDelete = async (favorite: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      await deleteFavorite(favorite.id);
      if (copiedId === favorite.id) {
        setCopiedId(null);
      }
    }
  };

  const handleFavoriteClick = async (favorite: any) => {
    if (!isEditMode) {
      onReportChange(favorite.content);
      setCopiedId(favorite.id);
      setTimeout(() => {
        if (copiedId === favorite.id) {
          setCopiedId(null);
        }
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {Object.entries(CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => user && setIsEditMode(!isEditMode)}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              !user 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isEditMode 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={!user ? 'Connectez-vous pour modifier les favoris' : ''}
          >
            <Settings className="h-4 w-4" />
            {isEditMode ? 'Terminer' : 'Modifier'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau favori
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFavorites.map((favorite) => (
          <div
            key={favorite.id}
            className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all"
          >
            <button
              onClick={() => handleFavoriteClick(favorite)}
              className={`w-full p-4 text-left transition-colors ${
                copiedId === favorite.id
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                  : 'bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold line-clamp-1">
                  {favorite.title}
                </span>
                {copiedId === favorite.id && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copié
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {CATEGORIES[favorite.category as keyof typeof CATEGORIES]}
              </span>
            </button>

            {isEditMode && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEdit(favorite)}
                  className="p-1.5 text-primary-600 hover:text-primary-700 rounded-full hover:bg-white/80 bg-white/50"
                  title="Modifier"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(favorite)}
                  className="p-1.5 text-red-600 hover:text-red-700 rounded-full hover:bg-white/80 bg-white/50"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary-900">
                {editingFavorite ? 'Modifier le favori' : 'Nouveau favori'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFavorite(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  value={newFavorite.title}
                  onChange={(e) => setNewFavorite(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  value={newFavorite.category}
                  onChange={(e) => setNewFavorite(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {Object.entries(CATEGORIES).filter(([key]) => key !== 'all').map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contenu
                </label>
                <textarea
                  value={newFavorite.content}
                  onChange={(e) => setNewFavorite(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingFavorite(null);
                  }}
                  className="px-4 py-2 text-primary-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  {editingFavorite ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-primary-900 mb-2">
                Connexion requise
              </h2>
              <p className="text-gray-600">
                Connectez-vous pour gérer vos favoris
              </p>
            </div>

            <div className="space-y-6">
              <LoginButton onSuccess={() => setShowLoginModal(false)} />
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EchoFavorites;