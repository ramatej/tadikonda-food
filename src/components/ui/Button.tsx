import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill-primary' | 'pill-outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-full',
  };

  const variantClasses = {
    primary:
      'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 focus:ring-orange-500',
    secondary:
      'bg-gray-900 hover:bg-gray-800 text-white shadow-sm focus:ring-gray-700',
    outline:
      'border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ghost:
      'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    'pill-primary':
      'bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-500/25 px-6 py-3 font-semibold focus:ring-orange-500',
    'pill-outline':
      'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 bg-white rounded-full px-6 py-3 font-semibold focus:ring-orange-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
