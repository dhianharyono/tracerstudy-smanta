import {
  FaUserGraduate,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
} from 'react-icons/fa';

interface YearStat {
  _id: string;
  count: number;
}

interface AlumniDataProgressProps {
  stats?: {
    totalAlumni?: number;
    workingAlumni?: number;
    studyingAlumni?: number;
    completedCount?: number;
    incompleteCount?: number;
    totalStudents?: number;
    studentYearStats?: YearStat[];
  };
}

const AlumniDataProgress = ({ stats }: AlumniDataProgressProps) => {
  const { totalStudents = 0, studentYearStats = [] } = stats || {};

  // Sort students by year (ascending)
  const sortedStudentYears = [...studentYearStats].sort(
    (a, b) => parseInt(a._id) - parseInt(b._id),
  );

  // Total count calculation
  const calculatedTotal =
    totalStudents > 0
      ? totalStudents
      : studentYearStats.reduce((sum, item) => sum + item.count, 0);

  // Find maximum count in a single angkatan for relative bar width
  const maxCount =
    sortedStudentYears.length > 0
      ? Math.max(...sortedStudentYears.map((item) => item.count))
      : 1;

  // Find top batch (highest student count)
  const topAngkatan =
    sortedStudentYears.length > 0
      ? [...sortedStudentYears].sort((a, b) => b.count - a.count)[0]
      : null;

  return (
    <div className='card flex flex-col h-full lg:h-[850px]'>
      {/* Header Section */}
      <div className='flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[color:var(--border-color)]/60'>
        <h2 className='text-lg md:text-xl flex items-center gap-3 text-text-primary font-bold'>
          <div className='p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20'>
            <FaUserGraduate className='text-indigo-500 text-lg' />
          </div>
          <span>Statistik Data Siswa Per Angkatan</span>
        </h2>
        {calculatedTotal > 0 && (
          <span className='px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 flex items-center gap-1.5'>
            <FaUsers className='text-indigo-500 text-xs' />
            {calculatedTotal.toLocaleString()} Total Siswa
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className='flex-grow space-y-4 overflow-y-auto pr-1 custom-scrollbar min-h-[220px]'>
        {sortedStudentYears.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center py-10 px-4'>
            <div className='w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 text-indigo-500'>
              <FaCalendarAlt className='text-2xl' />
            </div>
            <p className='text-sm font-semibold text-text-secondary mb-1'>
              Belum ada data angkatan siswa
            </p>
            <p className='text-xs text-text-tertiary max-w-xs'>
              Data statistik angkatan dan jumlah siswa belum tersedia saat ini.
            </p>
          </div>
        ) : (
          sortedStudentYears.map((item, index) => {
            const percentageOfTotal =
              calculatedTotal > 0
                ? ((item.count / calculatedTotal) * 100).toFixed(1)
                : '0';
            const relativeWidth = Math.min(
              100,
              Math.max(8, (item.count / maxCount) * 100),
            );

            return (
              <div
                key={index}
                className='p-4 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300 shadow-sm group'
              >
                <div className='flex items-center justify-between gap-4 mb-3'>
                  {/* Left: Angkatan detail */}
                  <div className='flex items-center gap-3.5'>
                    <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 group-hover:scale-105 transition-transform duration-300 shadow-inner'>
                      <FaCalendarAlt className='text-base' />
                    </div>
                    <div>
                      <span className='text-[10px] text-text-tertiary font-extrabold uppercase tracking-widest block mb-0.5'>
                        Angkatan Siswa
                      </span>
                      <p className='text-base font-extrabold text-text-primary group-hover:text-indigo-500 transition-colors'>
                        {item._id}
                      </p>
                    </div>
                  </div>

                  {/* Right: Count and percentage */}
                  <div className='text-right'>
                    <div className='flex items-baseline justify-end gap-1.5'>
                      <span className='text-xl font-black text-indigo-500 dark:text-indigo-400'>
                        {item.count.toLocaleString()}
                      </span>
                      <span className='text-xs font-bold text-text-tertiary'>
                        Siswa
                      </span>
                    </div>
                    <span className='inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/15 mt-0.5'>
                      {percentageOfTotal}% dari total
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className='w-full h-2.5 bg-indigo-500/10 rounded-full overflow-hidden p-0.5 shadow-inner'>
                  <div
                    className='h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-sm'
                    style={{ width: `${relativeWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      {sortedStudentYears.length > 0 && (
        <div className='mt-6 pt-5 border-t border-[color:var(--border-color)] grid grid-cols-3 gap-3 text-center'>
          <div className='p-3 rounded-xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]/60'>
            <p className='text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-1'>
              Total Siswa
            </p>
            <p className='text-lg font-black text-indigo-500'>
              {calculatedTotal.toLocaleString()}
            </p>
          </div>

          <div className='p-3 rounded-xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]/60'>
            <p className='text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-1'>
              Jumlah Angkatan
            </p>
            <p className='text-lg font-black text-purple-500'>
              {sortedStudentYears.length}
            </p>
          </div>

          <div className='p-3 rounded-xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]/60'>
            <p className='text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-1'>
              Terbanyak
            </p>
            <p className='text-lg font-black text-emerald-500 flex items-center justify-center gap-1'>
              <FaChartLine className='text-xs' />
              {topAngkatan ? topAngkatan._id : '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDataProgress;
