import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ObservationPage from './pages/ObservationPage';
import EchoPage from './pages/EchoPage';
import PrescriptionPage from './pages/PrescriptionPage';
import ProfilePage from './pages/ProfilePage';
import TutorialPage from './pages/TutorialPage';
import UsefulLinksPage from './pages/UsefulLinksPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      <ToastContainer />
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-24">
        <Routes>
          {/* Page d'observations accessible à tous */}
          <Route path="/" element={<ObservationPage />} />

          {/* Pages nécessitant un email H24 */}
          <Route path="/echo" element={
            <ProtectedRoute requireH24Email>
              <EchoPage />
            </ProtectedRoute>
          } />
          <Route path="/prescription" element={
            <ProtectedRoute requireH24Email>
              <PrescriptionPage />
            </ProtectedRoute>
          } />

          {/* Pages nécessitant une connexion mais pas d'email H24 */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Pages accessibles à tous */}
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/useful-links" element={<UsefulLinksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;