import { Resend } from 'resend';

export type EmailPayload = {
    to: string;
    name: string;
    type: 'inspection' | 'notice';
    address: string;
    daysRemaining?: number;
};

export async function sendEmail({ to, name, type, address, daysRemaining }: EmailPayload) {
    // 1. Construct the Message
    let subject = "";
    let body = "";

    if (type === 'inspection') {
        subject = `Upcoming Inspection & Lease Renewal - ${address}`;
        body = `Hi ${name},\n\nThis is a friendly reminder that your lease at ${address} is coming up for renewal in ${daysRemaining} days.\n\nWe would like to schedule a routine property inspection next week. Please let us know what time works best for you.\n\nBest,\nProperty Management`;
    } else if (type === 'notice') {
        subject = `URGENT: Lease Expiration Warning - ${address}`;
        body = `Dear ${name},\n\nThis is a formal notice that your lease at ${address} expires in less than 30 days (${daysRemaining} days remaining).\n\nPlease contact us immediately to discuss renewal options or move-out procedures.\n\nSincerely,\nThe Night Watch`;
    }

    // 2. Send via Resend
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'Night Watch <onboarding@resend.dev>', // TODO: Update to production domain
            to: to,
            subject: subject,
            text: body
        });

        if (error) {
            console.error("❌ Resend Error:", error);
            return false;
        }

        console.log(`✅ Email sent to ${to}: ${data?.id}`);
        return true;

    } catch (err) {
        console.error("❌ Unexpected error sending email:", err);
        return false;
    }
}
