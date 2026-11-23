import { useEffect, useState } from 'react';
import SmartLoader from '@/components/SmartLoader';
import SmartMatchChat from '@/components/college-plan/SmartMatchChat';

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
        messages={['Menyiapkan SMANTA AI...', 'Menghubungkan konselor...']}
      />
    );
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='w-full h-full animate-fade-in'>
      <SmartMatchChat initialRole='student' isFullScreen />
    </div>
  );
};

export default CollegePlan;
