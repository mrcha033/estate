import Image from 'next/image';
import dynamic from 'next/dynamic';
import SearchFilter from '@/components/SearchFilter';
import { getAnalytics } from '../../lib/segment';

const LazyLoadedComponent = dynamic(() => import('@/components/LazyLoadedComponent'), {
  ssr: false,
});

interface SearchFilters {
  district: string;
  neighborhood: string;
  subwayLine: string;
  yearBuilt: string;
  minPrice: string;
  maxPrice: string;
}

export default function SearchPage() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    const analytics = getAnalytics();
    analytics?.track('Product Search', filters);
    // In a real application, you would use these filters to call a backend API
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Search Page</h1>
      <div className="w-full max-w-md mb-8">
        <SearchFilter onSearch={handleSearch} />
      </div>

      <div className="mb-8">
        <h2>Lazy Loaded Image</h2>
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div>
        <h2>Lazy Loaded Component</h2>
        <LazyLoadedComponent />
      </div>
    </main>
  );
}
