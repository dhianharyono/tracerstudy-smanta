import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import NewsDetail from '../../components/News/NewsDetail';

const AdminNewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const response = await axios.get(`/api/admin/news/${id}`);
      setNews(response.data);
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal memuat detail news', 'error');
      navigate('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/news');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!news) {
    return (
      <div className='card'>
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-tertiary)',
          }}
        >
          <p>News tidak ditemukan</p>
          <button
            onClick={handleBack}
            className='btn btn-primary'
            style={{ marginTop: '16px' }}
          >
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  return <NewsDetail news={news} onBack={handleBack} />;
};

export default AdminNewsDetail;
