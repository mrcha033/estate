import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChart = async (format: 'png' | 'pdf' | 'csv') => {
    if (chartRef.current) {
      if (format === 'png' || format === 'pdf') {
        const canvas = await html2canvas(chartRef.current);
        if (format === 'png') {
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `${title.replace(/\s/g, '_')}.png`;
          link.click();
        } else if (format === 'pdf') {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = canvas.height * imgWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          pdf.save(`${title.replace(/\s/g, '_')}.pdf`);
        }
      } else if (format === 'csv') {
        // For CSV export, we need to convert the data to CSV format
        const csvContent = "data:text/csv;charset=utf-8,"
          + data.map(e => `${e.name},${e.value}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title.replace(/\s/g, '_')}.csv`);
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link); // Clean up
      }
    }
  };

  return (
    <div className="w-full h-80">
      <h3 className="text-center text-lg font-semibold mb-4">{title}</h3>
      <div ref={chartRef} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center space-x-2">
        <button
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => exportChart('png')}
        >
          Export as PNG
        </button>
        <button
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => exportChart('pdf')}
        >
          Export as PDF
        </button>
        <button
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={() => exportChart('csv')}
        >
          Export as CSV
        </button>
      </div>
    </div>
  );
};

export default SimpleBarChart;