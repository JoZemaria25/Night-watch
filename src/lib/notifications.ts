
import { Twilio } from "twilio";
import { Resend } from "resend";

// Initialize Twilio Client
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Initialize Resend Client
const resendClient = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Sends an SMS using Twilio.
 * @param to - The recipient's phone number (E.164 format).
 * @param body - The message content.
 * @returns Object indicating success or failure.
 */
export async function sendSMS(to: string, body: string) {
    if (!twilioClient) {
        console.warn("⚠️ Twilio client not initialized. check TWILIO_SID and TWILIO_AUTH_TOKEN.");
        return { success: false, error: "Twilio not configured" };
    }

    try {
        const message = await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_FROM_NUMBER,
            to,
        });
        console.log(`✅ SMS Sent: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error: any) {
        console.error("❌ Failed to send SMS:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sends an Email using Resend.
 * @param to - The recipient's email address.
 * @param subject - The email subject line.
 * @param html - The HTML body of the email.
 * @returns Object indicating success or failure.
 */
export async function sendEmail(to: string, subject: string, html: string) {
    if (!resendClient) {
        console.warn("⚠️ Resend client not initialized. check RESEND_API_KEY.");
        return { success: false, error: "Resend not configured" };
    }

    try {
        const { data, error } = await resendClient.emails.send({
            from: "Night Watch <system@nightwatch.scheduler>", // Update with your verified domain
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("❌ Resend API Error:", error);
            return { success: false, error: error.message };
        }

        console.log(`✅ Email Sent: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error: any) {
        console.error("❌ Failed to send Email:", error.message);
        return { success: false, error: error.message };
    }
}
