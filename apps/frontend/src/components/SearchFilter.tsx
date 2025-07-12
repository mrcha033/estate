import React from 'react';

interface SearchFilterProps {
  onSearch: (filters: any) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const [district, setDistrict] = React.useState('');
  const [neighborhood, setNeighborhood] = React.useState('');
  const [subwayLine, setSubwayLine] = React.useState('');
  const [yearBuilt, setYearBuilt] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const handleSearch = () => {
    onSearch({
      district,
      neighborhood,
      subwayLine,
      yearBuilt,
      minPrice,
      maxPrice,
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
          <input
            type="text"
            id="district"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">Neighborhood</label>
          <input
            type="text"
            id="neighborhood"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="subwayLine" className="block text-sm font-medium text-gray-700">Subway Line</label>
          <input
            type="text"
            id="subwayLine"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={subwayLine}
            onChange={(e) => setSubwayLine(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700">Year Built</label>
          <input
            type="number"
            id="yearBuilt"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={yearBuilt}
            onChange={(e) => setYearBuilt(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price</label>
          <input
            type="number"
            id="minPrice"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price</label>
          <input
            type="number"
            id="maxPrice"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
