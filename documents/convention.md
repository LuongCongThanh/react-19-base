# 📏 Project Conventions (v1.1)

Tài liệu này tổng hợp toàn bộ quy chuẩn (Naming, Coding Style, Folder Structure...) bắt buộc áp dụng cho dự án `react-19-base`.

---

## 1. Naming Conventions (Quy tắc đặt tên)

### 1.1. Files & Directories

| Loại (Type)     | Quy tắc (Pattern)            | Ví dụ (Example)                    | Context & Semantics                                        |
| :-------------- | :--------------------------- | :--------------------------------- | :--------------------------------------------------------- |
| **Folder**      | `kebab-case`                 | `features`, `auth`, `user-profile` | Luôn viết thường, danh từ hoặc cụm danh từ.                |
| **Component**   | `PascalCase`                 | `Button.tsx`, `UserProfile.tsx`    | Luôn là **Danh từ**. Thể hiện UI Element.                  |
| **Page**        | `PascalCase` + `Page`        | `LoginPage.tsx`, `HomePage.tsx`    | Hậu tố `Page` để phân biệt với Component thường.           |
| **Hook**        | `use` + `PascalCase`         | `useAuth.ts`, `useWindowSize.ts`   | Bắt buộc prefix `use`. Thể hiện hành động hoặc trạng thái. |
| **API**         | `<action/resource>.api.ts`   | `auth.api.ts`, `product.api.ts`    | Tên theo resource hoặc domain nghiệp vụ.                   |
| **Store**       | `<name>.store.ts`            | `auth.store.ts`                    | Zustand stores.                                            |
| **Utils**       | `<name>.utils.ts`            | `date.utils.ts`                    | Pure functions, không side-effect.                         |
| **Service**     | `<name>.service.ts`          | `storage.service.ts`               | Stateful logic, complex helper.                            |
| **Test**        | `<name>.test.ts(x)`          | `Button.test.tsx`                  | Unit test.                                                 |
| **Integration** | `<name>.integration.test.ts` | `auth.integration.test.ts`         | Integration test.                                          |

### 1.2. Code Identifiers & Semantics

#### Variables & Types

- **Boolean**: Phải trả lời câu hỏi Y/N.
  - `is<Adjective>`: Trạng thái hiện tại (`isLoading`, `isVisible`).
  - `has<Noun>`: Khả năng/Sở hữu (`hasPermission`, `hasChildren`).
  - `should<Verb>`: Điều kiện logic (`shouldRender`, `shouldRetry`).
- **Generics**:
  - Tránh dùng `T`, `U`, `V`.
  - Dùng `TData`, `TError`, `TProps` để rõ nghĩa.
- **Interfaces**:
  - `interface User { ... }`: Model/Data structure.
  - `type ButtonProps = { ... }`: Component Props / Union Types.
  - Không dùng prefix `I` hoặc `T`.

#### Functions

- **Event Handler (Internal)**: `handle` + `<Action/Event>` (`handleClick`, `handleSubmit`).
- **Event Prop (Interface)**: `on` + `<Action/Event>` (`onClick`, `onSubmit`).
- **Action Verbs**:
  - `get`: Lấy dữ liệu đồng bộ/store (`getUser`).
  - `fetch`: Async API call (`fetchProducts`).
  - `calc`: Tính toán (`calcTotal`).
  - `format`: Chuyển đổi định dạng (`formatDate`).

---

## 2. Coding Guidelines

### 2.1. TypeScript Best Practices

- **Explicit Types**: Hạn chế tối đa `any`. Dùng `unknown` nếu chưa rõ type.
- **Null vs Undefined**:
  - `undefined`: Optional field, param thiếu.
  - `null`: Giá trị rỗng có chủ đích (từ API/DB).

### 2.2. Error Handling

- **Custom Errors**: Define lỗi rõ ràng.
  ```typescript
  class AppError extends Error { ... }
  class AuthError extends AppError { ... }
  ```
- **Try-Catch**: Catch specific error types.
  ```typescript
  try {
    await fetchUser();
  } catch (error) {
    if (error instanceof AuthError) {
      // Handle auth error
    }
  }
  ```
- **API Errors**: Xử lý tập trung tại `onError` của TanStack Query hoặc Interceptor.

### 2.3. Anti-patterns (Cần tránh)

- ❌ **Nested Ternary**:
  ```typescript
  // BAD
  const status = isLoading ? 'loading' : isError ? 'error' : 'success';
  ```
- ❌ **Magic Numbers**:
  ```typescript
  // BAD
  setTimeout(fn, 3000);
  // GOOD
  const DEBOUNCE_DELAY = 3000;
  setTimeout(fn, DEBOUNCE_DELAY);
  ```
- ❌ **Effect for Data Fetching**:
  ```typescript
  // BAD
  useEffect(() => { fetch().then(setDate) }, []);
  // GOOD
  useQuery({ queryKey: [...], queryFn: fetch });
  ```

---

## 3. Project Structure

### 3.1. Feature-Based Architecture

```
features/
└── <feature-name>/
    ├── api/             # API calls
    ├── components/      # Feature-specific UI
    ├── hooks/           # Business logic
    ├── pages/           # Pages (Composition)
    ├── stores/          # Zustand stores
    ├── types/           # TS Types/Interfaces
    ├── validators/      # Zod schemas
    └── <feature>.routes.tsx
```

### 3.2. Import Rules (Enforced by ESLint)

- **Feature Isolation**: Feature này KHÔNG ĐƯỢC import trực tiếp Feature khác.
  - Trao đổi qua `@shared`, Store, hoặc Event Bus.
- **No Circular Deps**: Tránh vòng lặp import.
- **Path Aliases**: Bắt buộc dùng `@app`, `@features`, `@shared`.

---

## 4. Testing Guidelines

- **Unit Tests**: Cho Utils, Hooks. Focus logic, edge cases.
- **Integration Tests**: Cho Pages/Flows chính. Mock API bằng MSW.
- **Snapshot**: Hạn chế dùng snapshot cho UI trừ khi cực kỳ ổn định.

---

**Tuân thủ Convention giúp codebase scale tốt và dễ bảo trì!** 🚀
