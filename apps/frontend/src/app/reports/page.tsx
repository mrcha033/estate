'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '../../lib/segment';
import ReportCard from '@/components/ReportCard';
import FilterTabs from '@/components/FilterTabs';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Report {
  id: string;
  summary: string;
  model_hash: string;
  prompt_hash: string;
  s3_url: string;
  createdAt: string;
  type?: 'weekly' | 'monthly';
  title?: string;
}

interface ApartmentData {
  district_name: string;
  transaction_count: number;
  avg_price: number;
  avg_price_per_sqm: number;
  avg_area: number;
  price_change_percent?: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [apartmentData, setApartmentData] = useState<ApartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('Report Opened');
    }

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch reports from backend
        const reportsResponse = await fetch('/api/reports');
        if (!reportsResponse.ok) {
          throw new Error('Failed to fetch reports');
        }
        const reportsData = await reportsResponse.json();
        
        // Fetch apartment market data
        const apartmentResponse = await fetch('/api/apartment-data');
        const apartmentData = await apartmentResponse.json();
        
        // Enhanced reports with metadata
        const enhancedReports = reportsData.map((report: Report) => ({
          ...report,
          type: report.summary.toLowerCase().includes('weekly') ? 'weekly' : 'monthly',
          title: report.summary.toLowerCase().includes('weekly') 
            ? '주간 서울 아파트 시장 리포트' 
            : '월간 서울 아파트 시장 리포트'
        }));
        
        setReports(enhancedReports);
        setApartmentData(apartmentData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('리포트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredReports = reports.filter(report => {
    if (activeFilter === 'all') return true;
    return report.type === activeFilter;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">AI 리포트를 불러오는 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            새로고침
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏠 서울 아파트 시장 AI 리포트
          </h1>
          <p className="text-gray-600 text-lg">
            실시간 거래 데이터 기반 인공지능 분석 리포트
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>📊 총 {reports.length}개 리포트</span>
            <span>🔄 매주 월요일 업데이트</span>
            <span>📈 실거래가 기반 분석</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          reportCounts={{
            all: reports.length,
            weekly: reports.filter(r => r.type === 'weekly').length,
            monthly: reports.filter(r => r.type === 'monthly').length
          }}
        />

        {/* Market Overview */}
        {apartmentData.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">📊 시장 현황 개요</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {apartmentData.length}
                </div>
                <div className="text-sm text-gray-600">활성 거래 지역</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {apartmentData.reduce((sum, d) => sum + d.transaction_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">총 거래 건수</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(apartmentData.reduce((sum, d) => sum + d.avg_price, 0) / apartmentData.length / 10000).toLocaleString()}억
                </div>
                <div className="text-sm text-gray-600">평균 거래가</div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilter === 'all' ? '리포트가 없습니다' : `${activeFilter === 'weekly' ? '주간' : '월간'} 리포트가 없습니다`}
            </h3>
            <p className="text-gray-600">
              새로운 리포트가 생성되면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report}
                apartmentData={apartmentData}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            데이터 출처: 한국부동산원 실거래가 공개시스템 | 
            AI 분석: GPT-4 기반 자연어 처리
          </p>
          <p className="mt-1">
            마지막 업데이트: {reports.length > 0 ? new Date(reports[0].createdAt).toLocaleString('ko-KR') : 'N/A'}
          </p>
        </div>
      </div>
    </main>
  );
}