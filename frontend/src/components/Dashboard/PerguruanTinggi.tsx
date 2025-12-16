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

const GRAY_COLOR = '#A0AEC0';

const PerguruanTinggi = ({ data, chartWidth }: PerguruanTinggiProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const isAllZero = data.length > 0 && totalValue === 0;

  let displayData = data;
  let displayColors = data.map((_, index) => COLORS[index % COLORS.length]);
  let isDisplayingZeroChart = false;

  if (data.length === 0) {
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
        <p
          style={{
            textAlign: 'center',
            color: 'var(--gray-500)',
            padding: '40px',
          }}
        >
          No data available
        </p>
      </div>
    );
  }

  if (isAllZero) {
    displayData = [{ name: 'Semua Data Nol', value: 1 }];
    displayColors = [GRAY_COLOR];
    isDisplayingZeroChart = true;
  }

  const renderLabel = ({
    name,
    percent,
  }: {
    name: string;
    percent: number;
  }) => {
    if (isDisplayingZeroChart) {
      return name;
    }
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  const smallChartWidth = Math.min(300, chartWidth);
  const chartHeight = 350;

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
      <div className='chart-container'>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <PieChart width={smallChartWidth} height={chartHeight}>
            <Pie
              data={displayData}
              cx={smallChartWidth / 2}
              cy={chartHeight / 2}
              labelLine={false}
              label={renderLabel}
              outerRadius={smallChartWidth / 4}
              fill='#8884d8'
              dataKey='value'
            >
              {displayData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={displayColors[index % displayColors.length]}
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
    </div>
  );
};

export default PerguruanTinggi;
