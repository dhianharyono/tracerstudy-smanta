import { stripHtml } from '../../utils/helpers';
import { FaUserCircle } from 'react-icons/fa';

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
            <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='text-6xl mb-6 opacity-20'>📰</div>
                <h3 className='text-xl font-medium text-[var(--text-secondary)]'>
                    Belum ada berita
                </h3>
                <p className='text-[var(--text-tertiary)] mt-2'>
                    Artikel terbaru akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className='flex flex-col gap-8'>
                {news.map((item) => (
                    <article
                        key={item._id}
                        onClick={() => onNewsClick(item._id)}
                        className='group cursor-pointer border-b border-[var(--border-color)] pb-8 last:border-0'
                    >
                        <div className='flex items-center gap-2 mb-3'>
                            <FaUserCircle className='text-xl text-[var(--text-tertiary)]' />
                            <span className='text-sm font-medium text-[var(--text-primary)]'>
                                {item.author?.username || 'Admin'}
                            </span>
                            <span className='text-[var(--text-tertiary)] text-xs'>•</span>
                            <span className='text-sm text-[var(--text-tertiary)]'>
                                {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>

                        <div className='flex justify-between gap-6'>
                            <div className='flex-1'>
                                <h2 className='text-sm md:text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2 md:line-clamp-3 leading-tight'>
                                    {item.title}
                                </h2>
                                <p className='text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed line-clamp-3 mb-4'>
                                    {stripHtml(item.content)}
                                </p>
                                <div className='flex items-center gap-4'>
                                    <span className='text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-1 rounded-full'>
                                        {calculateReadTime(item.content)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default NewsList;
