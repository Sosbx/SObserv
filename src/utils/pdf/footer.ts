import { jsPDF } from 'jspdf';
import { getPDFDimensions } from './common';

export const addFooter = (doc: jsPDF): void => {
  try {
    const { pageWidth, pageHeight } = getPDFDimensions(doc);
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    
    const footerLines = [
      'CONSULTATIONS SUR RENDEZ-VOUS : 05.56.48.75.59',
      'VISITES A DOMICILE : 05.56.44.74.74',
      '',
      'Membre d\'une association de gestion agréé, le règlement des honoraires par chèque et CB est accepté.'
    ];
    
    let yPosition = pageHeight - 25;
    const lineHeight = 3.5;
    
    footerLines.forEach((line) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight;
    });
  } catch (error) {
    console.error('Error adding footer:', error);
    // Don't throw here - footer is not critical
  }
};