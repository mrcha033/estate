import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React, { useState, useEffect } from 'react';
import FeedbackForm from '../../components/FeedbackForm';
import { getAnalytics } from '../lib/segment';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

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
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const analytics = getAnalytics();
    analytics?.page();
  }, [pathname]);

  useEffect(() => {
    const analytics = getAnalytics();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        analytics?.identify(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        analytics?.reset();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleFeedbackSubmit = async (data: { name: string; email: string; message: string }) => {
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error; // Re-throw to be caught by FeedbackForm's onError
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Feedback
        </button>

        {showFeedbackForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">Send Us Feedback</h2>
              <FeedbackForm onSubmit={handleFeedbackSubmit} onSuccess={() => setShowFeedbackForm(false)} />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}