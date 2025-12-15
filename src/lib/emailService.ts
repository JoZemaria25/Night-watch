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

    // 2. Mock Send (Logging to Console)
    console.log(`\n--- 📧 EMAIL SIMULATION ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: \n${body}`);
    console.log(`---------------------------\n`);

    /**
     * V2 IMPLEMENTATION:
     * 
     * import { Resend } from 'resend';
     * const resend = new Resend(process.env.RESEND_API_KEY);
     * 
     * await resend.emails.send({
     *   from: 'Night Watch <system@nightwatch.com>',
     *   to: to,
     *   subject: subject,
     *   text: body
     * });
     */

    return true;
}
