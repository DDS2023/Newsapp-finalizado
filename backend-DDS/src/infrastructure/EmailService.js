import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Crear transportador
// Para dev/demo sin credenciales reales, podemos usar una cuenta de prueba o solo registrar.
// Aquí configuramos un transportador que busca variables de entorno, o recurre a 'stream' (registra en consola)
let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} else {
    // Recurso: Transporte JSON a consola (Simulación)
    transporter = nodemailer.createTransport({
        jsonTransport: true
    });
}

export async function sendEmail(to, subject, text) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"NewsApp" <noreply@newsapp.com>',
            to,
            subject,
            text,
        });

        console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
        if (info.message) {
            console.log('[Email Content]:', JSON.parse(info.message).text);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
