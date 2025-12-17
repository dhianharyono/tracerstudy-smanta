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

  const responsiveChartWidth = Math.min(400, chartWidth);
  const chartHeight = Math.max(400, majorStats.length * 40);

  return (
    <div className='mb-6 md:mb-8 card max-w-sm md:max-w-md lg:max-w-full'>
      <h2 className='text-lg md:text-xl mb-6 flex items-center gap-3 text-text-primary'>
        <FaChartBar />
        <span>Statistik Jurusan</span>
      </h2>
      {!hasData ? (
        <div className='h-[350px] content-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
      ) : (
        <div className='chart-container'>
          <div className='w-full flex justify-center'>
            <BarChart
              layout='vertical'
              width={responsiveChartWidth}
              height={chartHeight}
              data={majorStats}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(148, 163, 184, 0.2)'
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type='number'
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis
                dataKey='_id'
                type='category'
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                width={100}
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
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jurusan;
