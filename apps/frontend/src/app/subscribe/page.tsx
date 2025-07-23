'use client';

import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../lib/segment';

interface SubscriptionState {
  email: string;
  frequency: string;
  preferences: {
    weeklyReports: boolean;
    monthlyReports: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
  };
  consent: boolean;
  privacyConsent: boolean;
}

export default function SubscribePage() {
  const [formData, setFormData] = useState<SubscriptionState>({
    email: '',
    frequency: 'weekly',
    preferences: {
      weeklyReports: true,
      monthlyReports: false,
      priceAlerts: false,
      marketUpdates: false
    },
    consent: false,
    privacyConsent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const analytics = getAnalytics();
    analytics?.track('Subscription Page Opened');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    if (!formData.consent || !formData.privacyConsent) {
      setMessage({ type: 'error', text: '모든 약관에 동의해주세요.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          frequency: formData.frequency,
          preferences: formData.preferences,
          consent: formData.consent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: '구독 신청이 완료되었습니다! 이메일을 확인하여 구독을 인증해주세요.' 
        });
        
        const analytics = getAnalytics();
        analytics?.track('Subscription Completed', {
          frequency: formData.frequency,
          preferences: formData.preferences
        });
        
        // Reset form after successful submission
        setFormData({
          email: '',
          frequency: 'weekly',
          preferences: {
            weeklyReports: true,
            monthlyReports: false,
            priceAlerts: false,
            marketUpdates: false
          },
          consent: false,
          privacyConsent: false
        });
      } else {
        setMessage({ type: 'error', text: data.message || '구독 신청에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage({ type: 'error', text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof formData.preferences) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            서울 아파트 시장 리포트 구독
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI가 분석한 서울 아파트 실거래가 정보를 정기적으로 받아보세요. 
            주간·월간 리포트와 시장 변동 알림을 제공합니다.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">실시간 데이터</h3>
            <p className="text-sm text-gray-600">한국부동산원 공식 실거래가 데이터 기반</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI 분석</h3>
            <p className="text-sm text-gray-600">GPT-4가 분석한 시장 동향과 인사이트</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">맞춤 알림</h3>
            <p className="text-sm text-gray-600">관심 지역 가격 변동 즉시 알림</p>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소 *
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                리포트 발송 주기 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.frequency === 'weekly' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    className="sr-only"
                    checked={formData.frequency === 'weekly'}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">📅 주간 리포트</div>
                        <div className="text-gray-500">매주 월요일 발송</div>
                      </div>
                    </div>
                    <div className="text-blue-600 font-semibold">추천</div>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.frequency === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    className="sr-only"
                    checked={formData.frequency === 'monthly'}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">📊 월간 리포트</div>
                        <div className="text-gray-500">매월 1일 발송</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                추가 알림 설정 (선택)
              </label>
              <div className="space-y-3">
                {[
                  { key: 'priceAlerts', label: '🔔 가격 변동 알림', desc: '관심 지역 가격 급등락 시 즉시 알림' },
                  { key: 'marketUpdates', label: '📰 시장 뉴스', desc: '부동산 정책 변화 및 시장 이슈' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.preferences[key as keyof typeof formData.preferences]}
                      onChange={() => handlePreferenceChange(key as keyof typeof formData.preferences)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4 pt-4 border-t">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  required
                />
                <div className="text-sm text-gray-700">
                  이메일 수신에 동의하며, 언제든지 구독을 취소할 수 있음을 이해합니다. *
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.privacyConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                  required
                />
                <div className="text-sm text-gray-700">
                  개인정보 처리방침에 동의합니다. *
                </div>
              </label>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.consent || !formData.privacyConsent}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '구독 신청 중...' : '📧 구독 신청하기'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
            <p>
              무료로 제공되며, 스팸 메일은 발송하지 않습니다. 
              <br />
              구독 취소는 이메일 하단의 링크를 통해 언제든 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
