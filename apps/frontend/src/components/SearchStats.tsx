'use client';

interface SearchStatsProps {
  statistics: {
    avg_price: number;
    min_price: number;
    max_price: number;
    avg_area: number;
    avg_price_per_sqm: number;
    district_count: number;
    apartment_count: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: any;
}

export default function SearchStats({ statistics, pagination, filters }: SearchStatsProps) {
  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${Math.round(price / 100000000)}억`;
    } else if (price >= 10000) {
      return `${Math.round(price / 10000)}만`;
    }
    return price.toLocaleString();
  };

  const formatPricePerSqm = (price: number) => {
    return `${Math.round(price / 10000)}만원/㎡`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">📊 검색 결과 요약</h2>
        <div className="text-sm text-gray-500">
          총 {pagination.total.toLocaleString()}건 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {pagination.total.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">총 거래 건수</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(statistics.avg_price)}
          </div>
          <div className="text-sm text-gray-600">평균 거래가</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(statistics.avg_area)}㎡
          </div>
          <div className="text-sm text-gray-600">평균 면적</div>
          <div className="text-xs text-gray-500">
            ({Math.round(statistics.avg_area / 3.3058)}평)
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {formatPricePerSqm(statistics.avg_price_per_sqm)}
          </div>
          <div className="text-sm text-gray-600">평균 단가</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">가격 범위</div>
          <div className="font-semibold text-gray-900">
            {formatPrice(statistics.min_price)} ~ {formatPrice(statistics.max_price)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">지역 수</div>
          <div className="font-semibold text-gray-900">
            {statistics.district_count}개 자치구
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">아파트 단지</div>
          <div className="font-semibold text-gray-900">
            {statistics.apartment_count}개 단지
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {Object.keys(filters).some(key => filters[key] && !['sort_by', 'sort_order', 'page', 'limit'].includes(key)) && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">적용된 검색 조건</div>
          <div className="flex flex-wrap gap-2">
            {filters.district && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📍 {filters.district}
              </span>
            )}
            {filters.dong_name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📍 {filters.dong_name}
              </span>
            )}
            {filters.apartment_name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🏠 {filters.apartment_name}
              </span>
            )}
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                💰 {filters.min_price ? `${filters.min_price.toLocaleString()}만원` : '0'} ~ {filters.max_price ? `${filters.max_price.toLocaleString()}만원` : '무제한'}
              </span>
            )}
            {(filters.min_area || filters.max_area) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                📐 {filters.min_area || '0'}㎡ ~ {filters.max_area || '무제한'}㎡
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}