import { stripHtml } from '../../utils/helpers';
import { FaUserCircle, FaCalendarAlt, FaClock, FaArrowRight } from 'react-icons/fa';
import Card from '../common/Card';

export interface NewsItem {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    author?: {
        username?: string;
    };
}

interface NewsListProps {
    news: NewsItem[];
    onNewsClick: (id: string) => void;
}

const NewsList = ({ news, onNewsClick }: NewsListProps) => {
    const calculateReadTime = (content: string) => {
        const text = stripHtml(content);
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wordsPerMinute);
        return `${time} min read`;
    };

    if (news.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-20 text-center bg-[color:var(--bg-card)] rounded-xl border border-[color:var(--border-color)] border-dashed'>
                <div className='text-6xl mb-6 opacity-20 grayscale'>📰</div>
                <h3 className='text-xl font-medium text-[color:var(--text-secondary)]'>
                    Belum ada berita ditemukan
                </h3>
                <p className='text-[color:var(--text-tertiary)] mt-2'>
                    Coba kata kunci lain atau kembali nanti.
                </p>
            </div>
        );
    }

    return (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {news.map((item) => (
                <Card
                    key={item._id}
                    onClick={() => onNewsClick(item._id)}
                    className='group cursor-pointer flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300'
                >
                    <div className='flex flex-col h-full'>
                        <div className='flex items-center gap-2 mb-3 text-xs text-[color:var(--text-tertiary)]'>
                            <span className='flex items-center gap-1 bg-[color:var(--bg-tertiary)] px-2 py-1 rounded-md'>
                                <FaCalendarAlt />
                                {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className='flex items-center gap-1 bg-[color:var(--bg-tertiary)] px-2 py-1 rounded-md'>
                                <FaClock />
                                {calculateReadTime(item.content)}
                            </span>
                        </div>

                        <h2 className='text-sm md:text-base font-bold text-[color:var(--text-primary)] mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight'>
                            {item.title}
                        </h2>

                        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm leading-relaxed line-clamp-3 mb-4 flex-1'>
                            {stripHtml(item.content)}
                        </p>

                        <div className='flex items-center justify-between mt-auto pt-4 border-t border-[color:var(--border-color)]'>
                            <div className='flex items-center gap-2'>
                                <div className='w-6 h-6 rounded-full bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--text-secondary)]'>
                                    <FaUserCircle size={14} />
                                </div>
                                <span className='text-xs font-medium text-[color:var(--text-secondary)]'>
                                    {item.author?.username || 'Admin'}
                                </span>
                            </div>

                            <span className='text-[10px] md:text-xs font-semibold text-[var(--primary)] flex items-center gap-1 group-hover:gap-2 transition-all'>
                                Baca Selengkapnya <FaArrowRight />
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default NewsList;
