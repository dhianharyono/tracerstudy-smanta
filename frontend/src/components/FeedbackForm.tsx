import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaSave,
  FaPaperPlane,
  FaStar,
  FaSpinner,
  FaCommentDots,
  FaInfoCircle,
} from 'react-icons/fa';
import SmartLoader from './SmartLoader';

interface FeedbackState {
  kritik: string;
  saran: string;
  rating: number;
}

interface FeedbackResponse {
  exists: boolean;
  feedback: FeedbackState;
}

interface FeedbackFormProps {
  role: 'alumni' | 'student' | 'school';
  showHeader?: boolean;
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ role, showHeader = true, onSuccess }) => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    kritik: '',
    saran: '',
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const checkFeedback = async () => {
      try {
        const response = await axios.get<FeedbackResponse>(
          `/api/${role}/feedback/check`,
        );
        if (response.data.exists) {
          setSubmitted(true);
          setFeedback(response.data.feedback);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error('Error checking feedback:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    checkFeedback();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (feedback.rating === 0) {
      Toast('Silakan berikan rating dengan menekan bintang', 'error');
      return;
    }

    if (!feedback.kritik && !feedback.saran) {
      Toast('Silakan isi kritik atau saran', 'error');
      return;
    }

    setLoadingSubmit(true);
    try {
      if (submitted) {
        await axios.put(`/api/${role}/feedback`, feedback);
        Toast('Kritik dan saran berhasil diperbarui!', 'success');
        if (onSuccess) onSuccess();
      } else {
        await axios.post(`/api/${role}/feedback`, feedback);
        Toast('Terima kasih atas kritik dan saran Anda!', 'success');
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      let errorMessage = 'Gagal mengirim kritik dan saran';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage =
          (error.response.data as { message?: string })?.message ||
          errorMessage;
      }
      Toast(errorMessage, 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFeedback({ ...feedback, rating });
  };

  const renderStar = (index: number) => {
    const isFilled = index <= (hoveredRating || feedback.rating);
    const colorClass = isFilled
      ? 'text-yellow-400'
      : 'text-gray-300 dark:text-gray-600';

    return (
      <button
        key={index}
        type='button'
        onClick={() => handleRatingClick(index)}
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`focus:outline-none transition-transform duration-200 hover:scale-110 p-1`}
        title={`Rate ${index} stars`}
      >
        <FaStar
          className={`text-3xl md:text-4xl transition-colors duration-200 ${colorClass}`}
        />
      </button>
    );
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='animate-fade-in'>
      {showHeader && (
        <div className='mb-8 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Kritik & Saran
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Masukan Anda sangat berarti bagi kami
          </p>
        </div>
      )}

      <div className='rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 md:p-8 shadow-lg'>
        <div className='mb-6 flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100'>
            <FaCommentDots className='text-lg md:text-xl' />
          </div>
          <h2 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)] !mb-0'>
            Formulir Masukan
          </h2>
        </div>

        {/* Info & Bug Report Notice Box */}
        <div className='mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs md:text-sm text-blue-700'>
          <FaInfoCircle className='mt-0.5 text-base shrink-0 text-blue-600' />
          <div className='space-y-1.5 text-left'>
            <p className='font-semibold !text-blue-900'>
              Informasi Pengelolaan & Laporan Kendala
            </p>
            <p className='leading-relaxed text-[11px] md:text-xs !text-blue-700'>
              Setiap kritik dan saran dikelola dan ditinjau langsung oleh Admin demi peningkatan layanan website secara berkala. <br /><br /> Apabila Anda mengalami kendala teknis atau menemukan bug selama menggunakan website ini, silakan sampaikan keluhan Anda secara mendetail melalui formulir ini.
            </p>
          </div>
        </div>

        <div className='mb-8 text-center'>
          <h3 className='mb-2 text-xs md:text-sm font-semibold text-[color:var(--text-primary)]'>
            Seberapa puas Anda dengan aplikasi ini?
          </h3>
          <p className='text-[10px] md:text-xs text-[color:var(--text-secondary)] mb-6'>
            Klik bintang untuk memberikan rating (1-5)
          </p>

          <div className='flex items-center justify-center gap-2 mb-4'>
            {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
          </div>

          {feedback.rating > 0 && (
            <div className='inline-block rounded-full bg-blue-50 text-blue-750 border border-blue-200/50 px-4 py-1 text-xs md:text-sm font-semibold'>
              Anda memberikan rating {feedback.rating}/5
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='form-group'>
            <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
              Kritik
            </label>
            <textarea
              name='kritik'
              value={feedback.kritik}
              onChange={(e) =>
                setFeedback({ ...feedback, kritik: e.target.value })
              }
              rows={4}
              className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] px-4 py-3 text-[color:var(--text-primary)] transition-all placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none'
              placeholder='Apa yang kurang dari aplikasi ini? Silakan tulis keluhan Anda...'
            />
          </div>

          <div className='form-group'>
            <label className='block text-sm font-semibold text-[color:var(--text-secondary)] mb-2'>
              Saran
            </label>
            <textarea
              name='saran'
              value={feedback.saran}
              onChange={(e) =>
                setFeedback({ ...feedback, saran: e.target.value })
              }
              rows={4}
              className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] px-4 py-3 text-[color:var(--text-primary)] transition-all placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none'
              placeholder='Apa yang bisa kami tingkatkan? Silakan tulis saran Anda...'
            />
          </div>

          <div className='flex justify-end pt-4'>
            <button
              type='submit'
              className={`flex w-full md:w-fit items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-500 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] ${loadingSubmit || feedback.rating === 0
                ? 'cursor-not-allowed opacity-70 grayscale'
                : ''
                }`}
              disabled={loadingSubmit || feedback.rating === 0}
            >
              {loadingSubmit ? (
                <>
                  <FaSpinner className='animate-spin' />
                  <span>Mengirim...</span>
                </>
              ) : submitted ? (
                <>
                  <FaSave />
                  <span>Perbarui Masukan</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Kirim Masukan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
