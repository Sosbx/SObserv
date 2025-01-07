import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_j1fjlog';
const EMAILJS_TEMPLATE_ID = 'template_wqn67rr';
const EMAILJS_PUBLIC_KEY = 'HqS9Z_pWQw5z7YDSD';

const CHUNK_SIZE = 25000; // 25KB to stay well under the 50KB limit

export const sendPdfByEmail = async (
  pdfBlob: Blob,
  email: string,
  patientName: string,
  type: 'prescription' | 'echo' = 'prescription'
): Promise<void> => {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Remove data URL prefix
      };
    });
    reader.readAsDataURL(pdfBlob);
    const base64pdf = await base64Promise;

    // Split the base64 string into chunks
    const chunks = [];
    for (let i = 0; i < base64pdf.length; i += CHUNK_SIZE) {
      chunks.push(base64pdf.slice(i, i + CHUNK_SIZE));
    }

    // Send each chunk as a separate email
    for (let i = 0; i < chunks.length; i++) {
      const emailParams = {
        to_email: email,
        to_name: patientName,
        subject: type === 'echo' ? 'Compte rendu d\'échographie' : 'Ordonnance',
        message: `${type === 'echo' ? 'Compte rendu d\'échographie' : 'Ordonnance'} - Partie ${i + 1}/${chunks.length}`,
        pdf_data: chunks[i],
        chunk_index: (i + 1).toString(),
        total_chunks: chunks.length.toString(),
        filename: type === 'echo' ? `echo_${patientName}.pdf` : `ordonnance_${patientName}.pdf`
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status !== 200) {
        throw new Error(`Erreur lors de l'envoi de la partie ${i + 1}`);
      }

      // Add a small delay between emails to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email. Veuillez réessayer.');
  }
};