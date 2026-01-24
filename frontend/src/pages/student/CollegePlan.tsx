import { useEffect, useState } from 'react';
import SmartLoader from '@/components/SmartLoader';
import PlanForm from '@/components/college-plan/PlanForm';
import PlanStats from '@/components/college-plan/PlanStats';
import PlanList from '@/components/college-plan/PlanList';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';

const CollegePlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <SmartLoader
        messages={['Menyiapkan data rencana...', 'Mengambil statistik...']}
      />
    );
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in'>
      <div className='text-center md:text-left mb-8'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Rencana Angkatan & Studi Lanjut
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Kelola rencana kuliahmu dan lihat statistik angkatan.
        </p>
      </div>

      <div className='space-y-8 animate-fade-in'>
        <PlanForm onUpdate={() => window.location.reload()} />
        <PlanStats />
        <PlanList />
      </div>
    </div>
  );
};

export default CollegePlan;
