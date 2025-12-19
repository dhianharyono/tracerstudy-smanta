import { COLORS } from '@/pages/constant';
import { FaUniversity } from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UniversityDataType {
  name: string;
  value: number;
}

interface PerguruanTinggiProps {
  data: UniversityDataType[];
}

const GRAY_COLOR = '#A0AEC0';

const PerguruanTinggi = ({ data }: PerguruanTinggiProps) => {
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
          }}
        >
          <FaUniversity />
          <span>Daftar Perguruan Tinggi</span>
        </h2>
        <div className='h-[350px] content-center'>
          <p className='text-center text-gray-500 py-10'>No data available</p>
        </div>
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

  const chartHeight = 350;

  return (
    <div className='card max-w-sm md:max-w-md lg:max-w-full h-full'>
      <h2
        className='text-lg md:text-xl'
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <FaUniversity />
        <span>Daftar Perguruan Tinggi</span>
      </h2>
      <div className='chart-container w-full'>
        <div className='w-full h-full'>
          <ResponsiveContainer width='100%' height={chartHeight}>
            <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <Pie
                data={displayData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={renderLabel}
                outerRadius='70%'
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
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  color: 'var(--text-primary)',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerguruanTinggi;
