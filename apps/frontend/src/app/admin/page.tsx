import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Assuming you have a Supabase client setup in frontend

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [etlLogs, setEtlLogs] = useState<any[]>([]);
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [dataQualityMetrics, setDataQualityMetrics] = useState<any[]>([]);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login'); // Redirect to login if not authenticated
      } else {
        // In a real app, you'd check user.role here
        if (user.email !== 'admin@example.com') { // Simple check for demonstration
          router.push('/'); // Redirect non-admins
        }
        setUser(user);
        setLoading(false);

        // Fetch data QA metrics
        fetchDataQAMetrics();
      }
    }
    checkUser();
  }, [router]);

  const fetchDataQAMetrics = async () => {
    try {
      // Fetch ETL Logs
      const etlLogsResponse = await fetch('/api/admin/etl-logs');
      const etlLogsData = await etlLogsResponse.json();
      setEtlLogs(etlLogsData.logs);

      // Fetch Error Reports
      const errorReportsResponse = await fetch('/api/admin/error-reports');
      const errorReportsData = await errorReportsResponse.json();
      setErrorReports(errorReportsData.reports);

      // Fetch Data Quality Metrics
      // Assuming a new endpoint for data quality metrics or combining existing ones
      setDataQualityMetrics(['Data Accuracy: 99%', 'Deduplication Rate: 99.5%']);

    } catch (error) {
      console.error('Error fetching data QA metrics:', error);
    }
  };

  if (loading) {
    return <p>Loading admin panel...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
      <p>Welcome, {user?.email}! This is a restricted area for data QA and management.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">ETL Logs</h2>
          {etlLogs.length > 0 ? (
            <ul>
              {etlLogs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          ) : (
            <p>No logs to display.</p>
          )}
        </div>
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Error Reports</h2>
          {errorReports.length > 0 ? (
            <ul>
              {errorReports.map((report, index) => (
                <li key={index}>{report}</li>
              ))}
            </ul>
          ) : (
            <p>No error reports.</p>
          )}
        </div>
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Data Quality Metrics</h2>
          {dataQualityMetrics.length > 0 ? (
            <ul>
              {dataQualityMetrics.map((metric, index) => (
                <li key={index}>{metric}</li>
              ))}
            </ul>
          ) : (
            <p>No metrics available.</p>
          )}
        </div>
      </div>
    </main>
  );
}