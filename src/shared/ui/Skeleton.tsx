import type { HTMLAttributes } from 'react';

import { cn } from '@shared/lib/cn.utils';

/**
 * Skeleton component for loading states
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-12 w-12 rounded-full" />
 * ```
 */
export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      aria-live="polite"
      aria-busy="true"
      {...props}
    />
  );
};
