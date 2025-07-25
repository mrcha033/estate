'use client';

import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../lib/segment';

interface PriceAlert {
  id: string;
  district_name?: string;
  apartment_name?: string;
  price_threshold?: number;
  threshold_type: 'above' | 'below' | 'change_percent';
  change_percent?: number;
  email: string;
  active: boolean;
  created_at: string;
}

interface AlertForm {
  district_name: string;
  apartment_name: string;
  price_threshold: string;
  threshold_type: 'above' | 'below' | 'change_percent';
  change_percent: string;
  email: string;
}

interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  price_above_alerts: number;
  price_below_alerts: number;
  change_alerts: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('user@example.com'); // In production, get from auth
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AlertForm>({
    district_name: '',
    apartment_name: '',
    price_threshold: '',
    threshold_type: 'above',
    change_percent: '',
    email: 'user@example.com'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
    
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track('Price Alerts Page Opened');
    }
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/alerts?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        setMessage({ type: 'error', text: '알림 목록을 불러오는데 실패했습니다.' });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setMessage({ type: 'error', text: '알림 목록을 불러오는 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/alerts/stats?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (formData.threshold_type === 'change_percent' && (!formData.change_percent || parseFloat(formData.change_percent) <= 0)) {
      setMessage({ type: 'error', text: '변동률 알림의 경우 변동률을 입력해주세요.' });
      return;
    }

    if ((formData.threshold_type === 'above' || formData.threshold_type === 'below') && 
        (!formData.price_threshold || parseFloat(formData.price_threshold) <= 0)) {
      setMessage({ type: 'error', text: '가격 알림의 경우 임계값을 입력해주세요.' });
      return;
    }

    try {
      setLoading(true);
      
      const alertData = {
        district_name: formData.district_name || undefined,
        apartment_name: formData.apartment_name || undefined,
        price_threshold: formData.price_threshold ? parseFloat(formData.price_threshold) * 10000 : undefined, // Convert to won
        threshold_type: formData.threshold_type,
        change_percent: formData.change_percent ? parseFloat(formData.change_percent) : undefined,
        email: userEmail
      };

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '가격 알림이 성공적으로 생성되었습니다!' });
        setShowForm(false);
        setFormData({
          district_name: '',
          apartment_name: '',
          price_threshold: '',
          threshold_type: 'above',
          change_percent: '',
          email: userEmail
        });
        
        fetchAlerts();
        fetchStatistics();

        const analytics = getAnalytics();
        if (analytics) {
          analytics.track('Price Alert Created', {
            threshold_type: formData.threshold_type,
            has_district: !!formData.district_name,
            has_apartment: !!formData.apartment_name
          });
        }
      } else {
        setMessage({ type: 'error', text: data.message || '알림 생성에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setMessage({ type: 'error', text: '알림 생성 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/alerts/${alertId}?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '알림이 삭제되었습니다.' });
        fetchAlerts();
        fetchStatistics();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || '알림 삭제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      setMessage({ type: 'error', text: '알림 삭제 중 오류가 발생했습니다.' });
    }
  };

  const formatThresholdType = (type: string) => {
    switch (type) {
      case 'above': return '이상';
      case 'below': return '이하';
      case 'change_percent': return '변동률';
      default: return type;
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 10000).toLocaleString()}만원`;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔔 가격 알림 관리
          </h1>
          <p className="text-lg text-gray-600">
            서울 아파트 가격 변동을 실시간으로 모니터링하고 알림을 받아보세요
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total_alerts}</div>
              <div className="text-sm text-gray-600">전체 알림</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.active_alerts}</div>
              <div className="text-sm text-gray-600">활성 알림</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.price_above_alerts}</div>
              <div className="text-sm text-gray-600">상승 알림</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.price_below_alerts}</div>
              <div className="text-sm text-gray-600">하락 알림</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.change_alerts}</div>
              <div className="text-sm text-gray-600">변동률 알림</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">내 알림 목록</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>새 알림 만들기</span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Create Alert Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 가격 알림 만들기</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구 이름 (선택)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 강남구"
                    value={formData.district_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, district_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    아파트명 (선택)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 래미안"
                    value={formData.apartment_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, apartment_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  알림 유형 *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'above', label: '가격 상승 알림', desc: '설정한 가격 이상이 되면 알림' },
                    { value: 'below', label: '가격 하락 알림', desc: '설정한 가격 이하가 되면 알림' },
                    { value: 'change_percent', label: '변동률 알림', desc: '설정한 변동률 이상 변화 시 알림' }
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.threshold_type === value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="threshold_type"
                        value={value}
                        className="sr-only"
                        checked={formData.threshold_type === value}
                        onChange={(e) => setFormData(prev => ({ ...prev, threshold_type: e.target.value as any }))}
                      />
                      <div className="w-full">
                        <div className="font-medium text-gray-900 text-sm">{label}</div>
                        <div className="text-xs text-gray-500 mt-1">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {(formData.threshold_type === 'above' || formData.threshold_type === 'below') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    임계값 (만원) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 50000"
                    value={formData.price_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_threshold: e.target.value }))}
                    required
                  />
                </div>
              )}

              {formData.threshold_type === 'change_percent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    변동률 (%) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 5.0"
                    value={formData.change_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, change_percent: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '알림 생성'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading && alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400">알림 목록을 불러오는 중...</div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">설정된 알림이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 가격 알림을 만들어보세요.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                알림 만들기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatThresholdType(alert.threshold_type)}
                        </span>
                        {alert.active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            활성
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {alert.district_name && `${alert.district_name} `}
                          {alert.apartment_name && `${alert.apartment_name} `}
                          {!alert.district_name && !alert.apartment_name && '전체 지역 '}
                          
                          {alert.threshold_type === 'change_percent' 
                            ? `${alert.change_percent}% 이상 변동 시 알림`
                            : `${formatPrice(alert.price_threshold!)} ${formatThresholdType(alert.threshold_type)} 시 알림`
                          }
                        </div>
                        <div className="text-gray-500 mt-1">
                          생성일: {new Date(alert.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="ml-4 text-red-600 hover:text-red-800 p-2"
                      title="알림 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}