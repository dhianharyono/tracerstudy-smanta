import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft, FaClock } from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';

interface NewsDetailProps {
  news: {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    isPublished?: boolean;
    author?: {
      username?: string;
    };
  };
  onBack?: () => void;
}

const NewsDetail = ({ news, onBack }: NewsDetailProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const calculateReadTime = (content: string) => {
    const text = stripHtml(content);
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  };

  return (
    <article className='p-4 sm:p-6 lg:p-8 pb-20 page-fade-in'>
      <button
        onClick={handleBack}
        className='group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-8 transition-colors'
      >
        <div className='p-2 rounded-full group-hover:bg-[var(--bg-tertiary)] transition-colors'>
          <FaArrowLeft />
        </div>
        <span className='font-medium'>Kembali</span>
      </button>

      <header className='mb-5'>
        <h1 className='text-sm md:text-3xl font-bold text-[var(--text-primary)] mb-6 leading-tight'>
          {news.title}
        </h1>

        <div className='flex items-center gap-3'>
          <FaUserCircle className='text-xl md:text-3xl text-[var(--text-tertiary)]' />
          <div className='text-xs md:text-sm'>
            <div className='font-medium text-[var(--text-primary)]'>
              {news.author?.username || 'Admin'}
            </div>
            <div className='flex items-center gap-2 text-[var(--text-secondary)]'>
              <span>
                {new Date(news.createdAt).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className='flex items-center gap-1'>
                <FaClock />
                {calculateReadTime(news.content)}
              </span>
              {news.isPublished !== undefined && (
                <>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      news.isPublished
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {news.isPublished ? 'Published' : 'Draft'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className='border-t border-[var(--border-color)] my-5'></div>

      <div
        className='prose prose-lg dark:prose-invert max-w-none text-sm md:text-base'
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      {/* Custom styles for content that might escape Tailwind typography */}
      <style>{`
        .prose img {
          border-radius: 8px;
          margin: 2rem auto;
          box-shadow: var(--shadow-md);
        }
        .prose p {
          margin-bottom: 1.5em;
          line-height: 1.8;
          color: var(--text-primary);
        }
        .prose h1, .prose h2, .prose h3 {
          color: var(--text-primary);
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .prose a {
          color: var(--primary);
          text-decoration: underline;
        }
        .prose blockquote {
          border-left-color: var(--primary);
          font-style: italic;
          color: var(--text-secondary);
        }
        .prose ul, .prose ol {
          color: var(--text-primary);
        }
      `}</style>
    </article>
  );
};

export default NewsDetail;
