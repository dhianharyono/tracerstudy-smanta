
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    children?: ReactNode;
}

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
    return (
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='text-center md:text-left mb-2 md:mb-0'>
                <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
                    {title}
                </h1>
                <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
                    {description}
                </p>
            </div>
            {children && <div className='flex justify-center md:justify-end'>{children}</div>}
        </div>
    );
};

export default PageHeader;
