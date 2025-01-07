import React from 'react';
import { AdvancedVideo } from '@cloudinary/react';
import { cloudinary } from '../utils/cloudinary';
import { 
  Book, 
  FileText, 
  Star, 
  Stethoscope, 
  Waves,
  UserCircle2,
  LogIn
} from 'lucide-react';

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  publicId: string;
}

interface TutorialSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  videos: TutorialVideo[];
}

const tutorials: TutorialSection[] = [
  {
    id: 'observations',
    title: 'Observations médicales',
    icon: <Stethoscope className="h-6 w-6" />,
    description: 'Apprenez à créer et gérer vos observations médicales',
    videos: [
      {
        id: 'create-observation',
        title: 'Créer une observation',
        description: 'Apprenez à créer une observation médicale complète',
        publicId: 'create-observation_ry5zh2'
      }
    ]
  },
  {
    id: 'favorites',
    title: 'Gestion des favoris',
    icon: <Star className="h-6 w-6" />,
    description: 'Découvrez comment utiliser et personnaliser vos favoris',
    videos: [
      {
        id: 'copy-favorites',
        title: 'Copier un favori',
        description: 'Apprenez à utiliser vos favoris dans vos observations',
        publicId: 'copy-favorites_xtf0xc'
      },
      {
        id: 'create-favorites',
        title: 'Créer un favori',
        description: 'Découvrez comment créer et personnaliser vos favoris',
        publicId: 'create-favorites_nlpdnj'
      },
      {
        id: 'filter-favorites',
        title: 'Filtrer les favoris',
        description: 'Apprenez à filtrer et organiser vos favoris par catégorie',
        publicId: 'filter-favorites_fyezr1'
      },
      {
        id: 'edit-favorites',
        title: 'Modifier les favoris',
        description: 'Découvrez comment modifier et supprimer vos favoris',
        publicId: 'edit-favorites_vfdgjq'
      }
    ]
  },
  {
    id: 'prescriptions',
    title: 'Ordonnances',
    icon: <FileText className="h-6 w-6" />,
    description: 'Apprenez à créer et gérer vos ordonnances',
    videos: [
      {
        id: 'create-prescription',
        title: 'Créer une ordonnance',
        description: 'Apprenez à créer et gérer vos ordonnances',
        publicId: 'create-prescription_fclauv'
      }
    ]
  },
  {
    id: 'profile',
    title: 'Profil médecin',
    icon: <UserCircle2 className="h-6 w-6" />,
    description: 'Gérez votre profil et vos informations professionnelles',
    videos: [
      {
        id: 'edit-profile',
        title: 'Gérer son profil',
        description: 'Apprenez à configurer votre profil médecin',
        publicId: 'edit-profile_sbvdee'
      }
    ]
  },
  {
    id: 'account',
    title: 'Compte utilisateur',
    icon: <LogIn className="h-6 w-6" />,
    description: 'Gérez votre compte et vos accès',
    videos: [
      {
        id: 'login-signup',
        title: 'Connexion et inscription',
        description: 'Découvrez comment créer un compte et vous connecter',
        publicId: 'login-signup_bgbs3r'
      }
    ]
  },
  {
    id: 'echography',
    title: 'Échographie',
    icon: <Waves className="h-6 w-6" />,
    description: 'Découvrez comment réaliser des comptes rendus d\'échographie',
    videos: []
  }
];

const TutorialPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Book className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Tutoriels</h1>
      </div>

      <div className="space-y-12">
        {tutorials.map((section) => (
          <div key={section.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                <p className="text-gray-600 mt-1">{section.description}</p>
              </div>
            </div>

            {section.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.videos.map((video) => (
                  <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                      <AdvancedVideo
                        cldVid={cloudinary.video(video.publicId)}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      Les tutoriels vidéo pour cette section seront bientôt disponibles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorialPage;