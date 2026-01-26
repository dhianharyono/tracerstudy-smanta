
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm ${className}`}>
            {children}
        </div>
    );
};

export default Card;
