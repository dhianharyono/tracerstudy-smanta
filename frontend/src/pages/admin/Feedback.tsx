import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaEye,
  FaEyeSlash,
  FaStar,
  FaChartBar,
  FaChartLine,
  FaUserCircle,
  FaTrash,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
    fetchVisibility();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/api/admin/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchVisibility = async () => {
    try {
      const response = await axios.get('/api/admin/settings/feedback-visible');
      setFeedbackVisible(response.data.visible);
    } catch (error) {
      console.error('Error fetching visibility:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await axios.put('/api/admin/settings/feedback-visible', {
        visible: !feedbackVisible,
      });
      setFeedbackVisible(!feedbackVisible);
      Toast(
        `Menu kritik dan saran ${
          !feedbackVisible ? 'ditampilkan' : 'disembunyikan'
        }`,
        'success',
      );
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal mengubah visibilitas',
        'error',
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus feedback ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/feedback/${id}`);
      Toast('Feedback berhasil dihapus', 'success');
      fetchFeedbacks();
      fetchStats();
    } catch (error: any) {
      Toast(
        error.response?.data?.message || 'Gagal menghapus feedback',
        'error',
      );
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((index) => (
          <FaStar
            key={index}
            className={`text-sm ${
              index <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Kritik & Saran
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
          Kelola dan analisis feedback dari pengguna
        </p>
      </div>

      {/* Accumulated Rating Info */}
      {stats && (
        <div className='card mb-6 max-w-sm md:max-w-md lg:max-w-full'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'>
                  <FaChartBar />
                </div>
                <h2 className='text-lg font-semibold text-[color:var(--text-primary)] !mb-0'>
                  Akumulasi Rating
                </h2>
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-5xl font-bold text-yellow-400'>
                  {stats.average ? stats.average.toFixed(1) : '0.0'}
                </div>
                <div className='flex flex-col justify-center'>
                  <div className='flex text-yellow-400 text-lg mb-1'>
                    {[1, 2, 3, 4, 5].map((index) => (
                      <FaStar
                        key={index}
                        className={
                          index <= Math.round(stats.average || 0)
                            ? ''
                            : 'text-gray-300 dark:text-gray-600'
                        }
                      />
                    ))}
                  </div>
                  <span className='text-sm text-[color:var(--text-secondary)]'>
                    dari {stats.total} ulasan
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleVisibility}
              className={`flex justify-center items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all ${
                feedbackVisible
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {feedbackVisible ? <FaEyeSlash /> : <FaEye />}
              {feedbackVisible ? 'Sembunyikan Menu' : 'Tampilkan Menu'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Card */}
      {stats && (
        <div className='card mb-8 max-w-sm md:max-w-md lg:max-w-full'>
          <div className='mb-6 flex items-center gap-2'>
            <div className='p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
              <FaChartLine />
            </div>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)] !mb-0'>
              Analisis Rating
            </h2>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Rating Distribution - Progress Bars */}
            <div className='space-y-4'>
              <h3 className='font-medium text-[color:var(--text-primary)] mb-4'>
                Distribusi Bintang
              </h3>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratings?.[rating] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className='flex items-center gap-3'>
                    <div className='flex items-center gap-1 w-12 font-medium text-[color:var(--text-primary)]'>
                      {rating}{' '}
                      <FaStar className='text-xs text-[color:var(--text-secondary)]' />
                    </div>
                    <div className='flex-1 h-3 rounded-full bg-[color:var(--bg-tertiary)] overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rating >= 4
                            ? 'bg-green-500'
                            : rating >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className='w-12 text-right text-sm text-[color:var(--text-secondary)]'>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key Metrics Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 text-center'>
                <p className='text-sm text-[color:var(--text-secondary)] mb-1'>
                  Total Ulasan
                </p>
                <p className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats.total}
                </p>
              </div>
              <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 text-center'>
                <p className='text-sm text-[color:var(--text-secondary)] mb-1'>
                  Rata-rata
                </p>
                <p className='text-3xl font-bold text-[color:var(--text-primary)]'>
                  {stats.average ? stats.average.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 text-center'>
                <p className='text-sm text-[color:var(--text-secondary)] mb-1'>
                  Positif (4-5)
                </p>
                <p className='text-3xl font-bold text-green-500'>
                  {(stats.ratings?.[5] || 0) + (stats.ratings?.[4] || 0)}
                </p>
              </div>
              <div className='rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 text-center'>
                <p className='text-sm text-[color:var(--text-secondary)] mb-1'>
                  Negatif (1-2)
                </p>
                <p className='text-3xl font-bold text-red-500'>
                  {(stats.ratings?.[1] || 0) + (stats.ratings?.[2] || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List Table */}
      <div className='max-w-sm md:max-w-full overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
        <div className='border-b border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-6 py-4'>
          <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
            Daftar Masukan Terbaru
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4'>Pengguna</th>
                <th className='px-6 py-4'>Rating</th>
                <th className='px-6 py-4'>Kritik & Saran</th>
                <th className='px-6 py-4'>Tanggal</th>
                <th className='px-6 py-4 text-center'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {feedbacks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='p-8 text-center text-[color:var(--text-secondary)]'
                  >
                    Belum ada kritik dan saran yang masuk.
                  </td>
                </tr>
              ) : (
                feedbacks.map((feedback) => (
                  <tr
                    key={feedback._id}
                    className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)]'>
                          <FaUserCircle size={20} />
                        </div>
                        <div>
                          <p className='font-medium text-[color:var(--text-primary)]'>
                            {feedback.user?.username || 'Anonymous'}
                          </p>
                          <span className='inline-flex items-center rounded bg-[color:var(--bg-tertiary)] px-2 py-0.5 text-xs font-medium text-[color:var(--text-secondary)] capitalize border border-[color:var(--border-color)]'>
                            {feedback.user?.role || 'User'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <span className='mr-2 font-bold text-[color:var(--text-primary)]'>
                          {feedback.rating}
                        </span>
                        {renderStarRating(feedback.rating)}
                      </div>
                    </td>
                    <td className='px-6 py-4 max-w-xs'>
                      <div className='mb-1'>
                        <span className='text-xs font-semibold text-red-500 uppercase tracking-wide'>
                          Kritik:
                        </span>
                        <span className='ml-1 text-[color:var(--text-secondary)] truncate block'>
                          {feedback.kritik || '-'}
                        </span>
                      </div>
                      <div>
                        <span className='text-xs font-semibold text-green-500 uppercase tracking-wide'>
                          Saran:
                        </span>
                        <span className='ml-1 text-[color:var(--text-secondary)] truncate block'>
                          {feedback.saran || '-'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-[color:var(--text-secondary)]'>
                      {new Date(feedback.createdAt).toLocaleDateString(
                        'id-ID',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() =>
                            navigate(`/admin/feedback/${feedback._id}`)
                          }
                          className='rounded p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20'
                          title='Lihat Detail'
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-900/20'
                          title='Hapus'
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
