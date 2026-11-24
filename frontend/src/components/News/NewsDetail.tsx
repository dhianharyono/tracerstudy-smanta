import { FaUserCircle, FaClock } from 'react-icons/fa';
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

const NewsDetail = ({ news }: NewsDetailProps) => {
  const calculateReadTime = (content: string) => {
    const text = stripHtml(content);
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  };

  return (
    <article className='max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 page-fade-in'>
      <header className='mb-6'>
        <h1 className='text-lg sm:text-xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-4 leading-snug'>
          {news.title}
        </h1>

        <div className='flex items-center gap-3'>
          <FaUserCircle className='text-2xl md:text-3xl text-[var(--text-tertiary)] shrink-0' />
          <div className='text-xs md:text-sm'>
            <div className='font-semibold text-[var(--text-primary)]'>
              {news.author?.username || 'Admin'}
            </div>
            <div className='flex items-center gap-2 text-[var(--text-secondary)] flex-wrap text-xs'>
              <span>
                {new Date(news.createdAt).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className='flex items-center gap-1'>
                <FaClock className='text-[10px]' />
                {calculateReadTime(news.content)}
              </span>
              {news.isPublished !== undefined && (
                <>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      news.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
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

      <div className='border-t border-[var(--border-color)] my-6'></div>

      <div
        className='news-content text-sm sm:text-base leading-relaxed text-[var(--text-primary)]'
        dangerouslySetInnerHTML={{ __html: news.content }}
      />

      {/* Custom styles for news content formatting */}
      <style>{`
        .news-content {
          line-height: 1.65;
          word-break: break-word;
        }
        .news-content p {
          margin-top: 0;
          margin-bottom: 0.65rem;
          line-height: 1.65;
          color: var(--text-primary);
        }
        /* Tangani paragraf kosong bawaan editor Quill (<p><br></p>) agar tidak membuat jarak melonjak jauh */
        .news-content p:empty,
        .news-content p:has(> br:only-child) {
          margin-bottom: 0.35rem;
          min-height: 0.8rem;
        }
        .news-content img {
          border-radius: 8px;
          margin: 1.25rem auto;
          box-shadow: var(--shadow-md);
          max-width: 100%;
          height: auto;
          display: block;
        }
        .news-content h1, .news-content h2, .news-content h3, .news-content h4 {
          color: var(--text-primary);
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.6rem;
          line-height: 1.35;
        }
        .news-content h1 { font-size: 1.5rem; }
        .news-content h2 { font-size: 1.3rem; }
        .news-content h3 { font-size: 1.15rem; }
        .news-content a {
          color: var(--primary);
          text-decoration: underline;
        }
        .news-content blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .news-content ul {
          list-style-type: disc;
          margin-left: 1.25rem;
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }
        .news-content ol {
          list-style-type: decimal;
          margin-left: 1.25rem;
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }
        .news-content li {
          margin-bottom: 0.25rem;
          line-height: 1.6;
          color: var(--text-primary);
        }
        .news-content strong {
          color: var(--text-primary);
          font-weight: 700;
        }
        /* Quill Alignment Support */
        .news-content .ql-align-center {
          text-align: center;
        }
        .news-content .ql-align-right {
          text-align: right;
        }
        .news-content .ql-align-justify {
          text-align: justify;
        }
        /* Quill Indentation Support */
        .news-content .ql-indent-1 { padding-left: 2em; }
        .news-content .ql-indent-2 { padding-left: 4em; }
        .news-content .ql-indent-3 { padding-left: 6em; }
        /* Quill Size Support */
        .news-content .ql-size-small { font-size: 0.85em; }
        .news-content .ql-size-large { font-size: 1.3em; }
        .news-content .ql-size-huge { font-size: 1.8em; }
      `}</style>
    </article>
  );
};

export default NewsDetail;
