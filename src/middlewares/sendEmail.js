import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gestiontallerdegradoucb@gmail.com', // Tu correo electrónico
            pass: 'prhb cfzz ejst dzvr'    // Contraseña o contraseña de aplicación
        }
    });

    const mailOptions = {
        from: 'gestiontallerdegradoucb@gmail.com',
        to,
        subject,
        text
    };

    return transporter.sendMail(mailOptions);
};
