import { useNavigate } from 'react-router-dom';
import { FaNewspaper, FaCalendarAlt, FaUserEdit, FaChevronRight, FaClock } from 'react-icons/fa';
import { stripHtml } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

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

  const getPath = (id: string) => {
    if (isAdmin) return `/admin/news/${id}`;
    if (isAlumni) return `/alumni/news/${id}`;
    return `/student/news/${id}`;
  };

  const getAllPath = () => {
    if (isAdmin) return '/admin/news';
    if (isAlumni) return '/alumni/news';
    return '/student/news';
  };

  return (
    <div className='card flex flex-col h-full overflow-hidden group'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-lg md:text-xl flex items-center gap-3 font-bold text-[color:var(--text-primary)]'>
          <div className='p-2 bg-amber-500/10 rounded-lg group-hover:rotate-12 transition-transform duration-300'>
            <FaNewspaper className='text-amber-500' />
          </div>
          <span>Informasi SMANTA</span>
        </h2>
        <div className='flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-md'>
          <FaClock className='animate-pulse' />
          <span>Terupdate</span>
        </div>
      </div>

      {data.length > 0 ? (
        <div className='flex flex-col flex-1 gap-4 overflow-y-auto custom-scrollbar pr-1'>
          {data.slice(0, 4).map((newsItem: NewsData, index: number) => {
            const date = new Date(newsItem.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            // Hero for first item
            if (index === 0) {
              return (
                <motion.div
                  key={newsItem._id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(getPath(newsItem._id))}
                  className='relative cursor-pointer group/item overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-6 shadow-xl shadow-blue-500/20 mb-2'
                >
                  <div className='relative z-10'>
                    <span className='inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[9px] font-bold text-white uppercase tracking-widest mb-3 border border-white/20'>
                      Sorotan Utama
                    </span>
                    <h3 className='text-sm md:text-base font-bold text-white mb-2 leading-tight line-clamp-2 decoration-white/30 group-hover/item:underline'>
                      {newsItem.title}
                    </h3>
                    <p className='text-[10px] md:text-xs text-white/80 line-clamp-2 mb-4 leading-relaxed font-medium'>
                      {stripHtml(newsItem.content || '')}
                    </p>
                    <div className='flex items-center gap-4 text-[9px] font-bold text-white/60'>
                      <span className='flex items-center gap-1'><FaUserEdit className='text-white/40' /> {newsItem.author?.username || 'Admin'}</span>
                      <span className='flex items-center gap-1'><FaCalendarAlt className='text-white/40' /> {date}</span>
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover/item:scale-125 transition-transform duration-700'>
                    <FaNewspaper size={120} className='text-white' />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={newsItem._id}
                whileHover={{ x: 4 }}
                onClick={() => navigate(getPath(newsItem._id))}
                className='flex gap-4 cursor-pointer py-3.5 border-b border-[color:var(--border-color)] last:border-0 group/item'
              >
                <div className='w-12 h-12 rounded-xl bg-[color:var(--bg-tertiary)] flex flex-col items-center justify-center shrink-0 border border-[color:var(--border-color)] group-hover/item:bg-blue-500/10 group-hover/item:border-blue-500/20 transition-all'>
                  <span className='text-[10px] font-bold text-text-tertiary group-hover/item:text-blue-500 uppercase'>{new Date(newsItem.createdAt).getDate()}</span>
                  <span className='text-[8px] font-bold text-text-tertiary uppercase opacity-50'>{new Date(newsItem.createdAt).toLocaleDateString('id-ID', { month: 'short' })}</span>
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='text-xs font-bold text-text-primary mb-1 line-clamp-2 leading-tight group-hover/item:text-blue-500 transition-colors'>
                    {newsItem.title}
                  </h3>
                  <div className='flex text-xs items-center gap-2 text-[9px] font-bold text-text-tertiary'>
                    <span className='flex items-center gap-1'><FaUserEdit /> {newsItem.author?.username || 'Admin'}</span>
                    <span>•</span>
                    <span className='uppercase'>{new Date(newsItem.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className='mt-4'>
            <button
              onClick={() => navigate(getAllPath())}
              className='w-full py-3 px-4 rounded-xl text-[10px] font-bold text-text-tertiary hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest'
            >
              Jelajahi Semua Arsip Warta <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center min-h-[250px] text-[color:var(--text-tertiary)]'>
          <div className='w-16 h-16 rounded-3xl bg-[color:var(--bg-tertiary)] flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110'>
            <FaNewspaper className='text-3xl opacity-20' />
          </div>
          <p className='text-xs font-bold uppercase tracking-widest'>Belum ada warta terbaru</p>
        </div>
      )}
    </div>
  );
};

export default News;
