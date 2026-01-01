import { cn } from '@shared/lib/cn.utils';
import { Skeleton } from '@shared/ui/Skeleton';

interface PageSkeletonProps {
  showTitle?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * PageSkeleton component for loading page states
 *
 * @example
 * ```tsx
 * <PageSkeleton showTitle>
 *   <CardSkeleton count={3} />
 * </PageSkeleton>
 * ```
 */
export const PageSkeleton = ({ showTitle = true, children, className = '' }: PageSkeletonProps) => {
  return (
    <section className={cn('p-6', className)} aria-label="Loading page" aria-busy="true">
      {showTitle && <Skeleton className="h-8 w-48 mb-6" />}
      {children}
    </section>
  );
};
