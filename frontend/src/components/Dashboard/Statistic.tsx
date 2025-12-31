import {
  FaUsers,
  FaBriefcase,
  FaGraduationCap,
  FaUniversity,
  FaUserGraduate,
  FaCrown,
  FaUserTimes,
} from 'react-icons/fa';

interface StatsObject {
  totalAlumni: number | string;
  totalStudents?: number | string;
  workingAlumni: number | string;
  studyingAlumni: number | string;
  totalMentors?: number | string;
  activeMentors?: number | string;
  completedQuestionnaire?: number | string; // Added from backend
  universityTypes: {
    negeri: number | string;
    swasta: number | string;
    kedinasan: number | string;
  };
}

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: any;
  colorClass: string;
  bgClass: string;
}

// StatCard component with Icon support
const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: StatCardProps) => (
  <div className='group relative overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 transition-all hover:shadow-lg hover:translate-y-[-2px]'>
    <div
      className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgClass} opacity-20 transition-transform group-hover:scale-110`}
    />

    <div className='relative z-10 flex items-start justify-between'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1'>
          {title}
        </p>
        <h3 className='text-3xl font-bold text-[color:var(--text-primary)]'>
          {value || 0}
        </h3>
      </div>
      <div
        className={`hidden md:flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}
      >
        <Icon className='text-xl' />
      </div>
    </div>
  </div>
);

const Statistic = ({ stats }: { stats: StatsObject }) => {
  const isAdmin = stats?.totalStudents !== undefined;

  // Calculate incomplete alumni
  const totalAlumni = Number(stats?.totalAlumni || 0);
  const completed = Number(stats?.completedQuestionnaire || 0);
  const incompleteAlumni = Math.max(0, totalAlumni - completed);

  const statItems = [
    {
      title: 'Total Alumni',
      value: stats?.totalAlumni,
      icon: FaUsers,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/50',
    },
    ...(isAdmin
      ? [
          {
            title: 'Total Siswa',
            value: stats?.totalStudents,
            icon: FaUserGraduate,
            colorClass: 'text-cyan-600 dark:text-cyan-400',
            bgClass: 'bg-cyan-100 dark:bg-cyan-900/50',
          },
        ]
      : []),
    {
      title: isAdmin ? 'Total Mentor' : 'Mentor Aktif',
      value: isAdmin ? stats?.totalMentors : stats?.activeMentors,
      icon: FaCrown,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/50',
    },
    ...(isAdmin
      ? [
          {
            title: 'Belum Melengkapi',
            value: incompleteAlumni,
            icon: FaUserTimes,
            colorClass: 'text-red-600 dark:text-red-400',
            bgClass: 'bg-red-100 dark:bg-red-900/50',
          },
        ]
      : []),
    {
      title: 'Alumni Bekerja',
      value: stats?.workingAlumni,
      icon: FaBriefcase,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-100 dark:bg-amber-900/50',
    },
    {
      title: 'Alumni Kuliah',
      value: stats?.studyingAlumni,
      icon: FaGraduationCap,
      colorClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      title: 'PTN',
      value: stats?.universityTypes?.negeri,
      icon: FaUniversity,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-100 dark:bg-purple-900/50',
    },
    {
      title: 'PTS',
      value: stats?.universityTypes?.swasta,
      icon: FaUniversity,
      colorClass: 'text-pink-600 dark:text-pink-400',
      bgClass: 'bg-pink-100 dark:bg-pink-900/50',
    },
    {
      title: 'Kedinasan',
      value: stats?.universityTypes?.kedinasan,
      icon: FaUniversity,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/50',
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 ${
        isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      } gap-4 mb-8`}
    >
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
};

export default Statistic;
