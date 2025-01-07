import { jsPDF } from 'jspdf';
import { DoctorInfo, PatientInfo } from './types';

export const addHeaderImage = async (doc: jsPDF): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const startY = 15;
      const headerWidth = 50;
      const headerHeight = 15;
      const headerX = 15;

      const img = new Image();
      img.src = '/header.jpg';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg');
            doc.addImage(imgData, 'JPEG', headerX, startY, headerWidth, headerHeight);
          }
          resolve(startY + headerHeight + 5);
        } catch (error) {
          console.warn('Error processing header image:', error);
          resolve(startY);
        }
      };

      img.onerror = () => {
        console.warn('Could not load header image');
        resolve(startY);
      };
    } catch (error) {
      console.warn('Error in header image setup:', error);
      resolve(15);
    }
  });
};

export const addHeader = (doc: jsPDF, doctorInfo: DoctorInfo, patientInfo: PatientInfo, startY: number): number => {
  try {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Doctor info (left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Dr ${doctorInfo.firstName} ${doctorInfo.lastName}`, 15, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`RPPS : ${doctorInfo.rpps}`, 15, startY + 7);
    doc.text(`ADELI : ${doctorInfo.adeli}`, 15, startY + 14);
    doc.text(doctorInfo.specialty || 'Médecin généraliste', 15, startY + 21);

    // Patient info (right)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const patientX = pageWidth - 15;
    doc.text([
      `Patient: ${patientInfo.lastName.toUpperCase()} ${patientInfo.firstName}`,
      `Né(e) le: ${new Date(patientInfo.birthDate).toLocaleDateString('fr-FR')}`,
      `Date: ${new Date().toLocaleDateString('fr-FR')}`
    ], patientX, startY, { align: 'right' });

    return startY + 35;
  } catch (error) {
    console.error('Error adding header:', error);
    throw new Error('Erreur lors de l\'ajout de l\'en-tête');
  }
};