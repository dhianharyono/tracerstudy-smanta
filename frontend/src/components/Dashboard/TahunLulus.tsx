import {
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { FaChartLine } from 'react-icons/fa';

interface YearStat {
  _id: string;
  count: number;
  value?: number;
}

interface TahunLulusProps {
  data: {
    yearStats: YearStat[];
  };
  chartWidth: number;
}

const TahunLulus = ({ data, chartWidth }: TahunLulusProps) => {
  const yearStats = data?.yearStats || [];
  const hasData = yearStats.length > 0;

  const responsiveChartWidth = Math.min(350, chartWidth);
  const chartHeight = 400;

  return (
    <div className='mb-6 md:mb-8 card max-w-sm md:max-w-md lg:max-w-full'>
      <h2 className='mb-6 flex items-center gap-3 text-xl text-text-primary'>
        <FaChartLine />
        <span>Statistik Berdasarkan Tahun Lulus</span>
      </h2>
      {!hasData ? (
        <div className='h-[350px] content-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
      ) : (
        <div className='chart-container'>
          <div className='w-full flex justify-center'>
            <LineChart
              width={responsiveChartWidth}
              height={chartHeight}
              data={yearStats}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(148, 163, 184, 0.2)'
              />
              <XAxis
                dataKey='_id'
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  color: 'var(--text-primary)',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
              <Line
                type='monotone'
                dataKey='count'
                stroke='var(--gray-300)'
                strokeWidth={2}
              />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default TahunLulus;
