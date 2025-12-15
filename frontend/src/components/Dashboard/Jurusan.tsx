import { FaChartBar } from 'react-icons/fa';
import {
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface MajorStat {
  _id: string;
  count: number;
  value?: number;
}

interface JurusanProps {
  data: {
    majorStats: MajorStat[];
  };
  chartWidth: number;
}

const Jurusan = ({ data, chartWidth }: JurusanProps) => {
  const majorStats = data?.majorStats || [];
  const hasData = majorStats.length > 0;

  return (
    <div className='mb-6 md:mb-8 card max-w-sm md:max-w-md lg:max-w-full'>
      <h2 className='mb-6 flex items-center gap-3 text-xl text-text-primary'>
        <FaChartBar />
        <span>Statistik Jurusan</span>
      </h2>
      {!hasData ? (
        <div className='h-[350px] content-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
      ) : (
        <div className='chart-container'>
          <div className='w-full flex justify-center overflow-x-auto'>
            <BarChart
              width={Math.min(500, chartWidth)}
              height={470}
              data={majorStats}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(148, 163, 184, 0.2)'
              />
              <XAxis
                dataKey='_id'
                stroke='var(--text-tertiary)'
                angle={-45}
                textAnchor='end'
                height={100}
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
              <Bar
                dataKey='count'
                fill='var(--gray-300)'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jurusan;
