import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-secondary-bg/70 backdrop-blur-sm border border-accent/60 shadow-[0_0_15px_rgba(255,0,255,0.3)] rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className='' }) => {
    return (
        <div className={`mb-4 pb-4 border-b border-accent/40 ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className='' }) => {
    return (
        <h3 className={`text-xl font-heading font-bold text-accent tracking-wider [text-shadow:0_0_8px_theme(colors.accent)] ${className}`}>
            {children}
        </h3>
    );
}
