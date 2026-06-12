import { FaStar, FaChartBar } from 'react-icons/fa';
import Card from './common/Card';

interface FeedbackStatsAndProps {
    stats: {
        average: number;
        total: number;
        ratings: { [key: number]: number };
    };
}

const FeedbackStats: React.FC<FeedbackStatsAndProps> = ({ stats }) => {
    return (
        <Card className='mb-8'>
            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-yellow-50 text-yellow-600 border border-yellow-200/30'>
                    <FaChartBar />
                </div>
                <h2 className='text-lg font-semibold text-[color:var(--text-primary)] !mb-0'>
                    Akumulasi Rating
                </h2>
            </div>

            <div className='flex flex-col md:flex-row items-center gap-8'>
                {/* Average Display */}
                <div className='flex flex-col items-center justify-center p-4 min-w-[200px] text-center'>
                    <div className='text-5xl font-bold text-yellow-400 mb-2'>
                        {stats.average ? stats.average.toFixed(1) : '0.0'}
                    </div>
                    <div className='flex text-yellow-400 text-lg mb-2'>
                        {[1, 2, 3, 4, 5].map((index) => (
                            <FaStar
                                key={index}
                                className={
                                    index <= Math.round(stats.average || 0)
                                        ? ''
                                        : 'text-gray-300 dark:text-gray-600'
                                }
                            />
                        ))}
                    </div>
                    <span className='text-sm text-[color:var(--text-secondary)]'>
                        Berdasarkan {stats.total} ulasan
                    </span>
                </div>

                {/* Bar Chart */}
                <div className='flex-1 w-full space-y-2'>
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratings?.[rating] || 0;
                        const percentage =
                            stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={rating} className='flex items-center gap-3'>
                                <div className='flex items-center gap-1 w-8 font-medium text-[color:var(--text-primary)] text-sm'>
                                    {rating} <FaStar className='text-xs text-yellow-400' />
                                </div>
                                <div className='flex-1 h-2 rounded-full bg-[color:var(--bg-tertiary)] overflow-hidden'>
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${rating >= 4
                                                ? 'bg-green-500'
                                                : rating >= 3
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className='w-8 text-right text-xs text-[color:var(--text-secondary)]'>
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default FeedbackStats;
