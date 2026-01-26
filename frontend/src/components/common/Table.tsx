
import { ReactNode } from 'react';

export const TableContainer = ({ children }: { children: ReactNode }) => (
    <div className='max-w-sm md:max-w-full overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
        <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
                {children}
            </table>
        </div>
    </div>
);

export const TableHeader = ({ children }: { children: ReactNode }) => (
    <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
        <tr>{children}</tr>
    </thead>
);

export const TableBody = ({ children }: { children: ReactNode }) => (
    <tbody className='divide-y divide-[color:var(--border-color)]'>
        {children}
    </tbody>
);

export const TableRow = ({
    children,
    className = '',
    onClick
}: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <tr
        onClick={onClick}
        className={`hover:bg-[color:var(--bg-tertiary)]/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </tr>
);

export const TableCell = ({
    children,
    className = '',
    colSpan
}: {
    children: ReactNode;
    className?: string;
    colSpan?: number
}) => (
    <td className={`px-6 py-4 ${className}`} colSpan={colSpan}>
        {children}
    </td>
);

export const TableHeadCell = ({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) => (
    <th className={`px-6 py-4 ${className}`}>
        {children}
    </th>
);
