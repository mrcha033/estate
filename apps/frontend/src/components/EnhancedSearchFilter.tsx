'use client';

import { useState, useEffect } from 'react';

interface SearchFilters {
  district?: string;
  dong_name?: string;
  apartment_name?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  construction_year_start?: number;
  construction_year_end?: number;
  min_floor?: number;
  max_floor?: number;
  sort_by?: 'price' | 'date' | 'area' | 'price_per_sqm';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface EnhancedSearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
  loading: boolean;
}

interface District {
  district_name: string;
  transaction_count: number;
}

export default function EnhancedSearchFilter({ onSearch, initialFilters, loading }: EnhancedSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch districts on component mount
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Fetch neighborhoods when district changes
  useEffect(() => {
    if (filters.district) {
      fetchNeighborhoods(filters.district);
    } else {
      setNeighborhoods([]);
    }
  }, [filters.district]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/search/districts');
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchNeighborhoods = async (district: string) => {
    try {
      const response = await fetch(`/api/search/districts/${encodeURIComponent(district)}/neighborhoods`);
      if (response.ok) {
        const data = await response.json();
        setNeighborhoods(data);
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const resetFilters = () => {
    const resetFilters = {
      sort_by: 'date' as const,
      sort_order: 'desc' as const,
      page: 1,
      limit: 20
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">검색 필터</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            초기화
          </button>
        </div>

        {/* Location Filters */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">📍 위치</h3>
          
          {/* District Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              자치구
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.district || ''}
              onChange={(e) => updateFilter('district', e.target.value)}
            >
              <option value="">전체 자치구</option>
              {districts.map((district) => (
                <option key={district.district_name} value={district.district_name}>
                  {district.district_name} ({district.transaction_count.toLocaleString()}건)
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Selection */}
          {neighborhoods.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                동/읍/면
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.dong_name || ''}
                onChange={(e) => updateFilter('dong_name', e.target.value)}
              >
                <option value="">전체 동</option>
                {neighborhoods.map((neighborhood: any) => (
                  <option key={neighborhood.dong_name} value={neighborhood.dong_name}>
                    {neighborhood.dong_name} ({neighborhood.transaction_count.toLocaleString()}건)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Apartment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              아파트명
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 래미안, 아크로..."
              value={filters.apartment_name || ''}
              onChange={(e) => updateFilter('apartment_name', e.target.value)}
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">💰 가격대</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">최소 (만원)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 50000"
                value={filters.min_price || ''}
                onChange={(e) => updateFilter('min_price', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">최대 (만원)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 200000"
                value={filters.max_price || ''}
                onChange={(e) => updateFilter('max_price', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">📐 면적</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">최소 (㎡)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 60"
                value={filters.min_area || ''}
                onChange={(e) => updateFilter('min_area', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">최대 (㎡)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 150"
                value={filters.max_area || ''}
                onChange={(e) => updateFilter('max_area', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{showAdvanced ? '고급 필터 숨기기' : '고급 필터 표시'}</span>
            <span className="ml-1">{showAdvanced ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Construction Year */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">🏗️ 건축년도</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작년도</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 2000"
                    min="1950"
                    max="2024"
                    value={filters.construction_year_start || ''}
                    onChange={(e) => updateFilter('construction_year_start', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료년도</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 2020"
                    min="1950"
                    max="2024"
                    value={filters.construction_year_end || ''}
                    onChange={(e) => updateFilter('construction_year_end', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Floor Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">🏢 층수</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">최소층</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 1"
                    min="1"
                    value={filters.min_floor || ''}
                    onChange={(e) => updateFilter('min_floor', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">최대층</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 20"
                    min="1"
                    value={filters.max_floor || ''}
                    onChange={(e) => updateFilter('max_floor', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? '검색 중...' : '🔍 검색하기'}
        </button>
      </form>

      {/* Active Filters Summary */}
      {Object.keys(filters).some(key => filters[key as keyof SearchFilters] && !['sort_by', 'sort_order', 'page', 'limit'].includes(key)) && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">적용된 필터</h4>
          <div className="flex flex-wrap gap-2">
            {filters.district && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.district}
                <button
                  onClick={() => updateFilter('district', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.min_price && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.min_price.toLocaleString()}만원 이상
                <button
                  onClick={() => updateFilter('min_price', undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.max_price && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.max_price.toLocaleString()}만원 이하
                <button
                  onClick={() => updateFilter('max_price', undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}