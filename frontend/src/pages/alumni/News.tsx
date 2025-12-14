import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { stripHtml } from '../../utils/helpers';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    username?: string;
  };
  isRead?: boolean;
}

const AlumniNews = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get<NewsItem[]>('/api/alumni/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = (newsId: string) => {
    navigate(`/alumni/news/${newsId}`);
  };

  if (loading) {
    return (
      <div className='loading text-[color:var(--text-secondary)]'>
        ⏳ Loading...
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>News</h1>
      </div>

      {news.length === 0 ? (
        <div className='card'>
          <div className='p-10 text-center text-[color:var(--text-tertiary)]'>
            <div className='mb-4 text-6xl'>📰</div>
            <p>Belum ada news yang tersedia</p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
          {news.map((newsItem) => (
            <div
              key={newsItem._id}
              onClick={() => handleNewsClick(newsItem._id)}
              className='cursor-pointer rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 transition-all duration-200 hover:translate-y-[-4px] hover:bg-[color:var(--bg-card-hover)] hover:shadow-lg'
            >
              <h3 className='mb-3 text-xl font-semibold leading-snug text-[color:var(--text-primary)]'>
                {newsItem.title}
              </h3>
              <p className='mb-4 overflow-hidden text-sm leading-relaxed text-[color:var(--text-secondary)] line-clamp-3'>
                {(() => {
                  const plainText = stripHtml(newsItem.content || '');
                  return plainText.length > 90
                    ? `${plainText.substring(0, 90)}...`
                    : plainText;
                })()}
              </p>
              <div className='flex items-center justify-between border-t border-[color:var(--border-color)] pt-3 text-xs text-[color:var(--text-tertiary)]'>
                <span>{newsItem.author?.username || 'Admin'}</span>
                <span>
                  {new Date(newsItem.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniNews;
