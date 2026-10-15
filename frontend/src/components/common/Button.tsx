import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'softGreen';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-forest-800 hover:bg-forest-900 text-white shadow-sm border border-forest-900/10 active:bg-forest-950',
    secondary: 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 shadow-sm hover:border-stone-300',
    outline: 'bg-transparent hover:bg-forest-50/60 text-forest-800 border border-forest-700/30',
    ghost: 'bg-transparent hover:bg-stone-100/80 text-stone-600 hover:text-stone-900',
    softGreen: 'bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200/60',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
