import {
  FaUsers,
  FaGraduationCap,
  FaBriefcase,
  FaExclamationCircle,
  FaCalendarAlt,
} from 'react-icons/fa';

interface YearStat {
  _id: string;
  count: number;
}

interface AlumniDataProgressProps {
  stats: {
    totalAlumni: number;
    workingAlumni: number;
    studyingAlumni: number;
    completedCount: number;
    incompleteCount: number;
    totalStudents: number;
    studentYearStats?: YearStat[];
  };
}

const AlumniDataProgress = ({ stats }: AlumniDataProgressProps) => {
  const {
    totalAlumni,
    workingAlumni,
    studyingAlumni,
    incompleteCount,
    totalStudents,
    studentYearStats = [],
  } = stats || {
    totalAlumni: 0,
    workingAlumni: 0,
    studyingAlumni: 0,
    incompleteCount: 0,
    totalStudents: 0,
    studentYearStats: [],
  };

  const alumniItems = [
    {
      label: 'Alumni Sedang Kuliah',
      value: studyingAlumni,
      icon: <FaGraduationCap className='text-purple-500' />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
      percentage: totalAlumni > 0 ? (studyingAlumni / totalAlumni) * 100 : 0,
    },
    {
      label: 'Alumni Sudah Bekerja',
      value: workingAlumni,
      icon: <FaBriefcase className='text-green-500' />,
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      percentage: totalAlumni > 0 ? (workingAlumni / totalAlumni) * 100 : 0,
    },
    {
      label: 'Alumni Belum Lengkap',
      value: incompleteCount,
      icon: <FaExclamationCircle className='text-amber-500' />,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
      percentage: totalAlumni > 0 ? (incompleteCount / totalAlumni) * 100 : 0,
    },
  ];

  // Sort students by year
  const sortedStudentYears = [...studentYearStats].sort(
    (a, b) => parseInt(a._id) - parseInt(b._id),
  );

  return (
    <div className='card h-full flex flex-col'>
      <h2 className='text-lg md:text-xl mb-6 flex items-center gap-3 text-text-primary font-bold'>
        <div className='p-2 bg-blue-500/10 rounded-lg'>
          <FaUsers className='text-blue-500' />
        </div>
        <span>Progress Kelengkapan Data</span>
      </h2>

      <div className='flex-grow space-y-8 overflow-y-auto pr-2 custom-scrollbar'>
        {/* Section Alumni */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-[10px] items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-black uppercase tracking-widest'>
              Alumni
            </span>
            <div className='h-[1px] flex-grow bg-border-color/50'></div>
          </div>
          <div className='space-y-4'>
            {alumniItems.map((item, index) => (
              <div key={index} className='space-y-1.5'>
                <div className='flex justify-between items-center text-xs'>
                  <div className='flex items-center gap-2 font-bold text-text-secondary'>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className='font-black text-text-primary'>
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`w-full h-1.5 ${item.bgColor} rounded-full overflow-hidden`}
                >
                  <div
                    className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Siswa (Years Only) */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-[10px] items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-black uppercase tracking-widest'>
              Siswa (Per Angkatan)
            </span>
            <div className='h-[1px] flex-grow bg-border-color/50'></div>
          </div>
          <div className='space-y-3'>
            {sortedStudentYears.length === 0 ? (
              <p className='text-xs text-center text-text-tertiary py-2 italic whitespace-normal'>
                Belum ada data angkatan siswa
              </p>
            ) : (
              sortedStudentYears.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center'>
                      <FaCalendarAlt className='text-indigo-500 text-xs' />
                    </div>
                    <div>
                      <p className='text-[10px] text-text-tertiary font-bold uppercase leading-none mb-1'>
                        Angkatan
                      </p>
                      <p className='text-sm font-black text-text-primary leading-none'>
                        {item._id}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] text-text-tertiary font-bold uppercase leading-none mb-1'>
                      Jumlah
                    </p>
                    <p className='text-base font-black text-indigo-500 leading-none'>
                      {item.count}{' '}
                      <span className='text-[10px] font-bold text-text-tertiary'>
                        Siswa
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className='mt-8 pt-4 border-t border-[color:var(--border-color)] grid grid-cols-2 gap-4'>
        <div>
          <p className='text-[9px] font-bold text-text-tertiary uppercase tracking-tighter'>
            Total Alumni
          </p>
          <p className='text-base font-black text-blue-500'>
            {totalAlumni.toLocaleString()}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-[9px] font-bold text-text-tertiary uppercase tracking-tighter'>
            Total Siswa
          </p>
          <p className='text-base font-black text-indigo-500'>
            {totalStudents.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlumniDataProgress;
