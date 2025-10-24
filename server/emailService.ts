import nodemailer from 'nodemailer';

interface BookingData {
  reference: string;
  name: string;
  email: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  room?: string;
  amount?: number;
}

export async function sendConfirmationEmail(booking: BookingData) {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ Email credentials not configured');
      return {
        success: false,
        error: 'Email credentials not configured',
        messageId: null
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: emailUser,
      to: booking.email,
      subject: `Confirmación de Reserva - ${booking.reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Confirmación de Reserva</h1>
          <p>Estimado ${booking.name},</p>
          <p>¡Gracias por su reserva! Aquí están los detalles de su reserva:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalles de la Reserva:</h3>
            <p><strong>Referencia:</strong> ${booking.reference}</p>
            <p><strong>Nombre:</strong> ${booking.name}</p>
            <p><strong>Correo Electrónico:</strong> ${booking.email}</p>
            ${booking.checkIn && booking.checkOut ? `
            <p><strong>Fecha de Entrada:</strong> ${booking.checkIn}</p>
            <p><strong>Fecha de Salida:</strong> ${booking.checkOut}</p>
            ` : ''}
            ${booking.guests ? `<p><strong>Número de Huéspedes:</strong> ${booking.guests}</p>` : ''}
            ${booking.room ? `<p><strong>Habitación:</strong> ${booking.room}</p>` : ''}
            ${booking.amount ? `<p><strong>Monto Total:</strong> $${booking.amount.toLocaleString('es-CO')}</p>` : ''}
          </div>

          <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
          <p>Atentamente,<br>Equipo de Conexion-Amazonas</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      error: null
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      messageId: null
    };
  }
}