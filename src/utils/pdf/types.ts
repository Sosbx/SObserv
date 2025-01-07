// Common types for PDF generation
export interface PatientInfo {
  lastName: string;
  firstName: string;
  birthDate: string;
}

export interface DoctorInfo {
  firstName: string;
  lastName: string;
  rpps: string;
  adeli: string;
  specialty: string;
  signature: string | null;
}

export interface PDFDimensions {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  footerSpace: number;
}