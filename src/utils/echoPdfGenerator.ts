import { jsPDF } from 'jspdf';
import { UploadedImage } from '../store/imageStore';
import { PatientInfo, DoctorInfo } from './pdf/types';
import { addHeaderImage, addHeader } from './pdf/header';
import { addContent } from './pdf/content';
import { addSignature } from './pdf/signature';
import { addFooter } from './pdf/footer';
import { addImagesPages } from './pdf/images';

export const generateEchoPDF = async (
  content: string,
  patientInfo: PatientInfo,
  doctorInfo: DoctorInfo,
  images: UploadedImage[] = []
): Promise<jsPDF> => {
  try {
    const doc = new jsPDF();
    
    // First page - Original layout
    let currentY = await addHeaderImage(doc);
    currentY = addHeader(doc, doctorInfo, patientInfo, currentY);
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('COMPTE RENDU D\'ÉCHOGRAPHIE', doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 20;
    
    // Content
    currentY = addContent(doc, content, currentY, patientInfo);
    
    // Add spacing after content
    currentY += 30;
    
    // Signature and footer
    addSignature(doc, doctorInfo.signature, `${doctorInfo.firstName} ${doctorInfo.lastName}`, currentY);
    addFooter(doc);
    
    // Additional pages for images
    if (images.length > 0) {
      await addImagesPages(doc, images, patientInfo, doctorInfo);
    }
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Impossible de générer le PDF. Veuillez réessayer.');
  }
};