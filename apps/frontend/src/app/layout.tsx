import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '../components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Estate Insights - Seoul Apartment Market Analysis',
  description: 'AI-powered insights and analytics for the Seoul apartment real estate market. Find trends, reports, and data for informed decisions.',
  keywords: 'Seoul, apartment, real estate, market, analysis, insights, AI, trends, reports, data, property, Korea',
  openGraph: {
    title: 'Estate Insights - Seoul Apartment Market Analysis',
    description: 'AI-powered insights and analytics for the Seoul apartment real estate market. Find trends, reports, and data for informed decisions.',
    url: 'https://www.estateinsights.com',
    siteName: 'Estate Insights',
    images: [
      {
        url: 'https://www.estateinsights.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Estate Insights - Seoul Apartment Market Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estate Insights - Seoul Apartment Market Analysis',
    description: 'AI-powered insights and analytics for the Seoul apartment real estate market. Find trends, reports, and data for informed decisions.',
    creator: '@EstateInsights',
    images: ['https://www.estateinsights.com/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}