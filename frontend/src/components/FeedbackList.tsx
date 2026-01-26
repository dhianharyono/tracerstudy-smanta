import React from 'react';
import { createPortal } from 'react-dom';
import { FaUserSecret, FaStar, FaReply } from 'react-icons/fa';
import Card from './common/Card';

interface FeedbackItem {
    _id: string;
    rating: number;
    kritik?: string;
    saran?: string;
    role: string;
    createdAt: string;
    reply?: {
        content: string;
        createdAt: string;
    };
}

interface FeedbackListProps {
    feedbacks: FeedbackItem[];
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks }) => {
    const [selectedFeedback, setSelectedFeedback] = React.useState<FeedbackItem | null>(null);

    const renderStars = (rating: number) => {
        return (
            <div className='flex text-yellow-400 text-xs'>
                {[1, 2, 3, 4, 5].map((index) => (
                    <FaStar
                        key={index}
                        className={
                            index <= rating ? '' : 'text-gray-300 dark:text-gray-600'
                        }
                    />
                ))}
            </div>
        );
    };

    return (
        <div className='space-y-6'>
            <h3 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)]'>
                Apa Kata Mereka?
            </h3>

            {feedbacks.length === 0 ? (
                <Card>
                    <p className='text-center text-[color:var(--text-secondary)] py-8'>
                        Belum ada ulasan yang ditampilkan.
                    </p>
                </Card>
            ) : (
                <div className='grid gap-6 md:grid-cols-2'>
                    {feedbacks.map((item) => (
                        <Card key={item._id} className='flex flex-col h-full hover:shadow-md transition-shadow relative'>
                            <div className='flex items-start justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='p-2 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)]'>
                                        <FaUserSecret size={20} />
                                    </div>
                                    <div>
                                        <div className='font-semibold text-[color:var(--text-primary)] text-sm'>
                                            Anonymous {item.role === 'student' ? 'Siswa' : 'Alumni'}
                                        </div>
                                        <div className='text-xs text-[color:var(--text-secondary)]'>
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-[color:var(--bg-tertiary)] px-2 py-1 rounded-lg'>
                                    {renderStars(item.rating)}
                                </div>
                            </div>

                            <div className='flex-1 space-y-3 mb-4'>
                                {item.kritik && (
                                    <div className='bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20'>
                                        <span className='text-xs font-bold text-red-500 block mb-1 uppercase tracking-wider'>Kritik</span>
                                        <p className='text-sm text-[color:var(--text-primary)] line-clamp-2 italic'>
                                            "{item.kritik}"
                                        </p>
                                    </div>
                                )}
                                {item.saran && (
                                    <div className='bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20'>
                                        <span className='text-xs font-bold text-green-500 block mb-1 uppercase tracking-wider'>Saran</span>
                                        <p className='text-xs md:text-sm text-[color:var(--text-primary)] line-clamp-2 italic'>
                                            "{item.saran}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='mt-auto pt-4 border-t border-[color:var(--border-color)] flex justify-between items-center'>
                                {item.reply ? (
                                    <div className='flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium'>
                                        <FaReply />
                                        <span>Dibalas Admin</span>
                                    </div>
                                ) : (
                                    <span></span>
                                )}

                                <button
                                    onClick={() => setSelectedFeedback(item)}
                                    className='text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] underline'
                                >
                                    Lihat Selengkapnya
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Detail */}
            {selectedFeedback &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedFeedback(null)}>
                        <div className="bg-[color:var(--bg-card)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[color:var(--border-color)] animate-scale-up" onClick={e => e.stopPropagation()}>
                            <div className="border-b border-[color:var(--border-color)] p-4 flex justify-between items-center bg-[color:var(--bg-tertiary)]/50">
                                <div className="flex items-center gap-3">
                                    <div className='p-2 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)]'>
                                        <FaUserSecret size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[color:var(--text-primary)]">
                                            Anonymous {selectedFeedback.role === 'student' ? 'Siswa' : 'Alumni'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[color:var(--text-secondary)]">
                                                {new Date(selectedFeedback.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                            <span className='text-[color:var(--text-secondary)]'>•</span>
                                            {renderStars(selectedFeedback.rating)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] text-xl font-bold"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                                {selectedFeedback.kritik && (
                                    <div>
                                        <span className='text-xs font-bold text-red-500 block mb-2 uppercase tracking-wider border-b border-red-100 dark:border-red-900/30 pb-1'>Kritik & Masukan</span>
                                        <div className='bg-red-50 dark:bg-red-900/5 p-4 rounded-xl border border-red-100 dark:border-red-900/20'>
                                            <p className='text-sm text-[color:var(--text-primary)] leading-relaxed italic'>
                                                "{selectedFeedback.kritik}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedFeedback.saran && (
                                    <div>
                                        <span className='text-xs font-bold text-green-500 block mb-2 uppercase tracking-wider border-b border-green-100 dark:border-green-900/30 pb-1'>Saran Perbaikan</span>
                                        <div className='bg-green-50 dark:bg-green-900/5 p-4 rounded-xl border border-green-100 dark:border-green-900/20'>
                                            <p className='text-sm text-[color:var(--text-primary)] leading-relaxed italic'>
                                                "{selectedFeedback.saran}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedFeedback.reply && (
                                    <div className='pt-2'>
                                        <div className='flex gap-3 items-start'>
                                            <FaReply className='text-blue-500 mt-1.5 flex-shrink-0 text-lg' />
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                                                        Balasan Admin
                                                    </span>
                                                    <span className='text-xs text-[color:var(--text-secondary)] bg-[color:var(--bg-tertiary)] px-2 py-0.5 rounded-full'>
                                                        {new Date(selectedFeedback.reply.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className='bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl rounded-tl-none border border-blue-100 dark:border-blue-900/20'>
                                                    <p className='text-sm text-[color:var(--text-primary)] leading-relaxed whitespace-pre-wrap'>
                                                        {selectedFeedback.reply.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div>
    );
};

export default FeedbackList;
