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
  return (
    <>
      {data?.majorStats && data?.majorStats.length > 0 && (
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
            <FaChartBar />
            <span>Statistik Jurusan</span>
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
              <BarChart
                width={Math.min(500, chartWidth)}
                height={400}
                data={data?.majorStats}
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
                <Bar dataKey='count' fill='#2563eb' radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Jurusan;
