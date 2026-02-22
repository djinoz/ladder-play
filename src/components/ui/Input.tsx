import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full mb-4">
            {label && <label className="block text-sm font-medium text-textSecondary mb-1">{label}</label>}
            <input
                className={`w-full bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full mb-4">
            {label && <label className="block text-sm font-medium text-textSecondary mb-1">{label}</label>}
            <textarea
                className={`w-full bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px] resize-y ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};
