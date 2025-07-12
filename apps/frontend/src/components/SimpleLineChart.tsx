import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartData {
  name: string;
  value: number;
}

interface LineChartProps {
  data: ChartData[];
  title: string;
}

const SimpleLineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChart = async (format: 'png' | 'pdf') => {
    if (chartRef.current) {
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
    }
  };

  return (
    <div className="w-full h-80">
      <h3 className="text-center text-lg font-semibold mb-4">{title}</h3>
      <div ref={chartRef} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
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
        {/* CSV export would require data manipulation, not directly from chart image */}
      </div>
    </div>
  );
};

export default SimpleLineChart;