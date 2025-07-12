
import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to the Estate Beta!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for joining our closed beta program. Follow the steps below to get started.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              If you haven't already, please{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                sign up here
              </Link>{' '}
              using the email address to which you received your invitation.
            </li>
            <li>
              Once signed up, log in to your account.
            </li>
            <li>
              Explore the platform and its features. We encourage you to try out the search, reports, and insights sections.
            </li>
            <li>
              Provide your valuable feedback using the support channel mentioned below.
            </li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800">Frequently Asked Questions (FAQs)</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900">Q: How do I report a bug or provide feedback?</h4>
              <p className="mt-1 text-sm">
                A: Please use our dedicated support email at <a href="mailto:support@estate.com" className="text-indigo-600 hover:text-indigo-500">support@estate.com</a>.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Q: What data is available on the platform?</h4>
              <p className="mt-1 text-sm">
                A: We provide AI-generated weekly and monthly insight reports on Seoul apartment transactions, sourced from government land registries and certified data providers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Q: Is my data secure?</h4>
              <p className="mt-1 text-sm">
                A: Yes, we implement OAuth 2.0, TLS 1.3, OWASP Top 10 compliance, and encrypt PII at rest to ensure your data is secure.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Thank you for being a part of our beta program!</p>
        </div>
      </div>
    </div>
  );
}
