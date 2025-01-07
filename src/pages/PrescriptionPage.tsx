import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';

interface PatientInfo {
  lastName: string;
  firstName: string;
  birthDate?: string;
}

function PrescriptionPage() {
  const [prescription, setPrescription] = useState('');
  const [aldPrescription, setAldPrescription] = useState('');
  const [isAld, setIsAld] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserStore();
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    lastName: '',
    firstName: '',
  });

  const handleReset = () => {
    setPrescription('');
    setAldPrescription('');
    setError(null);
  };

  const validatePatientInfo = () => {
    if (!patientInfo.lastName || !patientInfo.firstName) {
      throw new Error('Le nom et le prénom du patient sont requis');
    }
    
    if (isAld && !aldPrescription.trim() && !prescription.trim()) {
      throw new Error('Au moins une prescription doit être remplie');
    } else if (!isAld && !prescription.trim()) {
      throw new Error('L\'ordonnance ne peut pas être vide');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setError(null);
      validatePatientInfo();
      
      const doc = await generatePrescriptionPDF(
        prescription,
        patientInfo,
        profile,
        isAld,
        aldPrescription
      );

      doc.save(`ordonnance_${patientInfo.lastName}_${patientInfo.firstName}.pdf`);
      setShowPatientModal(false);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="flex flex-col items-start">
          <div className="w-full flex justify-between items-start mb-6">
            <div className="w-48">
              <img 
                src="/header.jpg"
                alt="En-tête"
                className="h-12 w-auto object-contain mb-2"
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <div className="w-full text-left space-y-1">
            <div className="text-xl font-semibold text-gray-900">
              Dr {profile.firstName} {profile.lastName}
            </div>
            <div className="text-sm text-gray-600">
              <div>RPPS : {profile.rpps}</div>
              <div>ADELI : {profile.adeli}</div>
              <div>{profile.specialty || 'Médecin généraliste'}</div>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="ald"
            checked={isAld}
            onChange={(e) => setIsAld(e.target.checked)}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="ald" className="text-sm font-medium text-gray-700">
            Ordonnance ALD
          </label>
        </div>

        {isAld ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescriptions ALD
              </label>
              <textarea
                value={aldPrescription}
                onChange={(e) => setAldPrescription(e.target.value)}
                className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Saisissez les prescriptions relatives à l'ALD ici..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescriptions hors ALD
              </label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="w-full min-h-[200px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Saisissez les prescriptions hors ALD ici..."
              />
            </div>
          </div>
        ) : (
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            className="w-full min-h-[400px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Saisissez votre ordonnance ici..."
          />
        )}

        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Trash2 className="h-4 w-4" />
            Réinitialiser
          </button>

          <button
            onClick={() => setShowPatientModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FileText className="h-4 w-4" />
            Générer PDF
          </button>
        </div>
      </div>

      {/* Patient Info Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Informations du patient</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={patientInfo.lastName}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={patientInfo.firstName}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance (optionnel)</label>
                <input
                  type="date"
                  value={patientInfo.birthDate || ''}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Générer PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionPage;