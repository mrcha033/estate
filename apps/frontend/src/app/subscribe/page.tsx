'use client';

import React, { useState } from 'react';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!consent) {
      setMessage('Please agree to the terms and conditions.');
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, frequency, consent }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Subscription successful!');
      } else {
        setMessage(data.message || 'Subscription failed.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Subscribe to Reports</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-4 border rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
          <select
            id="frequency"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="consent"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-gray-900">
            I agree to receive email updates and understand the privacy policy.
          </label>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Subscribe
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </form>
    </main>
  );
}
