import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function sendEmail(toAddress: string, subject: string, body: string) {
  const command = new SendEmailCommand({
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
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
