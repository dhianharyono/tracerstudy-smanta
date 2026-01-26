
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className='mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='text-sm text-[color:var(--text-secondary)]'>
                Menampilkan <span className='font-medium'>{startItem}</span> -{' '}
                <span className='font-medium'>{endItem}</span> dari{' '}
                <span className='font-medium'>{totalItems}</span> data
            </div>
            <div className='flex items-center gap-2'>
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className='flex items-center justify-center gap-1 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    <FaChevronLeft className='text-xs' /> Previous
                </button>

                <div className='px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium'>
                    {currentPage} / {totalPages}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className='flex items-center justify-center gap-1 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    Next <FaChevronRight className='text-xs' />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
