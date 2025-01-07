import React from 'react';
import { UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

export function ProfileIcon() {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const isH24Email = user?.email?.endsWith('@h24scm.com');
  const isProfileComplete = profile.firstName && 
                          profile.lastName && 
                          (!isH24Email || (profile.rpps && profile.adeli));

  const getInitials = () => {
    if (!user) return '';
    const nameParts = user.email?.split('@')[0].split('.');
    if (nameParts && nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.email?.[0].toUpperCase() || '';
  };

  if (user) {
    return (
      <Link 
        to="/profile" 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {isH24Email && !isProfileComplete && (
          <span className="text-sm font-medium text-amber-600">
            (profil incomplet)
          </span>
        )}
        {!isH24Email && (
          <span className="text-sm font-medium text-amber-600">
            (accès restreint)
          </span>
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isH24Email && isProfileComplete
            ? 'bg-primary-50 text-primary-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {getInitials()}
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to="/profile" 
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <span className="text-sm font-medium text-primary-600/80">
        (mode invité)
      </span>
      <UserCircle className="w-8 h-8 text-primary-600/80 stroke-[1.5]" />
    </Link>
  );
}