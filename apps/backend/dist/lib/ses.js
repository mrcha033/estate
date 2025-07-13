"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
async function sendEmail(toAddress, subject, body) {
    const command = new client_ses_1.SendEmailCommand({
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: process.env.SES_FROM_ADDRESS || 'noreply@example.com', // Verified SES email
    });
    try {
        const response = await sesClient.send(command);
        console.log('Email sent successfully:', response);
        return response;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
