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
  return (
    <>
      {data?.yearStats && data?.yearStats.length > 0 && (
        <div className='mb-6 md:mb-8 card max-w-sm md:max-w-md lg:max-w-full'>
          <h2
            className='mb-6'
            style={{
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
            }}
          >
            <FaChartLine />
            <span>Statistik Berdasarkan Tahun Lulus</span>
          </h2>
          <div className='chart-container'>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                overflowX: 'auto',
              }}
            >
              <LineChart
                width={Math.min(500, chartWidth)}
                height={400}
                data={data?.yearStats}
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
                  stroke='#2563eb'
                  strokeWidth={2}
                />
              </LineChart>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TahunLulus;
