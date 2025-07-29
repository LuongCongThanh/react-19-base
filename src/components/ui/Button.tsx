// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<Readonly<ButtonProps>> = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-60 rounded" {...props}>
    {children}
  </button>
);

export default Button;
