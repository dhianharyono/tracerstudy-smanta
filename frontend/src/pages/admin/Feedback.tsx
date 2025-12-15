import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaChartBar,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from 'react-icons/fa';

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
      toast.success(
        `Menu kritik dan saran ${
          !feedbackVisible ? 'ditampilkan' : 'disembunyikan'
        }`
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Gagal mengubah visibilitas'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus feedback ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/feedback/${id}`);
      toast.success('Feedback berhasil dihapus');
      fetchFeedbacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus feedback');
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            style={{
              fontSize: '20px',
              color: index <= rating ? '#fbbf24' : '#6b7280',
            }}
          >
            ★
          </span>
        ))}
        <span
          style={{
            marginLeft: '8px',
            color: 'var(--text-primary)',
            fontWeight: '600',
            placeContent: 'center',
          }}
        >
          {rating}/5
        </span>
      </div>
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
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Kritik & Saran</h1>
      </div>

      {/* Accumulated Rating Info */}
      {stats && (
        <div className='card mb-6  max-w-sm md:max-w-md lg:max-w-full'>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h2
                style={{
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <FaChartBar />
                <span>Akumulasi Rating</span>
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: '#fbbf24',
                  }}
                >
                  {stats.average ? stats.average.toFixed(1) : '0.0'}
                </div>
                <div>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: '28px',
                        color:
                          index <= Math.round(stats.average || 0)
                            ? '#fbbf24'
                            : '#6b7280',
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div
                  style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
                >
                  dari {stats.total} rating
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleVisibility}
              className='btn btn-primary'
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {feedbackVisible ? (
                <>
                  <FaEyeSlash />
                  <span>Sembunyikan Menu</span>
                </>
              ) : (
                <>
                  <FaEye />
                  <span>Tampilkan Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stats Card */}
      {stats && (
        <div className='card mb-6  max-w-sm md:max-w-md lg:max-w-full'>
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <FaChartLine />
              <span>Statistik Rating</span>
            </h2>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div
              style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                Total Rating
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}
              >
                {stats.total}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                Rating Rata-rata
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}
              >
                {stats.average ? stats.average.toFixed(1) : '0.0'}
              </div>
              {stats.average && renderStarRating(Math.round(stats.average))}
            </div>

            <div
              style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                Rating 5 Bintang
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#fbbf24',
                }}
              >
                {stats.ratings?.[5] || 0}
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                Rating 1 Bintang
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#ef4444',
                }}
              >
                {stats.ratings?.[1] || 0}
              </div>
            </div>
          </div>

          {/* Statistik Semua Bintang - Google Play Store Style */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
              Statistik Semua Bintang
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratings?.[rating] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div
                    key={rating}
                    style={{
                      padding: '20px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {rating}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((index) => (
                          <span
                            key={index}
                            style={{
                              fontSize: '16px',
                              color: index <= rating ? '#fbbf24' : '#6b7280',
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        color:
                          rating >= 4
                            ? '#10b981'
                            : rating >= 3
                            ? '#fbbf24'
                            : '#ef4444',
                        marginBottom: '8px',
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                      }}
                    >
                      {percentage.toFixed(1)}% dari total
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background:
                            rating >= 4
                              ? 'linear-gradient(90deg, #10b981, #059669)'
                              : rating >= 3
                              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(90deg, #ef4444, #dc2626)',
                          transition: 'width 0.3s ease',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
              Distribusi Rating
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratings?.[rating] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                          }}
                        >
                          {rating} Bintang
                        </span>
                        {renderStarRating(rating)}
                      </div>
                      <span
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '14px',
                        }}
                      >
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background:
                            rating >= 4
                              ? 'linear-gradient(90deg, #10b981, #059669)'
                              : rating >= 3
                              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(90deg, #ef4444, #dc2626)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className='card max-w-sm md:max-w-md lg:max-w-full'>
        <h2 style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>
          Daftar Kritik & Saran
        </h2>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Rating</th>
                <th>Kritik</th>
                <th>Saran</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    Belum ada kritik dan saran
                  </td>
                </tr>
              ) : (
                feedbacks.map((feedback) => (
                  <tr key={feedback._id}>
                    <td>{feedback.user?.username || '-'}</td>
                    <td>{feedback.user?.role || '-'}</td>
                    <td>{renderStarRating(feedback.rating)}</td>
                    <td
                      style={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {feedback.kritik || '-'}
                    </td>
                    <td
                      style={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {feedback.saran || '-'}
                    </td>
                    <td>
                      {new Date(feedback.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(`/admin/feedback/${feedback._id}`)
                          }
                          className='btn btn-secondary'
                          style={{
                            padding: '5px 10px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FaEye />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(feedback._id)}
                          className='btn btn-secondary'
                          style={{ padding: '5px 10px', fontSize: '14px' }}
                        >
                          Hapus
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
