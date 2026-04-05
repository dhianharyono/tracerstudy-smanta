import { FaUniversity } from 'react-icons/fa';
import {
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { COLORS } from '@/pages/constant';

interface UniversityStat {
  _id: string;
  count: number;
}

interface TopUniversitiesProps {
  data: UniversityStat[];
}

const TopUniversities = ({ data }: TopUniversitiesProps) => {
  const universityStats = data || [];
  const hasData = universityStats.length > 0;

  // Use a fixed height or dynamic based on data

  return (
    <div className='card h-full flex flex-col'>
      <h2 className='text-lg md:text-xl mb-6 flex items-center gap-3 text-text-primary font-bold'>
        <FaUniversity className="text-blue-500" />
        <span>Top 10 Perguruan Tinggi</span>
      </h2>
      {!hasData ? (
        <div className='flex-grow flex items-center justify-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
      ) : (
        <div className='flex-grow h-[400px] overflow-hidden'>
          <ResponsiveContainer width='100%' height="100%">
            <BarChart
              layout='vertical'
              data={universityStats}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(148, 163, 184, 0.1)'
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type='number'
                hide
              />
              <YAxis
                dataKey='_id'
                type='category'
                stroke='var(--text-tertiary)'
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                width={150}
                tickFormatter={(value) => {
                  return value.length > 20
                    ? `${value.substring(0, 20)}...`
                    : value;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  color: 'var(--text-primary)',
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Bar
                dataKey='count'
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {universityStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TopUniversities;
