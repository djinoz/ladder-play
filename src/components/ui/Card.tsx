import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`glass-panel rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-4">
        <h3 className="text-xl font-semibold text-textPrimary mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-textSecondary">{subtitle}</p>}
    </div>
);
