import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

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
      toast.error(error.response?.data?.message || 'Gagal memuat detail feedback');
      navigate('/admin/feedback');
    } finally {
      setLoading(false);
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
          }}
        >
          {rating}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className='loading'
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <FaSpinner className='spinner' />
        <span>Loading...</span>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className='card'>
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-tertiary)',
          }}
        >
          <p>Feedback tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin/feedback')}
            className='btn btn-primary'
            style={{ marginTop: '16px' }}
          >
            Kembali ke Kritik & Saran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
        <button
          onClick={() => navigate('/admin/feedback')}
          className='btn btn-secondary'
          style={{ marginRight: '16px' }}
        >
          ← Kembali
        </button>
        <h1 className='page-title'>Detail Kritik & Saran</h1>
      </div>

      <div className='card'>
        <div
          style={{
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Dari:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {feedback.user?.username || '-'}
                </strong>
              </span>
              <span
                style={{
                  marginLeft: '16px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}
              >
                Role:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {feedback.user?.role || '-'}
                </strong>
              </span>
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
              {new Date(feedback.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            Rating
          </h3>
          {renderStarRating(feedback.rating)}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            Kritik
          </h3>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {feedback.kritik || '-'}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>
            Saran
          </h3>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {feedback.saran || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackDetail;






