import { FaUniversity, FaInfoCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface UniversityDataType {
  name: string;
  value: number;
}

interface PerguruanTinggiProps {
  data: UniversityDataType[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

const PerguruanTinggi = ({ data }: PerguruanTinggiProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = data.length > 0 && totalValue > 0;

  const displayData = hasData
    ? data
    : [
      { name: 'PTN', value: 0 },
      { name: 'PTS', value: 0 },
      { name: 'Kedinasan', value: 0 },
    ];

  const typeConfig: Record<
    string,
    { label: string; description: string; color: string; bgColor: string }
  > = {
    PTN: {
      label: 'Perguruan Tinggi Negeri',
      description:
        'Kampus milik pemerintah dengan seleksi nasional (SNBP/SNBT).',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    PTS: {
      label: 'Perguruan Tinggi Swasta',
      description:
        'Institusi pendidikan mandiri dengan beragam spesialisasi jurusan.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    Kedinasan: {
      label: 'Sekolah Kedinasan',
      description:
        'Lembaga pendidikan di bawah naungan kementerian/lembaga negara.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  };

  return (
    <div className='card h-full flex flex-col overflow-hidden group'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-lg md:text-xl flex items-center gap-3 text-text-primary font-bold !mb-0'>
          <div className='p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300'>
            <FaUniversity className='text-blue-500' />
          </div>
          <span>Jalur Studi Alumni</span>
        </h2>
        <div className='flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-border-color/50'>
          <div className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'></div>
          <span className='text-[10px] font-bold text-text-secondary uppercase tracking-wider'>
            Live Stats
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-y-auto custom-scrollbar pr-2'>
        {/* Chart Section */}
        <div className='lg:col-span-2 relative min-h-[220px]'>
          {hasData ? (
            <>
              <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10'>
                <span className='text-[9px] font-bold text-text-tertiary uppercase tracking-widest'>
                  Total
                </span>
                <span className='text-2xl font-black text-text-primary -mt-1'>
                  {totalValue}
                </span>
                <span className='text-[8px] font-bold text-text-tertiary uppercase'>
                  Alumni
                </span>
              </div>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={displayData}
                    cx='50%'
                    cy='50%'
                    innerRadius='65%'
                    outerRadius='85%'
                    paddingAngle={8}
                    dataKey='value'
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {displayData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: 0 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { name, value } = payload[0];
                        return (
                          <div className='bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-2xl border border-blue-500/30 animate-in slide-in-from-top-2 duration-300'>
                            <p className='text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-0.5'>
                              {name}
                            </p>
                            <p className='text-xs font-black text-[color:var(--primary)] text-center'>
                              {value} Alumni
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className='h-full flex flex-col items-center justify-center text-text-tertiary gap-2'>
              <FaInfoCircle className='text-2xl' />
              <p className='text-xs font-medium'>Belum ada data tersedia</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className='lg:col-span-3 space-y-4'>
          <p className='text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2 px-1'>
            Rincian Jalur & Kategori
          </p>
          <div className='space-y-3'>
            {displayData.map((item, index) => {
              const config = typeConfig[
                item.name as keyof typeof typeConfig
              ] || {
                label: item.name,
                description: 'Kategori pendidikan lainnya.',
                color: 'text-gray-500',
                bgColor: 'bg-gray-500/10',
              };
              const percentage =
                totalValue > 0
                  ? ((item.value / totalValue) * 100).toFixed(0)
                  : 0;

              return (
                <div
                  key={index}
                  className='p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-border-color/30 hover:border-blue-500/30 transition-all duration-300 group/item'
                >
                  <div className='flex items-start justify-between mb-1.5'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-2.5 h-2.5 rounded-full`}
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className='font-black text-xs text-text-primary tracking-tight'>
                        {config.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] font-black text-text-secondary'>
                        {item.value} Alumni
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md ${config.bgColor} ${config.color} text-[10px] font-black`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <p className='text-[10px] text-text-secondary leading-relaxed pl-4 line-clamp-2'>
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className='mt-8 pt-4 border-t border-border-color/50 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-[10px] text-text-tertiary italic'>
          <FaInfoCircle />
          <span>
            Data diperbarui secara real-time berdasarkan input kuesioner alumni.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerguruanTinggi;
