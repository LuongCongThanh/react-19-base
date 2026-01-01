# 🔍 Skeleton vs Zustand - Giải thích chi tiết

## ❓ Câu hỏi thường gặp

**"Tại sao phải dùng Skeleton? Tôi dùng Zustand có được không?"**

## 🎯 Trả lời ngắn gọn

**Skeleton và Zustand là 2 thứ HOÀN TOÀN KHÁC NHAU và KHÔNG THỂ thay thế cho nhau:**

- **Skeleton** = UI Component (hiển thị giao diện)
- **Zustand** = State Management (quản lý dữ liệu)

Chúng **BỔ SUNG** cho nhau, không thay thế!

---

## 📊 So sánh chi tiết

### 1. Skeleton - UI Component

**Skeleton là gì?**

- Component React để hiển thị **placeholder UI** khi đang tải dữ liệu
- Giống như "khung xương" của nội dung thật
- Chỉ là **giao diện**, không quản lý dữ liệu

**Ví dụ Skeleton:**

```tsx
// Skeleton chỉ là UI component
<Skeleton className="h-4 w-[250px]" />  // Hiển thị thanh màu xám nhấp nháy
<Skeleton className="h-12 w-12 rounded-full" />  // Hiển thị hình tròn màu xám
```

**Khi nào dùng Skeleton?**

- Khi đang fetch data từ API (React Query đang loading)
- Muốn hiển thị cấu trúc gần giống nội dung thật
- Cải thiện UX (người dùng biết nội dung sắp hiển thị)

### 2. Zustand - State Management

**Zustand là gì?**

- Thư viện quản lý **state** (dữ liệu) của ứng dụng
- Lưu trữ và cập nhật dữ liệu
- Không liên quan đến UI, chỉ quản lý dữ liệu

**Ví dụ Zustand:**

```tsx
// Zustand quản lý state (dữ liệu)
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
}));

// Sử dụng trong component
const { user, setAuth } = useAuthStore(); // Lấy dữ liệu từ store
```

**Khi nào dùng Zustand?**

- Quản lý client state (UI state, form state, etc.)
- Lưu trữ dữ liệu cần share giữa nhiều components
- Thay thế cho useState khi state phức tạp

---

## 🔄 Chúng hoạt động cùng nhau như thế nào?

### Flow thực tế trong dự án:

```tsx
// 1. React Query fetch data (server state)
const { data, isLoading, error } = useDashboardData();

// 2. Zustand quản lý client state (nếu cần)
const { filter, setFilter } = useDashboardStore();

// 3. Skeleton hiển thị UI khi loading
if (isLoading) {
  return <PageSkeleton><CardSkeleton count={3} /></PageSkeleton>;
}

// 4. Hiển thị data thật khi đã load xong
return <div>{data.map(...)}</div>;
```

### Ví dụ cụ thể:

```tsx
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@features/dashboard/stores/dashboard.store';
import { CardSkeleton } from '@shared/components/CardSkeleton';
import { PageSkeleton } from '@shared/components/PageSkeleton';

export const DashboardPage = () => {
  // ✅ Zustand: Quản lý filter state (client state)
  const { filter, setFilter } = useDashboardStore();

  // ✅ React Query: Fetch data từ API (server state)
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filter], // Filter từ Zustand
    queryFn: () => fetchDashboardData(filter),
  });

  // ✅ Skeleton: Hiển thị UI loading
  if (isLoading) {
    return (
      <PageSkeleton>
        <CardSkeleton count={3} />
      </PageSkeleton>
    );
  }

  // ✅ Hiển thị data thật
  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)} // Zustand action
      />
      {data?.map((item) => (
        <Card key={item.id} data={item} />
      ))}
    </div>
  );
};
```

---

## 🤔 Tại sao không thể thay Skeleton bằng Zustand?

### ❌ Không thể làm:

```tsx
// ❌ SAI: Zustand không thể tạo UI
const useSkeletonStore = create((set) => ({
  showSkeleton: true,
  toggleSkeleton: () => set((state) => ({ showSkeleton: !state.showSkeleton })),
}));

// ❌ Zustand chỉ quản lý state, không render UI
const { showSkeleton } = useSkeletonStore();
// Nhưng vẫn cần component Skeleton để hiển thị!
```

### ✅ Phải làm:

```tsx
// ✅ ĐÚNG: Zustand quản lý state, Skeleton hiển thị UI
const useSkeletonStore = create((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

const { isLoading } = useSkeletonStore();

// Skeleton component hiển thị UI
if (isLoading) {
  return <Skeleton className="h-4 w-[250px]" />;
}
```

---

## 🎨 Tại sao cần Skeleton thay vì chỉ dùng Spinner?

### So sánh UX:

#### ❌ Chỉ dùng Spinner (LoadingFallback):

```
[Spinner quay tròn]
"Loading..."
```

- Người dùng không biết nội dung gì sắp hiển thị
- Trải nghiệm "nhảy" khi data load xong (layout shift)
- Cảm giác chờ đợi lâu hơn

#### ✅ Dùng Skeleton:

```
[Khung xương giống nội dung thật]
████████████░░░░░░  ← Title skeleton
████████░░░░░░░░░░  ← Content skeleton
████████████████░░  ← Another content skeleton
```

- Người dùng biết cấu trúc nội dung sắp hiển thị
- Không có layout shift (smooth transition)
- Cảm giác load nhanh hơn (perceived performance)

### Ví dụ thực tế:

**Facebook, LinkedIn, YouTube** đều dùng Skeleton loading:

- Hiển thị khung xương của post/video
- Người dùng biết nội dung gì sắp xuất hiện
- UX tốt hơn nhiều so với spinner

---

## 📋 Tóm tắt: Khi nào dùng gì?

| Mục đích                 | Tool            | Ví dụ                                   |
| ------------------------ | --------------- | --------------------------------------- |
| **Hiển thị UI loading**  | **Skeleton**    | `<Skeleton />`, `<CardSkeleton />`      |
| **Quản lý client state** | **Zustand**     | `useAuthStore()`, `useDashboardStore()` |
| **Fetch server data**    | **React Query** | `useQuery()`, `useMutation()`           |
| **Hiển thị error**       | **ErrorState**  | `<ErrorState error={error} />`          |

---

## 💡 Kết luận

1. **Skeleton** = UI Component → Hiển thị giao diện loading
2. **Zustand** = State Management → Quản lý dữ liệu
3. **Chúng BỔ SUNG cho nhau**, không thay thế
4. **Dùng Skeleton** để cải thiện UX (thay vì chỉ spinner)
5. **Dùng Zustand** để quản lý state phức tạp

**Trong dự án hiện tại:**

- ✅ **React Query** quản lý server state (data từ API)
- ✅ **Zustand** quản lý client state (UI state, filter, etc.)
- ✅ **Skeleton** hiển thị UI loading (cải thiện UX)

Tất cả đều cần thiết và hoạt động cùng nhau! 🚀
