import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackStats from '@/components/FeedbackStats';
import FeedbackList from '@/components/FeedbackList';
import PageHeader from '@/components/common/PageHeader';
import SmartLoader from '@/components/SmartLoader';

const AlumniFeedback = () => {
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

  if (loading) return <SmartLoader />;

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in space-y-8'>
      <PageHeader
        title='Kritik & Saran'
        description='Bantu kami meningkatkan kualitas layanan dengan memberikan masukan Anda'
      />

      {/* Stats Section */}
      {stats && <FeedbackStats stats={stats} />}

      {/* Form Section */}
      <FeedbackForm role='alumni' showHeader={false} onSuccess={fetchData} />

      {/* List Section */}
      <FeedbackList feedbacks={feedbacks} />
    </div>
  );
};

export default AlumniFeedback;
