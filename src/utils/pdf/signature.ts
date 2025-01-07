import { jsPDF } from 'jspdf';
import { getPDFDimensions } from './common';

export const addSignature = (doc: jsPDF, signature: string | null, doctorName: string, startY: number): void => {
  try {
    const { pageWidth } = getPDFDimensions(doc);
    const signatureWidth = 50;
    const signatureHeight = 25;
    const signatureX = pageWidth - signatureWidth - 15;

    // Add doctor name below signature
    if (signature) {
      doc.addImage(signature, 'PNG', signatureX, startY, signatureWidth, signatureHeight);
    }

    // Add doctor name below signature with spacing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Dr ${doctorName}`, signatureX + (signatureWidth / 2), startY + signatureHeight + 5, { align: 'center' });
  } catch (error) {
    console.error('Error adding signature:', error);
    // Don't throw here - signature is optional
  }
};