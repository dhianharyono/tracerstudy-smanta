import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
}

const Card = ({ children, className = '', ...props }: CardProps) => {
    return (
        <div
            className={`rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
