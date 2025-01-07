import { jsPDF } from 'jspdf';
import { DoctorInfo, PatientInfo } from './types';
import { UploadedImage } from '../../store/imageStore';
import { getPDFDimensions } from './common';

export const addImagesPages = async (
  doc: jsPDF, 
  images: UploadedImage[], 
  patientInfo: PatientInfo,
  doctorInfo: DoctorInfo
): Promise<void> => {
  try {
    if (images.length === 0) return;

    const { pageWidth, pageHeight, margin } = getPDFDimensions(doc);
    const imagesPerPage = 6;
    const imagesPerRow = 2;
    
    for (let i = 0; i < images.length; i += imagesPerPage) {
      doc.addPage();
      
      // Add header
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `${patientInfo.lastName.toUpperCase()} ${patientInfo.firstName} - ${new Date().toLocaleDateString('fr-FR')}`,
        pageWidth / 2,
        margin,
        { align: 'center' }
      );

      const startY = margin + 15;
      const imageWidth = (pageWidth - (margin * (imagesPerRow + 1))) / imagesPerRow;
      const imageHeight = (pageHeight - startY - margin - 20) / 3;

      const pageImages = images.slice(i, i + imagesPerPage);
      
      for (const [index, image] of pageImages.entries()) {
        try {
          const row = Math.floor(index / imagesPerRow);
          const col = index % imagesPerRow;
          const x = margin + (col * (imageWidth + margin));
          const y = startY + (row * (imageHeight + 10));

          doc.addImage(
            image.url,
            'JPEG',
            x,
            y,
            imageWidth,
            imageHeight,
            undefined,
            'MEDIUM'
          );
        } catch (error) {
          console.warn(`Error adding image ${image.name}:`, error);
          continue;
        }
      }

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Dr ${doctorInfo.firstName} ${doctorInfo.lastName}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  } catch (error) {
    console.error('Error adding image pages:', error);
    throw new Error('Erreur lors de l\'ajout des images');
  }
};