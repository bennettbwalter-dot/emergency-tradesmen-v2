
import { supabase } from "./supabase";

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
    fromString?: string; // Optional custom name
}

export const sendEmail = async ({ to, subject, html, text, fromString }: SendEmailParams) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback: strip tags for text version
            from_name: fromString,
        },
    });

    if (error) {
        console.error('Error sending email:', error);
        throw error;
    }

    return data;
};

// --- Helper Functions for Common Emails ---

export const sendWelcomeEmail = async (email: string, name: string) => {
    const subject = "Welcome to Emergency Tradesmen!";
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p>Thanks for joining Emergency Tradesmen. We're here to help you get the best jobs done, fast.</p>
        <p>If you have any questions, just reply to this email.</p>
        <br>
        <p>Best,<br>The ET Team</p>
      </div>
    `;
    return sendEmail({ to: email, subject, html });
};

export const sendBookingNotification = async (tradesmanEmail: string, bookingDetails: any) => {
    const subject = `New Booking Request: ${bookingDetails.serviceType}`;
    const html = `
      <div style="font-family: sans-serif;">
        <h2>New Job Alert!</h2>
        <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Service:</strong> ${bookingDetails.serviceType}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Details:</strong> ${bookingDetails.notes}</p>
        <br>
        <a href="${window.location.origin}/admin/bookings" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
      </div>
    `;
    return sendEmail({ to: tradesmanEmail, subject, html });
};

