import { FaChartBar } from 'react-icons/fa';
import {
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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
  title?: string;
}

const Jurusan = ({ data, title = 'Statistik Jurusan Alumni' }: JurusanProps) => {
  const majorStats = data?.majorStats || [];
  const hasData = majorStats.length > 0;

  const chartHeight = Math.max(400, majorStats.length * 40);

  return (
    <div className='card h-full flex flex-col'>
      <h2 className='text-lg md:text-xl mb-6 flex items-center gap-3 text-text-primary font-bold'>
        <FaChartBar className='text-blue-500' />
        <span>{title}</span>
      </h2>
      {!hasData ? (
        <div className='flex-grow flex items-center justify-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
      ) : (
        <div className='flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar-thin pr-2' style={{ height: '400px' }}>
          <ResponsiveContainer width='100%' height={chartHeight}>
            <BarChart
              layout='vertical'
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
                allowDecimals={false}
                tickFormatter={(value) => Math.round(value).toString()}
              />
              <YAxis
                dataKey='_id'
                type='category'
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                width={120}
                tickFormatter={(value) => {
                  return value.length > 20
                    ? `${value.substring(0, 18)}...`
                    : value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Bar
                dataKey='count'
                fill='#6366f1'
                radius={[0, 8, 8, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Jurusan;
