import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSave, FaPaperPlane, FaStar, FaSpinner } from 'react-icons/fa';
import React from 'react';

interface FeedbackState {
  kritik: string;
  saran: string;
  rating: number;
}

interface FeedbackResponse {
  exists: boolean;
  feedback: FeedbackState;
}

const AlumniFeedback = () => {
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
          '/api/alumni/feedback/check'
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (feedback.rating === 0) {
      toast.error('Silakan berikan rating dengan menekan bintang');
      return;
    }

    if (!feedback.kritik && !feedback.saran) {
      toast.error('Silakan isi kritik atau saran');
      return;
    }

    setLoadingSubmit(true);
    try {
      if (submitted) {
        await axios.put('/api/alumni/feedback', feedback);
        toast.success('Kritik dan saran berhasil diperbarui!');
      } else {
        await axios.post('/api/alumni/feedback', feedback);
        toast.success('Terima kasih atas kritik dan saran Anda!');
        setSubmitted(true);
      }
    } catch (error) {
      let errorMessage = 'Gagal mengirim kritik dan saran';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage =
          (error.response.data as { message?: string })?.message ||
          errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFeedback({ ...feedback, rating });
  };

  const renderStar = (index: number) => {
    const isFilled = index <= (hoveredRating || feedback.rating);
    const colorClass = isFilled ? 'text-yellow-400' : 'text-gray-400';

    return (
      <FaStar
        key={index}
        onClick={() => handleRatingClick(index)}
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`cursor-pointer text-xl md:text-2xl lg:text-3xl transition-all duration-200 ${colorClass}`}
      />
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Kritik & Saran</h1>
      </div>

      <div className='card'>
        <div className='mb-6'>
          <h2 className='mb-2 text-lg md:text-xl text-[color:var(--text-primary)]'>
            Berikan Rating untuk Website
          </h2>
          <p className='text-sm text-[color:var(--text-secondary)]'>
            Klik bintang untuk memberikan rating (1-5 bintang)
          </p>
        </div>

        <div className='mb-8 flex items-center justify-center gap-2 rounded-xl bg-[color:var(--bg-tertiary)] p-6'>
          {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
        </div>

        {feedback.rating > 0 && (
          <div className='mb-6 rounded-lg border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-3 text-center'>
            <span className='font-semibold text-[color:var(--text-primary)]'>
              Rating: {feedback.rating} / 5 ⭐
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Kritik</label>
            <textarea
              name='kritik'
              value={feedback.kritik}
              onChange={(e) =>
                setFeedback({ ...feedback, kritik: e.target.value })
              }
              rows={6}
              placeholder='Tuliskan kritik Anda di sini...'
            />
          </div>

          <div className='form-group'>
            <label>Saran</label>
            <textarea
              name='saran'
              value={feedback.saran}
              onChange={(e) =>
                setFeedback({ ...feedback, saran: e.target.value })
              }
              rows={6}
              placeholder='Tuliskan saran Anda di sini...'
            />
          </div>

          <div className='mt-6 flex justify-end'>
            <button
              type='submit'
              className={`btn btn-primary flex items-center gap-2 ${
                feedback.rating === 0
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer opacity-100'
              }`}
              disabled={loadingSubmit || feedback.rating === 0}
            >
              {loadingSubmit ? (
                <>
                  <span>Mengirim...</span>
                </>
              ) : submitted ? (
                <>
                  <FaSave />
                  <span>Perbarui Kritik & Saran</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Kirim Kritik & Saran</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlumniFeedback;
