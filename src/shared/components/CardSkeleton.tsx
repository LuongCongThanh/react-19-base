import { cn } from '@shared/lib/cn.utils';
import { Skeleton } from '@shared/ui/Skeleton';

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * CardSkeleton component for loading card states
 *
 * @example
 * ```tsx
 * <CardSkeleton count={3} />
 * ```
 */
export const CardSkeleton = ({ count = 3, className = '' }: CardSkeletonProps) => {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}
      aria-live="polite"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={`card-skeleton-${i}`} className="rounded bg-white shadow p-4" aria-busy="true">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      ))}
    </div>
  );
};
