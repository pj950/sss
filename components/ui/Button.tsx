import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-sans text-sm font-bold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out uppercase tracking-wider";
  
  const variantClasses = {
    primary: 'bg-accent text-white shadow-[0_0_10px_theme(colors.accent)] hover:shadow-[0_0_20px_theme(colors.accent)]',
    secondary: 'border-2 border-primary text-primary hover:bg-primary/20 shadow-[0_0_5px_theme(colors.primary)] hover:shadow-[0_0_15px_theme(colors.primary)]',
    danger: 'bg-danger text-white shadow-[0_0_10px_theme(colors.danger)] hover:shadow-[0_0_20px_theme(colors.danger)]',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};
