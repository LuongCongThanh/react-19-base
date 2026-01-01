import { cn } from '@shared/lib/cn.utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
}

export const Spinner = ({ size = 'md', variant = 'default', className, ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    primary: 'border-blue-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div
      className={cn('animate-spin rounded-full', sizeClasses[size], variantClasses[variant], className)}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
