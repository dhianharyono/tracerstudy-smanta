import { useNavigate } from 'react-router-dom';
import { FaNewspaper } from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
interface NewsAuthor {
  username: string;
}

interface NewsData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: NewsAuthor;
}

interface NewsProps {
  data: NewsData[];
}

const News = ({ data }: NewsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAlumni = user?.role === 'alumni';
  const isAdmin = user?.role === 'admin';

  return (
    <div className='card flex flex-col h-full'>
      <h2 className='text-lg mb-4 flex items-center gap-3 font-semibold text-[color:var(--text-primary)]'>
        <FaNewspaper />
        <span>Berita Terbaru</span>
      </h2>

      {data.length > 0 ? (
        <div className='flex flex-col flex-1 gap-0'>
          {data.slice(0, 3).map((newsItem: NewsData) => (
            <div
              key={newsItem._id}
              onClick={() =>
                navigate(
                  isAdmin
                    ? `/admin/news/${newsItem._id}`
                    : isAlumni
                    ? `/alumni/news/${newsItem._id}`
                    : `/student/news/${newsItem._id}`
                )
              }
              className='cursor-pointer py-4 border-b border-[color:var(--border-color)] last:border-0 hover:bg-[color:var(--bg-card-hover)] transition-colors -mx-2 px-2 rounded-lg group'
            >
              <h3 className='mb-1.5 text-sm md:text-base font-bold text-[color:var(--text-primary)] group-hover:text-[color:var(--primary)] transition-colors leading-snug line-clamp-2'>
                {newsItem.title}
              </h3>
              <p className='text-xs text-[color:var(--text-secondary)] line-clamp-2 mb-2 leading-relaxed'>
                {stripHtml(newsItem.content || '')}
              </p>
              <div className='flex items-center gap-2 text-[10px] md:text-xs text-[color:var(--text-tertiary)]'>
                <span className='font-medium'>
                  {newsItem.author?.username || 'Admin'}
                </span>
                <span>•</span>
                <span>
                  {new Date(newsItem.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}

          <div className='mt-auto pt-4'>
            <button
              onClick={() =>
                navigate(
                  isAdmin
                    ? '/admin/news'
                    : isAlumni
                    ? '/alumni/news'
                    : '/student/news'
                )
              }
              className='text-xs font-semibold text-[color:var(--text-tertiary)] hover:text-[color:var(--primary)] flex items-center gap-1'
            >
              Lihat Semua Berita →
            </button>
          </div>
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center min-h-[200px] text-[color:var(--text-tertiary)]'>
          <FaNewspaper className='text-4xl mb-3 opacity-20' />
          <p className='text-sm'>Belum ada berita terbaru</p>
        </div>
      )}
    </div>
  );
};

export default News;
