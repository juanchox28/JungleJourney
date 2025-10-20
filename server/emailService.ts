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

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: emailUser,
      to: booking.email,
      subject: `Booking Confirmation - ${booking.reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Booking Confirmation</h1>
          <p>Dear ${booking.name},</p>
          <p>Thank you for your booking! Here are your booking details:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Reference:</strong> ${booking.reference}</p>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            ${booking.checkIn && booking.checkOut ? `
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut}</p>
            ` : ''}
            ${booking.guests ? `<p><strong>Guests:</strong> ${booking.guests}</p>` : ''}
            ${booking.room ? `<p><strong>Accommodation:</strong> ${booking.room}</p>` : ''}
            ${booking.amount ? `<p><strong>Total Amount:</strong> $${booking.amount.toLocaleString()}</p>` : ''}
          </div>

          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>JungleJourney Team</p>
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