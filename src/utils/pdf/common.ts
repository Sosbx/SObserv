import { jsPDF } from 'jspdf';
import { PDFDimensions, PatientInfo } from './types';

export const getPDFDimensions = (doc: jsPDF): PDFDimensions => ({
  pageWidth: doc.internal.pageSize.getWidth(),
  pageHeight: doc.internal.pageSize.getHeight(),
  margin: 15,
  footerSpace: 40
});

export const addPatientHeader = (doc: jsPDF, patientInfo: PatientInfo, margin: number): void => {
  const { pageWidth } = getPDFDimensions(doc);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const headerText = `${patientInfo.lastName.toUpperCase()} ${patientInfo.firstName} - ${new Date().toLocaleDateString('fr-FR')}`;
  doc.text(headerText, pageWidth / 2, margin, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
};

export const addNewPage = (doc: jsPDF, patientInfo: PatientInfo): number => {
  const { margin } = getPDFDimensions(doc);
  doc.addPage();
  addPatientHeader(doc, patientInfo, margin);
  return margin + 10;
};

export const checkPageBreak = (
  doc: jsPDF,
  currentY: number,
  contentHeight: number,
  patientInfo: PatientInfo
): number => {
  const { pageHeight, footerSpace, margin } = getPDFDimensions(doc);
  
  if (currentY + contentHeight > pageHeight - footerSpace) {
    return addNewPage(doc, patientInfo);
  }
  return currentY;
};