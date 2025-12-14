import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSave, FaPaperPlane } from 'react-icons/fa';
import React from 'react';

interface FeedbackState {
  kritik: string;
  saran: string;
  rating: number;
}

const StudentFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    kritik: '',
    saran: '',
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const checkFeedback = async () => {
      try {
        const response = await axios.get<{
          exists: boolean;
          feedback: FeedbackState;
        }>('/api/student/feedback/check');
        if (response.data.exists) {
          setSubmitted(true);
          setFeedback(response.data.feedback);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error('Error checking feedback:', error);
        }
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

    setLoading(true);
    try {
      if (submitted) {
        await axios.put('/api/student/feedback', feedback);
        toast.success('Kritik dan saran berhasil diperbarui!');
      } else {
        await axios.post('/api/student/feedback', feedback);
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
    const starColor = isFilled ? '#fbbf24' : '#6b7280';

    return (
      <span
        key={index}
        onClick={() => handleRatingClick(index)}
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        className='cursor-pointer text-4xl transition-all duration-200 inline-block'
        style={{ color: starColor }}
      >
        ★
      </span>
    );
  };

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Kritik & Saran</h1>
      </div>

      <div className='card'>
        <div className='mb-6'>
          <h2 className='mb-2 text-[color:var(--text-primary)]'>
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

          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='submit'
              className={`btn btn-primary ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                feedback.rating === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              disabled={loading || feedback.rating === 0}
            >
              {loading ? (
                <>
                  <span>⏳</span>
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

export default StudentFeedback;
