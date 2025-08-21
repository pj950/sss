import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-heading font-bold tracking-tight text-light-text sm:text-5xl md:text-6xl [text-shadow:0_0_10px_theme(colors.primary)]">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-xl text-accent max-w-3xl mx-auto tracking-wider font-bold [text-shadow:0_0_8px_theme(colors.accent)]">{subtitle}</p>}
    </header>
  );
};
