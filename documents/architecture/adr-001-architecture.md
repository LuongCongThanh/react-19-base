# ADR-001: Frontend Architecture for React 19 Application

## 📌 Status

**Accepted**

## 📅 Date

2025-01-XX

## 👤 Decision Makers

Frontend Technical Lead, Frontend Team

---

## 1. Context (Bối cảnh)

Dự án frontend được xây dựng với các yêu cầu:

- React 19 + TypeScript
- Vite
- Tailwind CSS
- TanStack Router (routing)
- TanStack Query (server state)
- Zustand (client state)
- i18n (đa ngôn ngữ)
- ESLint + Prettier

Dự án có khả năng:

- Scale team (5–20 FE)
- Scale feature
- Maintain dài hạn (>= 3 năm)

Các vấn đề cần giải quyết:

- Tránh **God component**
- Tránh **import chéo loạn feature**
- Tránh **shared trở thành dumping ground**
- Tách rõ: Page, Business logic, UI, Data access

---

## 2. Decision (Quyết định)

Áp dụng **Feature-Based Architecture** với các nguyên tắc:

### 2.1. Cấu trúc thư mục tổng thể

```
src/
├─ app/              # Router, providers, config
├─ features/         # Feature modules
├─ shared/           # Pure reusable code
├─ locales/         # i18n
├─ assets/           # Static assets
└─ styles/           # Global styles
```

### 2.2. Feature-based structure

Mỗi feature là **một đơn vị độc lập**:

```
features/<feature-name>/
├─ api/              # API calls
├─ pages/            # Route pages
├─ components/       # UI components
├─ hooks/            # Business logic
├─ stores/           # Client state
├─ types/            # TypeScript types
├─ validators/       # Zod schemas
└─ utils/            # Helper functions
```

**Nguyên tắc:**

- Feature không import trực tiếp từ feature khác
- Feature chỉ được import từ `shared/`

### 2.3. Page vs Component

| Folder        | Trách nhiệm                |
| ------------- | -------------------------- |
| `pages/`      | Route-level, orchestration |
| `components/` | UI components              |
| `hooks/`      | Business logic             |
| `api/`        | Giao tiếp backend          |
| `stores/`     | Client state               |
| `validators/` | Schema / form validation   |

➡️ Page **KHÔNG chứa logic nghiệp vụ phức tạp**.

### 2.4. API Design

- Mỗi API use-case = 1 file
- Không gom nhiều endpoint vào 1 file lớn

```
api/
├─ login.api.ts
├─ register.api.ts
```

➡️ Tối ưu maintain & conflict-free teamwork.

### 2.5. Shared Layer

```
shared/
├─ ui/              # UI components
├─ layouts/         # Layout components
├─ lib/             # Utilities
├─ hooks/           # Shared hooks
├─ types/           # Shared types
└─ constants/       # Shared constants
```

**Shared chỉ chứa code:**

- Không phụ thuộc feature
- Không chứa business logic
- Không gọi API trực tiếp

### 2.6. Import Strategy

- ❌ Không dùng `index.ts` / `index.tsx`
- ✅ Dùng **absolute import với alias**

Ví dụ:

```typescript
import { LoginForm } from '@features/auth/components/LoginForm';
```

---

## 3. Consequences (Hệ quả)

### ✅ Positive

- Code dễ scale
- Dễ review
- Ít conflict
- Clear ownership theo feature
- Chuẩn cho micro-frontend

### ⚠️ Trade-offs

- Boilerplate nhiều hơn
- Cần rule & discipline
- Overkill cho project nhỏ

---

## 4. Alternatives Considered

| Option                                    | Lý do loại           |
| ----------------------------------------- | -------------------- |
| Layer-based (components, pages, services) | Không scale          |
| Atomic Design thuần                       | Khó quản lý business |
| Folder theo route                         | Logic lẫn UI         |

---

## 5. Decision Outcome

**Feature-based architecture được chọn làm chuẩn chính thức cho toàn bộ frontend project.**

---

## 📚 References

- [Architecture Overview](overview.md)
- [Folder Structure](folder-structure.md)
- [Team Handbook](../team-handbook.md)

---

**ADR này là nền tảng cho tất cả quyết định kiến trúc tiếp theo.**
