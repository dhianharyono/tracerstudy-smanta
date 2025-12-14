import { COLORS } from '@/pages/constant';
import { FaUniversity } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface UniversityDataType {
  name: string;
  value: number;
}

interface PerguruanTinggiProps {
  data: UniversityDataType[];
  chartWidth: number;
}

const PerguruanTinggi = ({ data, chartWidth }: PerguruanTinggiProps) => {
  return (
    <div className='card max-w-sm md:max-w-md lg:max-w-full'>
      <h2
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '20px',
        }}
      >
        <FaUniversity />
        <span>Daftar Perguruan Tinggi</span>
      </h2>
      {data.length > 0 ? (
        <div className='chart-container'>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'auto',
            }}
          >
            <PieChart width={Math.min(500, chartWidth)} height={350}>
              <Pie
                data={data}
                cx={250}
                cy={175}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
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
            </PieChart>
          </div>
        </div>
      ) : (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--gray-500)',
            padding: '40px',
          }}
        >
          No data available
        </p>
      )}
    </div>
  );
};

export default PerguruanTinggi;
