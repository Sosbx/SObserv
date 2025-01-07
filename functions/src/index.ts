import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.app_password // Utiliser un mot de passe d'application Gmail
  }
});

export const sendPrescriptionEmail = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Vérifier l'authentification
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'L\'utilisateur doit être authentifié'
      );
    }

    const { email, pdfUrl, patientName, type } = data;

    try {
      const emailSubject = type === 'echo' 
        ? 'Votre compte rendu d\'échographie' 
        : 'Votre ordonnance';

      await transporter.sendMail({
        from: '"Service médical" <no-reply@votre-domaine.com>',
        to: email,
        subject: emailSubject,
        text: `Bonjour,\n\nVeuillez trouver ci-joint votre document médical.\n\nCordialement,`,
        html: `
          <p>Bonjour,</p>
          <p>Veuillez trouver ci-joint votre document médical.</p>
          <p>Cordialement,</p>
        `,
        attachments: [
          {
            filename: type === 'echo' 
              ? `echo_${patientName}.pdf`
              : `ordonnance_${patientName}.pdf`,
            path: pdfUrl
          }
        ]
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new functions.https.HttpsError('internal', 'Erreur lors de l\'envoi de l\'email');
    }
  });