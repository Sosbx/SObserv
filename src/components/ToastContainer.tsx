import React from 'react';
import { Toast } from './Toast';
import { useToastStore } from '../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toast, removeToast } = useToastStore();

  if (!toast) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-50 flex justify-center">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={removeToast}
      />
    </div>
  );
};