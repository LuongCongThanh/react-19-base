# 🔄 Loading & Error Handling Guide

Hướng dẫn sử dụng các component Loading và Error Handling trong dự án.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Components](#components)
- [Cách sử dụng](#cách-sử-dụng)
- [Best Practices](#best-practices)
- [Ví dụ](#ví-dụ)

---

## Tổng quan

Dự án sử dụng mô hình **hybrid approach** cho Loading và Error Handling:

### Global Level (Toàn ứng dụng)

- **Suspense** bọc toàn bộ app với `LoadingFallback` (spinner đơn giản) tại `app.providers.tsx`
- **ErrorBoundary** bọc toàn bộ app để bắt các lỗi nghiêm trọng (unhandled errors) gây crash render

### Feature Level (Từng trang/component)

- Sử dụng **React Query** để quản lý state `isLoading` và `error`
- Render các UI riêng biệt (Skeleton cho loading, ErrorState cho lỗi) ngay trong component page

---

## Components

### 1. `ErrorState` - Component hiển thị lỗi

**Location**: `src/shared/components/ErrorState.tsx`

Component dùng chung để hiển thị lỗi với khả năng retry.

**Props**:

```typescript
interface ErrorStateProps {
  title?: string; // Tiêu đề lỗi (mặc định từ i18n)
  message?: string; // Message lỗi tùy chỉnh
  error?: Error | unknown; // Error object từ React Query
  onRetry?: () => void; // Callback khi click "Thử lại"
  className?: string; // Custom className
}
```

**Features**:

- ✅ Icon lỗi tự động
- ✅ Hỗ trợ i18n (tự động dịch theo locale)
- ✅ Retry button (tùy chọn)
- ✅ Accessible (ARIA labels)

### 2. `Skeleton` - Component skeleton cơ bản

**Location**: `src/shared/ui/Skeleton.tsx`

Component skeleton cơ bản từ shadcn/ui pattern.

**Props**:

```typescript
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // Tất cả HTML div attributes
}
```

**Usage**:

```tsx
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />
```

### 3. `CardSkeleton` - Skeleton cho danh sách card

**Location**: `src/shared/components/CardSkeleton.tsx`

Component skeleton cho danh sách card (ví dụ: dashboard cards).

**Props**:

```typescript
interface CardSkeletonProps {
  count?: number; // Số lượng card skeleton (mặc định: 3)
  className?: string; // Custom className
}
```

**Usage**:

```tsx
<CardSkeleton count={3} />
```

### 4. `PageSkeleton` - Skeleton cho trang

**Location**: `src/shared/components/PageSkeleton.tsx`

Component skeleton cho trang với title và content.

**Props**:

```typescript
interface PageSkeletonProps {
  showTitle?: boolean; // Hiển thị skeleton cho title (mặc định: true)
  children?: React.ReactNode; // Skeleton content (ví dụ: CardSkeleton)
  className?: string; // Custom className
}
```

**Usage**:

```tsx
<PageSkeleton showTitle>
  <CardSkeleton count={3} />
</PageSkeleton>
```

### 5. `LoadingFallback` - Fallback cho Suspense

**Location**: `src/shared/components/LoadingFallback.tsx`

Component fallback cho Suspense ở global level (dùng cho lazy loading routes).

**Usage**: Đã được sử dụng trong `app.providers.tsx`, không cần import trực tiếp.

---

## Cách sử dụng

### Pattern chuẩn cho Page Component

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { CardSkeleton } from '@shared/components/CardSkeleton';
import { ErrorState } from '@shared/components/ErrorState';
import { PageSkeleton } from '@shared/components/PageSkeleton';
import { useMyData } from '@features/my-feature/hooks/useMyData';
import { MY_QUERY_KEYS } from '@features/my-feature/constants/my-query-keys.constants';

export const MyPage = () => {
  const { t } = useTranslation('my-feature');
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMyData();

  // Handler để retry query
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: MY_QUERY_KEYS.list() });
  };

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton showTitle>
        <CardSkeleton count={3} />
      </PageSkeleton>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Success state
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      {/* Render data */}
    </div>
  );
};
```

### Custom Error Message

```tsx
if (error) {
  return (
    <ErrorState
      title="Không thể tải dữ liệu"
      message="Vui lòng kiểm tra kết nối mạng và thử lại"
      error={error}
      onRetry={handleRetry}
    />
  );
}
```

### Custom Skeleton

```tsx
if (isLoading) {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

### ✅ Nên làm

1. **Luôn sử dụng ErrorState và Skeleton components** thay vì tự viết UI
2. **Luôn có retry functionality** cho ErrorState (trừ khi không cần thiết)
3. **Sử dụng PageSkeleton và CardSkeleton** cho các pattern phổ biến
4. **Custom Skeleton** khi cần UI phức tạp hơn
5. **Hỗ trợ i18n** - ErrorState tự động sử dụng translations từ `common.json`

### ❌ Không nên làm

1. ❌ **Tự viết loading/error UI** thay vì dùng shared components
2. ❌ **Hardcode text** trong ErrorState (dùng i18n)
3. ❌ **Quên retry functionality** khi có thể retry được
4. ❌ **Sử dụng LoadingFallback** trong page components (chỉ dùng cho Suspense global)

---

## Ví dụ

### Ví dụ 1: Dashboard Page (Đã refactor)

Xem file: `src/features/dashboard/pages/DashboardPage.tsx`

### Ví dụ 2: List Page với Pagination

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { CardSkeleton } from '@shared/components/CardSkeleton';
import { ErrorState } from '@shared/components/ErrorState';
import { PageSkeleton } from '@shared/components/PageSkeleton';
import { useProductList } from '@features/products/hooks/useProductList';

export const ProductListPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProductList();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  if (isLoading) {
    return (
      <PageSkeleton showTitle>
        <CardSkeleton count={6} />
      </PageSkeleton>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

### Ví dụ 3: Detail Page với Custom Skeleton

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState } from '@shared/components/ErrorState';
import { Skeleton } from '@shared/ui/Skeleton';
import { useProductDetail } from '@features/products/hooks/useProductDetail';

export const ProductDetailPage = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProductDetail(id);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['products', id] });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-6 mt-6">
          <Skeleton className="h-96 w-96 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
            <Skeleton className="h-32 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{data?.name}</h1>
      {/* Render product details */}
    </div>
  );
};
```

---

## i18n Translations

Các translations cho Error và Loading được định nghĩa trong:

- `src/locales/vi/common.json`
- `src/locales/en/common.json`

```json
{
  "error": {
    "defaultTitle": "Đã có lỗi xảy ra",
    "defaultMessage": "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.",
    "retry": "Thử lại"
  },
  "loading": {
    "text": "Đang tải..."
  }
}
```

---

## 📚 Tài liệu liên quan

- [Coding Conventions](coding-conventions.md)
- [Creating a Feature](creating-feature.md)
- [TanStack Query Guide](tanstack-query.md)

---

**Sử dụng đúng pattern giúp UX tốt hơn và code nhất quán! 🚀**
