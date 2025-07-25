'use client';

import { useState, useEffect } from 'react';
import { getAnalytics } from '../../lib/segment';
import EnhancedSearchFilter from '@/components/EnhancedSearchFilter';
import SearchResults from '@/components/SearchResults';
import SearchStats from '@/components/SearchStats';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SearchFilters extends Record<string, string | number | undefined> {
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

interface ApartmentTransaction {
  unique_key: string;
  district_name: string;
  dong_name: string;
  apartment_name: string;
  transaction_amount_won: number;
  transaction_amount_display: string;
  area_sqm: number;
  area_pyeong: number;
  construction_year: number;
  floor: number;
  transaction_date: string;
  price_per_sqm: number;
  data_quality_score: number;
}

interface SearchResponse {
  results: ApartmentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: {
    avg_price: number;
    min_price: number;
    max_price: number;
    avg_area: number;
    avg_price_per_sqm: number;
    district_count: number;
    apartment_count: number;
  };
  filters: SearchFilters;
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    sort_by: 'date',
    sort_order: 'desc',
    page: 1,
    limit: 20
  });


  const performSearch = async (filters: SearchFilters, resetPage: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters = {
        ...filters,
        page: resetPage ? 1 : filters.page || 1
      };

      setCurrentFilters(searchFilters);

      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/search/apartments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('검색 요청에 실패했습니다');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);

      // Track search analytics
      const analytics = getAnalytics();
      analytics?.track('Apartment Search Performed', {
        filters: searchFilters,
        resultsCount: data.pagination.total
      });

    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : '검색 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // Initial search on page load
  useEffect(() => {
    performSearch(currentFilters, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    performSearch(filters, true);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...currentFilters, page: newPage };
    performSearch(newFilters, false);
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const newFilters = { 
      ...currentFilters, 
      sort_by: sortBy as 'price' | 'date' | 'area' | 'price_per_sqm', 
      sort_order: sortOrder,
      page: 1 
    };
    performSearch(newFilters, false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 서울 아파트 검색
          </h1>
          <p className="text-lg text-gray-600">
            실거래가 기반 아파트 검색 및 시장 분석
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <EnhancedSearchFilter 
                onSearch={handleSearch}
                initialFilters={currentFilters}
                loading={loading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Statistics */}
            {searchResults && !loading && (
              <SearchStats 
                statistics={searchResults.statistics}
                pagination={searchResults.pagination}
                filters={searchResults.filters}
              />
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">검색 중...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <div className="text-red-600 text-xl mr-3">⚠️</div>
                  <div>
                    <h3 className="text-red-800 font-semibold">검색 오류</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => performSearch(currentFilters, false)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* Search Results */}
            {searchResults && !loading && !error && (
              <SearchResults
                results={searchResults.results}
                pagination={searchResults.pagination}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                currentSort={{
                  sort_by: currentFilters.sort_by || 'date',
                  sort_order: currentFilters.sort_order || 'desc'
                }}
              />
            )}

            {/* No Results */}
            {searchResults && searchResults.results.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  검색 조건을 조정하여 다시 시도해보세요.
                </p>
                <button
                  onClick={() => {
                    const resetFilters = { sort_by: 'date' as const, sort_order: 'desc' as const, page: 1, limit: 20 };
                    performSearch(resetFilters, true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  전체 검색 결과 보기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
