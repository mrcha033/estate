import SimpleLineChart from '@/components/SimpleLineChart';
import SimpleBarChart from '@/components/SimpleBarChart';

export default function ReportsPage() {
  const lineChartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  const barChartData = [
    { name: 'Category A', value: 2400 },
    { name: 'Category B', value: 1398 },
    { name: 'Category C', value: 9800 },
    { name: 'Category D', value: 3908 },
    { name: 'Category E', value: 4800 },
    { name: 'Category F', value: 3800 },
    { name: 'Category G', value: 4300 },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Reports Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <SimpleLineChart data={lineChartData} title="Monthly Sales Trend" />
        <SimpleBarChart data={barChartData} title="Product Category Sales" />
      </div>
    </main>
  );
}