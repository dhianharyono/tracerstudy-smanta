import { useNavigate } from 'react-router-dom';
import { FaNewspaper } from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';

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

  return (
    <>
      <div className='card'>
        <h2 className='text-lg md:text-xl mb-6 flex items-center gap-3 font-semibold text-[color:var(--text-primary)]'>
          <FaNewspaper />
          <span>News</span>
        </h2>
        {data.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {data.slice(0, 2).map((newsItem: NewsData) => (
              <div
                key={newsItem._id}
                onClick={() => navigate(`/student/news/${newsItem._id}`)}
                className='cursor-pointer rounded-lg border border-[color:var(--border-color)] p-4 shadow-sm transition-all duration-200 ease-in-out hover:bg-[color:var(--bg-card-hover)] hover:shadow-md hover:-translate-y-0.5 bg-[color:var(--bg-tertiary)]'
              >
                <h3 className='mb-2 text-sm font-bold text-[color:var(--text-primary)]'>
                  {newsItem.title}
                </h3>
                <p className='mb-2 text-xs text-[color:var(--text-secondary)]'>
                  {(() => {
                    const plainText = stripHtml(newsItem.content || '');
                    return plainText.length > 150
                      ? `${plainText.substring(0, 150)}...`
                      : plainText;
                  })()}
                </p>
                <div className='text-xs text-[color:var(--text-tertiary)]'>
                  {newsItem.author?.username} •{' '}
                  {new Date(newsItem.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/student/news')}
              className='btn mt-2 w-full bg-gray-700'
            >
              Read More
            </button>
          </div>
        ) : (
          <div className='h-[350px] content-center'>
            <p className='text-center text-gray-500 py-10'>No data available</p>
             
          </div>
        )}
      </div>
    </>
  );
};

export default News;
