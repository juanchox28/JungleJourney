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

interface PaymentFailureData {
  reference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentData: any;
  bookingType: string;
  errorDetails?: string;
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

export async function sendNewReservationNotification(data: {
  reference: string;
  guestName: string;
  guestEmail: string;
  visitDate: string;
  bookingType: string;
  totalPrice?: number;
  itemsSummary?: string;
}) {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ Email credentials not configured');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    const subject = `nueva reserva ${data.guestName} ${data.visitDate}`;

    const mailOptions = {
      from: emailUser,
      to: 'amazonaspuertonarino@gmail.com',
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.5;">
          <h2 style="color: #1e40af; margin-bottom: 8px;">🆕 Nueva Reserva / New Reservation</h2>
          <p style="margin: 0 0 16px; color: #374151;">
            Se ha recibido una nueva reserva. / A new booking has been received.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 160px;">Referencia / Reference:</td>
                <td style="padding: 6px 0;"><strong>${data.reference}</strong></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Cliente / Guest:</td>
                <td style="padding: 6px 0;">${data.guestName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Email del cliente / Guest Email:</td>
                <td style="padding: 6px 0;">${data.guestEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Fecha de visita / Visit Date:</td>
                <td style="padding: 6px 0;">${data.visitDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Tipo / Type:</td>
                <td style="padding: 6px 0;">${data.bookingType}</td>
              </tr>
              ${data.totalPrice ? `
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Monto Total / Total Amount:</td>
                <td style="padding: 6px 0;"><strong>$${data.totalPrice.toLocaleString('es-CO')}</strong></td>
              </tr>` : ''}
            </table>
          </div>

          ${data.itemsSummary ? `
          <div style="margin-bottom: 20px;">
            <strong style="display:block; margin-bottom: 6px;">Detalle de la reserva / Booking Details:</strong>
            <pre style="background:#f1f5f9; padding:12px; border-radius:6px; font-size:13px; white-space:pre-wrap; margin:0;">${data.itemsSummary}</pre>
          </div>` : ''}

          <p style="color:#64748b; font-size:13px; margin-top:24px;">
            Este es un mensaje automático del sistema de reservas de Paraíso Ayahuasca.<br>
            This is an automatic message from the Paraíso Ayahuasca booking system.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Nueva reserva notification sent to owner:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending new reservation notification:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendPaymentFailureNotification(failureData: PaymentFailureData) {
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
      to: 'amazonaspuertonarino@gmail.com',
      subject: `🚨 PAGO FALLIDO - ${failureData.reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Notificación de Pago Fallido</h1>
          <p><strong>Referencia:</strong> ${failureData.reference}</p>
          <p><strong>Tipo de Reserva:</strong> ${failureData.bookingType}</p>
          <p><strong>Cliente:</strong> ${failureData.customerName}</p>
          <p><strong>Email:</strong> ${failureData.customerEmail}</p>
          <p><strong>Monto:</strong> $${failureData.amount.toLocaleString('es-CO')}</p>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626;">Estado: PAGO FALLIDO</h3>
            ${failureData.errorDetails ? `<p><strong>Detalles del Error:</strong> ${failureData.errorDetails}</p>` : ''}
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Datos del Pago:</h3>
            <pre style="background-color: white; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(failureData.paymentData, null, 2)}</pre>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Esta notificación fue generada automáticamente por el sistema de reservas.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payment failure notification sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      error: null
    };

  } catch (error) {
    console.error('❌ Error sending payment failure notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      messageId: null
    };
  }
}