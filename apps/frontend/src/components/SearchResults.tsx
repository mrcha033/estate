'use client';

import { useState } from 'react';

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

interface SearchResultsProps {
  results: ApartmentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSort: {
    sort_by: string;
    sort_order: string;
  };
}

export default function SearchResults({
  results,
  pagination,
  onPageChange,
  onSortChange,
  currentSort
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`;
    } else if (price >= 10000) {
      return `${Math.round(price / 10000)}만`;
    }
    return price.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getAgeCategory = (year: number) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age <= 5) return { label: '신축', color: 'bg-green-100 text-green-800' };
    if (age <= 15) return { label: '준신축', color: 'bg-blue-100 text-blue-800' };
    if (age <= 25) return { label: '일반', color: 'bg-gray-100 text-gray-800' };
    return { label: '노후', color: 'bg-orange-100 text-orange-800' };
  };

  const handleSort = (sortBy: string) => {
    const newOrder = currentSort.sort_by === sortBy && currentSort.sort_order === 'desc' ? 'asc' : 'desc';
    onSortChange(sortBy, newOrder);
  };

  const getSortIcon = (sortBy: string) => {
    if (currentSort.sort_by !== sortBy) return '↕️';
    return currentSort.sort_order === 'desc' ? '↓' : '↑';
  };

  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.page;
    const total = pagination.totalPages;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header with sort and view options */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">검색 결과</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                ⊞
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleSort('date')}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              거래일자 {getSortIcon('date')}
            </button>
            <button
              onClick={() => handleSort('price')}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              가격 {getSortIcon('price')}
            </button>
            <button
              onClick={() => handleSort('area')}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              면적 {getSortIcon('area')}
            </button>
            <button
              onClick={() => handleSort('price_per_sqm')}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              단가 {getSortIcon('price_per_sqm')}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {results.map((transaction) => {
            const ageCategory = getAgeCategory(transaction.construction_year);
            return (
              <div key={transaction.unique_key} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {transaction.apartment_name}
                        </h4>
                        <p className="text-gray-600">
                          {transaction.district_name} {transaction.dong_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ageCategory.color}`}>
                          {ageCategory.label}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.floor}층
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">거래가</span>
                        <div className="font-semibold text-lg text-blue-600">
                          {formatPrice(transaction.transaction_amount_won)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">면적</span>
                        <div className="font-semibold">
                          {transaction.area_sqm.toFixed(1)}㎡
                          <span className="text-gray-400 text-xs ml-1">
                            ({transaction.area_pyeong.toFixed(1)}평)
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">단가</span>
                        <div className="font-semibold">
                          {Math.round(transaction.price_per_sqm / 10000)}만원/㎡
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">거래일</span>
                        <div className="font-semibold">
                          {formatDate(transaction.transaction_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">건축년도</div>
                      <div className="font-semibold">{transaction.construction_year}년</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      품질점수: {transaction.data_quality_score}/100
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((transaction) => {
            const ageCategory = getAgeCategory(transaction.construction_year);
            return (
              <div key={transaction.unique_key} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 truncate">
                      {transaction.apartment_name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {transaction.district_name} {transaction.dong_name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(transaction.transaction_amount_won)}
                    </div>
                    <div className="flex gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ageCategory.color}`}>
                        {ageCategory.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">면적</span>
                      <div className="font-semibold">{transaction.area_sqm.toFixed(1)}㎡</div>
                    </div>
                    <div>
                      <span className="text-gray-500">층수</span>
                      <div className="font-semibold">{transaction.floor}층</div>
                    </div>
                    <div>
                      <span className="text-gray-500">단가</span>
                      <div className="font-semibold">{Math.round(transaction.price_per_sqm / 10000)}만/㎡</div>
                    </div>
                    <div>
                      <span className="text-gray-500">건축년도</span>
                      <div className="font-semibold">{transaction.construction_year}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    {formatDate(transaction.transaction_date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              페이지 {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                처음
              </button>
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              <div className="flex gap-1">
                {generatePageNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
                    disabled={pageNum === '...'}
                    className={`px-3 py-1 text-sm border rounded ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : pageNum === '...'
                        ? 'cursor-default'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
              <button
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                마지막
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}