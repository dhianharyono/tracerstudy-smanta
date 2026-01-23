import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaUniversity, FaSearch } from 'react-icons/fa';

interface Plan {
  _id: string;
  targetUniversity: string;
  targetMajor: string;
  entryPath: string;
  readinessStatus: string;
  user: {
    username: string;
    profile?: {
      fullName?: string;
    };
  };
  isAnonymous: boolean;
}

const PlanList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    university: '',
    major: '',
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPlans();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.university) params.university = filters.university;
      if (filters.major) params.major = filters.major;

      const res = await axios.get('/api/student/college-plans/list', {
        params,
      });
      setPlans(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-end md:items-center gap-4'>
        <div className='text-sm md:text-lg font-bold text-[var(--text-primary)]'>
          Jelajahi Rencana Kuliah Angkatan
        </div>
        <div className='flex gap-2 w-full md:w-auto'>
          <div className='relative flex-1 md:w-48'>
            <input
              type='text'
              placeholder='Cari Universitas...'
              value={filters.university}
              onChange={(e) =>
                setFilters({ ...filters, university: e.target.value })
              }
              className='w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none'
            />
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs' />
          </div>
          <div className='relative flex-1 md:w-48'>
            <input
              type='text'
              placeholder='Cari Jurusan...'
              value={filters.major}
              onChange={(e) =>
                setFilters({ ...filters, major: e.target.value })
              }
              className='w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none'
            />
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs' />
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center p-12'>
          <div className='h-8 w-8 border-4 border-[color:var(--border-color)] border-t-[var(--primary)] rounded-full animate-spin' />
        </div>
      ) : plans.length === 0 ? (
        <div className='text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
          <p className='text-gray-500 text-sm'>
            Belum ada data rencana kuliah.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {plans.map((plan) => (
            <div
              key={plan._id}
              className='p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--primary)] transition-all group'
            >
              <div className='mb-2 flex justify-between items-center text-[10px] text-[var(--text-tertiary)] uppercase font-bold float-right'>
                {plan.isAnonymous && (
                  <span className='text-gray-400 italic'>Anonim</span>
                )}
              </div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm'>
                  {(plan.user.profile?.fullName || plan.user.username || '?')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className='min-w-0'>
                  <h4 className='font-bold text-[var(--text-primary)] text-sm truncate'>
                    {plan.user.profile?.fullName || plan.user.username}
                  </h4>
                  <p className='text-xs text-[var(--text-secondary)]'>
                    {plan.readinessStatus}
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                  <FaUniversity className='text-[var(--primary)]' />
                  <span
                    className='font-medium text-[var(--text-primary)] truncate'
                    title={plan.targetUniversity}
                  >
                    {plan.targetUniversity}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                  <FaUserGraduate className='text-orange-500' />
                  <span
                    className='font-medium text-[var(--text-primary)] truncate'
                    title={plan.targetMajor}
                  >
                    {plan.targetMajor}
                  </span>
                </div>
                <div className='mt-2 pt-2 border-t border-[var(--border-color)] flex justify-between items-center text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider'>
                  <span>{plan.entryPath}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanList;
