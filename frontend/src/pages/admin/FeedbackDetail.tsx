import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaArrowLeft,
  FaUserCircle,
  FaStar,
  FaQuoteLeft,
  FaReply,
  FaPaperPlane,
  FaEdit,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const AdminFeedbackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);

  const handleToggleLandingPage = async () => {
    try {
      const response = await axios.put(`/api/admin/feedback/${id}/toggle-landing`);
      setFeedback(response.data);
      Toast(
        `Feedback berhasil ${!feedback.showOnLandingPage ? 'ditampilkan di' : 'disembunyikan dari'} landing page`,
        'success'
      );
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengubah visibilitas landing page',
        'error'
      );
    }
  };

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
      Toast(
        error.response?.data?.message || 'Gagal memuat detail feedback',
        'error',
      );
      navigate('/admin/feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSendingReply(true);
    try {
      const response = await axios.post(
        `/api/admin/feedback/${id}/reply`,
        { content: replyContent },
      );
      setFeedback(response.data);
      setReplyContent('');
      setIsEditingReply(false);
      Toast('Balasan terkirim', 'success');
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengirim balasan',
        'error',
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleEditReply = () => {
    setReplyContent(feedback.reply?.content || '');
    setIsEditingReply(true);
  };

  const handleCancelEdit = () => {
    setIsEditingReply(false);
    setReplyContent('');
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((index) => (
          <FaStar
            key={index}
            className={`text-lg ${index <= rating
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
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
    return <SmartLoader />;
  }

  if (!feedback) {
    return (
      <div className='p-4 sm:p-6 lg:p-8 '>
        <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-8 text-center'>
          <p className='text-lg text-[color:var(--text-secondary)] mb-4'>
            Feedback tidak ditemukan
          </p>
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
                <h1 className='text-xl font-bold text-[color:var(--text-primary)]'>
                  {feedback.user?.username || 'Anonymous'}
                </h1>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='inline-flex items-center rounded-md bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)] capitalize'>
                    {feedback.user?.role || 'User'}
                  </span>
                  <span className='text-xs text-[color:var(--text-secondary)]'>
                    •
                  </span>
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

            <div className='flex flex-wrap items-center gap-3 bg-[color:var(--bg-card)] p-3 rounded-lg border border-[color:var(--border-color)]'>
              <div className='flex flex-col items-start'>
                <span className='text-[10px] text-[color:var(--text-secondary)] uppercase tracking-wider font-semibold mb-1'>
                  Rating Diberikan
                </span>
                {renderStarRating(feedback.rating)}
              </div>
              <div className='h-8 w-px bg-[color:var(--border-color)] self-center mx-1'></div>
              <div className='flex flex-col items-start'>
                <span className='text-[10px] text-[color:var(--text-secondary)] uppercase tracking-wider font-semibold mb-1'>
                  Tampil di Landing Page
                </span>
                <button
                  type='button'
                  onClick={handleToggleLandingPage}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${feedback.showOnLandingPage
                    ? 'bg-green-50 text-green-705 border-green-200/50'
                    : 'bg-slate-100 text-slate-705 border-slate-200/50'
                    }`}
                >
                  {feedback.showOnLandingPage ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                  <span>{feedback.showOnLandingPage ? 'Ya, Tampil' : 'Tidak'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 md:p-8 space-y-8'>
          {/* Kritik Section */}
          <div className='relative'>
            <FaQuoteLeft className='absolute -top-3 -left-2 text-4xl text-[color:var(--bg-tertiary)] opacity-50' />
            <h3 className='relative z-10 text-lg font-semibold text-red-500 mb-3 ml-2'>
              Kritik & Masuhan
            </h3>
            <div className='relative z-10 rounded-xl bg-red-50 p-5 text-[color:var(--text-primary)] border border-red-100'>
              <p className='whitespace-pre-wrap leading-relaxed'>
                {feedback.kritik || 'Tidak ada kritik yang disampaikan.'}
              </p>
            </div>
          </div>

          {/* Saran Section */}
          <div className='relative'>
            <h3 className='relative z-10 text-lg font-semibold text-green-500 mb-3 ml-2'>
              Saran Perbaikan
            </h3>
            <div className='relative z-10 rounded-xl bg-green-50 p-5 text-[color:var(--text-primary)] border border-green-100'>
              <p className='whitespace-pre-wrap leading-relaxed'>
                {feedback.saran || 'Tidak ada saran yang disampaikan.'}
              </p>
            </div>
          </div>

          {/* Reply Section */}
          <div className='mt-8 pt-8 border-t border-[color:var(--border-color)]'>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-[color:var(--text-primary)] mb-4'>
              <FaReply /> Balasan Admin
            </h3>

            {feedback.reply && !isEditingReply ? (
              <div className='rounded-xl bg-blue-50 p-5 border border-blue-100 relative group'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-bold text-blue-600'>
                    Admin
                  </span>
                  <span className='text-xs text-[color:var(--text-secondary)]'>
                    {new Date(feedback.reply.createdAt).toLocaleDateString(
                      'id-ID',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
                <p className='text-[color:var(--text-primary)] whitespace-pre-wrap leading-relaxed min-h-[1.5rem]'>
                  {feedback.reply.content}
                </p>

                <button
                  onClick={handleEditReply}
                  className='absolute top-4 right-4 p-2 text-[color:var(--text-secondary)] hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity'
                  title="Edit Balasan"
                >
                  <FaEdit />
                </button>
              </div>
            ) : (
              <form onSubmit={handleReplySubmit}>
                <div className='mb-4'>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder='Tulis balasan untuk pengguna ini...'
                    className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 outline-none focus:border-[var(--primary)] min-h-[120px] transition-colors resize-y text-[color:var(--text-primary)]'
                  />
                </div>
                <div className='flex justify-end gap-3'>
                  {isEditingReply && (
                    <button
                      type='button'
                      onClick={handleCancelEdit}
                      className='rounded-lg border border-[color:var(--border-color)] px-4 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type='submit'
                    disabled={sendingReply || !replyContent.trim()}
                    className='flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-white font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {sendingReply ? (
                      'Mengirim...'
                    ) : (
                      <>
                        <FaPaperPlane /> Kirim Balasan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackDetail;
