import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaArrowLeft, FaUserCircle, FaStar, FaQuoteLeft } from 'react-icons/fa';

const AdminFeedbackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFeedbackDetail();
    }
  }, [id]);

  const fetchFeedbackDetail = async () => {
    try {
      const response = await axios.get(`/api/admin/feedback/${id}`);
      setFeedback(response.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Gagal memuat detail feedback'
      );
      navigate('/admin/feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((index) => (
          <FaStar
            key={index}
            className={`text-lg ${index <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        ))}
        <span className='ml-2 text-sm font-semibold text-[color:var(--text-primary)]'>
          {rating}.0
        </span>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!feedback) {
    return (
      <div className='p-4 sm:p-6 lg:p-8 '>
        <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-8 text-center'>
          <p className='text-lg text-[color:var(--text-secondary)] mb-4'>Feedback tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin/feedback')}
            className='inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-dark)]'
          >
            Kembali ke Kritik & Saran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 flex items-center justify-between'>
        <button
          onClick={() => navigate('/admin/feedback')}
          className='flex items-center gap-2 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors'
        >
          <FaArrowLeft /> Kembali
        </button>
      </div>

      <div className='mx-auto max-w-3xl overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-lg'>
        {/* Header with User Info */}
        <div className='border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/30 p-6 md:p-8'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] border-2 border-[color:var(--border-color)]'>
                <FaUserCircle size={40} />
              </div>
              <div>
                <h1 className='text-xl font-bold text-[color:var(--text-primary)]'>{feedback.user?.username || 'Anonymous'}</h1>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='inline-flex items-center rounded-md bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)] capitalize'>
                    {feedback.user?.role || 'User'}
                  </span>
                  <span className='text-xs text-[color:var(--text-secondary)]'>•</span>
                  <span className='text-xs text-[color:var(--text-secondary)]'>
                    {new Date(feedback.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col items-start md:items-end bg-[color:var(--bg-card)] p-3 rounded-lg border border-[color:var(--border-color)]'>
              <span className='text-xs text-[color:var(--text-secondary)] uppercase tracking-wider font-semibold mb-1'>Rating Diberikan</span>
              {renderStarRating(feedback.rating)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 md:p-8 space-y-8'>
          {/* Kritik Section */}
          <div className='relative'>
            <FaQuoteLeft className='absolute -top-3 -left-2 text-4xl text-[color:var(--bg-tertiary)] opacity-50' />
            <h3 className='relative z-10 text-lg font-semibold text-red-500 mb-3 ml-2'>Kritik & Masuhan</h3>
            <div className='relative z-10 rounded-xl bg-red-50 dark:bg-red-900/10 p-5 text-[color:var(--text-primary)] border border-red-100 dark:border-red-900/30'>
              <p className='whitespace-pre-wrap leading-relaxed'>{feedback.kritik || 'Tidak ada kritik yang disampaikan.'}</p>
            </div>
          </div>

          {/* Saran Section */}
          <div className='relative'>
            <h3 className='relative z-10 text-lg font-semibold text-green-500 mb-3 ml-2'>Saran Perbaikan</h3>
            <div className='relative z-10 rounded-xl bg-green-50 dark:bg-green-900/10 p-5 text-[color:var(--text-primary)] border border-green-100 dark:border-green-900/30'>
              <p className='whitespace-pre-wrap leading-relaxed'>{feedback.saran || 'Tidak ada saran yang disampaikan.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackDetail;
