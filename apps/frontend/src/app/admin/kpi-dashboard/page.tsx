'use client';

import { useEffect, useState } from 'react';
import SimpleLineChart from '../../../components/SimpleLineChart';
import SimpleBarChart from '../../../components/SimpleBarChart';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface KPIMetrics {
  mau: number;
  totalUsers: number;
  reportOpenRate: string;
  avgSessionDuration: string;
  etlHealthStatus: string;
  mauTrendData: { name: string; value: number }[];
  reportOpenRateTrendData: { name: string; value: number }[];
  sessionDurationTrendData: { name: string; value: number }[];
}

export default function KPIDashboardPage() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Assuming 'admin' is a role stored in user metadata or a custom claim
      // For simplicity, we'll check if user exists and has a specific role in app_metadata
      if (!user || user.app_metadata.user_role !== 'admin') {
        router.push('/login'); // Redirect to login or an unauthorized page
      } else {
        fetchMetrics();
      }
    };

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/kpi-metrics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: KPIMetrics = await response.json();
        setMetrics(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold mb-8">KPI Dashboard</h1>
        <p>Loading metrics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold mb-8">KPI Dashboard</h1>
        <p className="text-red-500">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">KPI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Monthly Active Users (MAU)</h2>
          <p className="text-3xl font-bold">{metrics?.mau}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{metrics?.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Report Open Rate</h2>
          <p className="text-3xl font-bold">{metrics?.reportOpenRate}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Avg. Session Duration</h2>
          <p className="text-3xl font-bold">{metrics?.avgSessionDuration}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">ETL Health Status</h2>
          <p className="text-3xl font-bold">{metrics?.etlHealthStatus}</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <SimpleLineChart data={metrics?.mauTrendData || []} title="MAU Trend" />
        <SimpleBarChart data={metrics?.reportOpenRateTrendData || []} title="Report Open Rate Trend" />
        <SimpleLineChart data={metrics?.sessionDurationTrendData || []} title="Average Session Duration Trend" />
      </div>
    </main>
  );
}
