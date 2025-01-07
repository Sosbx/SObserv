import { jsPDF } from 'jspdf';
import { PatientInfo } from './types';
import { getPDFDimensions, checkPageBreak } from './common';

export const addContent = (doc: jsPDF, content: string, startY: number, patientInfo: PatientInfo): number => {
  try {
    const { margin, maxWidth } = getPDFDimensions(doc);
    let currentY = startY;

    const lines = content.split('\n');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        currentY += 3;
        continue;
      }

      if (trimmedLine.endsWith(':')) {
        currentY = checkPageBreak(doc, currentY, 13, patientInfo);
        if (currentY > startY) currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(trimmedLine, margin, currentY);
        currentY += 8;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(trimmedLine, maxWidth);
        const textHeight = splitText.length * 5;
        
        currentY = checkPageBreak(doc, currentY, textHeight, patientInfo);
        doc.text(splitText, margin, currentY);
        currentY += textHeight + 2;
      }
    }

    return currentY;
  } catch (error) {
    console.error('Error adding content:', error);
    throw new Error('Erreur lors de l\'ajout du contenu');
  }
};