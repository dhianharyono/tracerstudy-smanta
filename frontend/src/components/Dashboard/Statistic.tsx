import { useAuth } from '@/contexts/AuthContext';
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
  completedStudentsCount?: number | string;
  incompleteStudentsCount?: number | string;
  workingAlumni: number | string;
  studyingAlumni: number | string;
  totalMentors?: number | string;
  activeMentors?: number | string;
  completedQuestionnaire?: number | string;
  completedCount?: number | string;
  incompleteCount?: number | string;
  universityTypes: {
    negeri: number | string;
    swasta: number | string;
    kedinasan: number | string;
  };
  onlineUsers?: number;
  onlineUsersDetail?: {
    alumni: number;
    student: number;
    school: number;
  };
}

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: any;
  colorClass: string;
  bgClass: string;
  description?: React.ReactNode;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  description,
}: StatCardProps) => (
  <div className='group relative overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 transition-all hover:shadow-lg hover:translate-y-[-2px]'>
    {/* Soft decorative background shape */}
    <div
      className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgClass} opacity-40 transition-transform group-hover:scale-110`}
    />

    <div className='relative z-10 flex items-start justify-between'>
      <div>
        <p className='text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1.5'>
          {title}
        </p>
        <h3 className='text-3xl font-bold text-[color:var(--text-primary)] tracking-tight'>
          {value !== undefined ? value : 0}
        </h3>
        {description && <div className='mt-2.5'>{description}</div>}
      </div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-current/20 ${bgClass} ${colorClass} shrink-0`}
      >
        <Icon className='text-lg' />
      </div>
    </div>
  </div>
);

const Statistic = ({ stats }: { stats: StatsObject }) => {
  const { user } = useAuth();
  const isAlumni = user?.role === 'alumni';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const totalAlumni = Number(stats?.totalAlumni || 0);
  const completed = Number(stats?.completedQuestionnaire || 0);
  const incompleteAlumni =
    stats?.incompleteCount !== undefined
      ? Number(stats.incompleteCount)
      : Math.max(0, totalAlumni - completed);

  if (isAdmin) {
    const mainStats = [
      {
        title: 'Total Alumni',
        value: stats?.totalAlumni,
        icon: FaUsers,
        colorClass: 'text-[var(--primary)]',
        bgClass: 'bg-[var(--primary)]/10',
      },
      {
        title: 'Total Siswa',
        value: stats?.totalStudents,
        icon: FaUserGraduate,
        colorClass: 'text-indigo-500',
        bgClass: 'bg-indigo-500/10',
      },
      {
        title: 'Online Users',
        value: stats?.onlineUsers || 0,
        icon: FaUserTimes,
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10',
        description: stats?.onlineUsersDetail ? (
          <p className='text-[10px] text-[color:var(--text-secondary)] font-bold'>
            {stats.onlineUsersDetail.student} Siswa,{' '}
            {stats.onlineUsersDetail.alumni} Alumni,{' '}
            {stats.onlineUsersDetail.school} Sekolah
          </p>
        ) : undefined,
      },
    ];

    const incompleteStats = [
      {
        title: 'Data Alumni Belum Lengkap',
        value: incompleteAlumni,
        icon: FaUserTimes,
        colorClass: 'text-red-500',
        bgClass: 'bg-red-500/10',
      },
      {
        title: 'Data Siswa Belum Lengkap',
        value: stats?.incompleteStudentsCount,
        icon: FaUserTimes,
        colorClass: 'text-rose-500',
        bgClass: 'bg-rose-500/10',
      },
    ];

    const alumniDetails = [
      {
        title: 'Alumni Bekerja',
        value: stats?.workingAlumni,
        icon: FaBriefcase,
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-500/10',
      },
      {
        title: 'Alumni Kuliah',
        value: stats?.studyingAlumni,
        icon: FaGraduationCap,
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10',
      },
      {
        title: 'PTN',
        value: stats?.universityTypes?.negeri,
        icon: FaUniversity,
        colorClass: 'text-violet-500',
        bgClass: 'bg-violet-500/10',
      },
      {
        title: 'PTS',
        value: stats?.universityTypes?.swasta,
        icon: FaUniversity,
        colorClass: 'text-pink-500',
        bgClass: 'bg-pink-500/10',
      },
      {
        title: 'Kedinasan',
        value: stats?.universityTypes?.kedinasan,
        icon: FaUniversity,
        colorClass: 'text-indigo-500',
        bgClass: 'bg-indigo-500/10',
      },
    ];

    return (
      <div className='space-y-6 mb-8'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {mainStats.map((item, index) => (
            <StatCard key={index} {...item} />
          ))}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {incompleteStats.map((item, index) => (
            <StatCard key={index} {...item} />
          ))}
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {alumniDetails.map((item, index) => (
            <StatCard key={index} {...item} />
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      title: 'Total Alumni',
      value: stats?.totalAlumni,
      icon: FaUsers,
      colorClass: 'text-[var(--primary)]',
      bgClass: 'bg-[var(--primary)]/10',
    },
    ...(isAlumni
      ? [
          {
            title: 'Total Siswa',
            value: stats?.totalStudents,
            icon: FaUserGraduate,
            colorClass: 'text-indigo-500',
            bgClass: 'bg-indigo-500/10',
          },
        ]
      : []),
    ...(isAlumni
      ? [
          {
            title: 'Mentor Aktif',
            value: stats?.activeMentors,
            icon: FaCrown,
            colorClass: 'text-amber-500',
            bgClass: 'bg-amber-500/10',
          },
        ]
      : []),
    {
      title: 'Alumni Bekerja',
      value: stats?.workingAlumni,
      icon: FaBriefcase,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
    },
    {
      title: 'Alumni Kuliah',
      value: stats?.studyingAlumni,
      icon: FaGraduationCap,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
    },
    {
      title: 'PTN',
      value: stats?.universityTypes?.negeri,
      icon: FaUniversity,
      colorClass: 'text-violet-500',
      bgClass: 'bg-violet-500/10',
    },
    {
      title: 'PTS',
      value: stats?.universityTypes?.swasta,
      icon: FaUniversity,
      colorClass: 'text-pink-500',
      bgClass: 'bg-pink-500/10',
    },
    {
      title: 'Kedinasan',
      value: stats?.universityTypes?.kedinasan,
      icon: FaUniversity,
      colorClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 ${
        isStudent ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      } gap-4 mb-8`}
    >
      {statItems.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
};

export default Statistic;
