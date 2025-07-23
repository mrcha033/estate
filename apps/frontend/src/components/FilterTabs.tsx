'use client';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  reportCounts: {
    all: number;
    weekly: number;
    monthly: number;
  };
}

export default function FilterTabs({ activeFilter, onFilterChange, reportCounts }: FilterTabsProps) {
  const tabs = [
    { id: 'all', label: '전체', count: reportCounts.all, icon: '📊' },
    { id: 'weekly', label: '주간', count: reportCounts.weekly, icon: '📅' },
    { id: 'monthly', label: '월간', count: reportCounts.monthly, icon: '📈' }
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeFilter === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeFilter === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}