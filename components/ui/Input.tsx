import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="w-full bg-secondary-bg border border-primary/60 rounded-md py-2 px-3 text-light-text placeholder-primary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300 shadow-[inset_0_0_5px_rgba(0,245,255,0.3)]"
      {...props}
    />
  );
};
