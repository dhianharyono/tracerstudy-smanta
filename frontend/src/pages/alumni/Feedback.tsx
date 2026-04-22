import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackStats from '@/components/FeedbackStats';
import FeedbackList from '@/components/FeedbackList';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import SmartLoader from '@/components/SmartLoader';
import { isUniversityIncomplete } from '@/utils/validation';

const AlumniFeedback = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        axios.get('/api/alumni/feedback/stats'),
        axios.get('/api/alumni/feedback/list'),
      ]);
      setStats(statsRes.data);
      setFeedbacks(listRes.data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasUniversityData = !!(user?.university?.name);
  if (user?.questionnaireCompleted === false && !hasUniversityData) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  if (loading) return <SmartLoader />;

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Kritik & Saran'
        description='Bantu kami meningkatkan kualitas layanan dengan memberikan masukan Anda'
      />

      {/* Stats Section */}
      {stats && <FeedbackStats stats={stats} />}

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Form Section - Sticky on Desktop */}
        <div className='lg:col-span-1'>
          <div className='lg:sticky lg:top-8'>
            <FeedbackForm role='alumni' showHeader={false} onSuccess={fetchData} />
          </div>
        </div>

        {/* List Section */}
        <div className='lg:col-span-2'>
          <FeedbackList feedbacks={feedbacks} />
        </div>
      </div>
    </div>
  );
};

export default AlumniFeedback;
