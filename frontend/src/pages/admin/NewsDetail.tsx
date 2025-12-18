import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
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
      toast.error(error.response?.data?.message || 'Gagal memuat detail news');
      navigate('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/news');
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
