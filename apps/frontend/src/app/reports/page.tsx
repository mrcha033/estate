'use client';

import SimpleLineChart from '@/components/SimpleLineChart';
import SimpleBarChart from '@/components/SimpleBarChart';
import { useEffect, useState } from 'react';
import { getAnalytics } from '../../lib/segment';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const analytics = getAnalytics();
    analytics?.track('Report Opened');

    async function fetchReports() {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    }

    fetchReports();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Reports Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {reports.map((report, index) => (
          <div key={index}>
            <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
            {report.type === 'line' && <SimpleLineChart data={report.data} />}
            {report.type === 'bar' && <SimpleBarChart data={report.data} />}
          </div>
        ))}
      </div>
    </main>
  );
}