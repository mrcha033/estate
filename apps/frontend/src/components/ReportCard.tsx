'use client';

import { useState } from 'react';
import SimpleBarChart from './SimpleBarChart';

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

interface ReportCardProps {
  report: Report;
  apartmentData: ApartmentData[];
}

export default function ReportCard({ report, apartmentData }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  const reportDate = new Date(report.createdAt);
  const isWeekly = report.type === 'weekly';
  
  // Format apartment data for visualization
  const chartData = apartmentData.slice(0, 10).map(item => ({
    name: item.district_name.replace('서울특별시 ', '').replace('구', ''),
    value: Math.round(item.avg_price / 10000), // Convert to 억 (hundreds of millions)
    transactions: item.transaction_count,
    pricePerSqm: Math.round(item.avg_price_per_sqm / 10000)
  }));

  const handleDownloadReport = async () => {
    try {
      // In a real implementation, fetch from S3 URL
      const response = await fetch(report.s3_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}_${reportDate.toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('리포트 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isWeekly 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {isWeekly ? '📅 주간 리포트' : '📊 월간 리포트'}
              </span>
              <span className="text-xs text-gray-500">
                {reportDate.toLocaleDateString('ko-KR')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {report.title || (isWeekly ? '주간 서울 아파트 시장 리포트' : '월간 서울 아파트 시장 리포트')}
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="차트 보기"
            >
              📈
            </button>
            <button
              onClick={handleDownloadReport}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="리포트 다운로드"
            >
              📄
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* AI Summary */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🤖 AI 분석 요약</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">
              {isExpanded ? report.summary : `${report.summary.slice(0, 200)}...`}
            </p>
            {report.summary.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isExpanded ? '접기' : '더 보기'}
              </button>
            )}
          </div>
        </div>

        {/* Visualization */}
        {showVisualization && chartData.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📊 지역별 평균 거래가</h4>
            <div className="bg-white rounded-lg border p-4">
              <SimpleBarChart data={chartData} />
              <div className="mt-2 text-xs text-gray-500 text-center">
                단위: 억원 | 상위 10개 지역
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        {apartmentData.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">분석 지역</div>
              <div className="text-lg font-semibold text-blue-600">
                {apartmentData.length}개 구
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">거래 건수</div>
              <div className="text-lg font-semibold text-green-600">
                {apartmentData.reduce((sum, d) => sum + d.transaction_count, 0).toLocaleString()}건
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">모델:</span> GPT-4
            </div>
            <div>
              <span className="font-medium">생성시각:</span> {reportDate.toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowVisualization(!showVisualization)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showVisualization ? '차트 숨기기' : '차트 보기'}
            </button>
            <button 
              onClick={handleDownloadReport}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              전체 리포트 다운로드
            </button>
          </div>
          <div className="text-xs text-gray-400">
            ID: {report.id.slice(0, 8)}
          </div>
        </div>
      </div>
    </div>
  );
}