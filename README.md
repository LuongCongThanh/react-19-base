# 🚀 React 19 Base Project

> Feature-based architecture cho React 19 + TypeScript + Vite + TanStack Query + TanStack Router

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Cấu trúc Project](#cấu-trúc-project)
- [Tài liệu](#tài-liệu)
- [Development](#development)
- [Project Status & Optimizations](#project-status--optimizations)
- [UI Components & shadcn/ui](#ui-components--shadcnui)
- [Next Steps](#next-steps)

---

## 🎯 Giới thiệu

Đây là template project React 19 với kiến trúc **Feature-Based Architecture**, được thiết kế để:

- ✅ **Scale**: Dễ thêm features mới, không bị rối code
- ✅ **Maintainable**: Code organization rõ ràng, dễ tìm và sửa
- ✅ **Type-safe**: TypeScript everywhere
- ✅ **Testable**: Mỗi phần có thể test riêng
- ✅ **Team-friendly**: Convention rõ ràng, ít conflict

---

## ⚡ Quick Start

### Yêu cầu

- Node.js >= 18
- yarn >= 1.22 (hoặc npm)

### Cài đặt

```bash
# Clone project
git clone <repository-url>
cd react-19-base

# Cài đặt dependencies
yarn install

# Chạy dev server
yarn dev
```

Mở trình duyệt tại: `http://localhost:5173`

### Tạo feature mới

```bash
# Sử dụng script tự động (khuyến nghị)
node scripts/create-feature.js <feature-name>

# Ví dụ:
node scripts/create-feature.js user-profile

# Hoặc tạo thủ công theo hướng dẫn
# Xem: docs/guides/creating-feature.md
```

> 💡 **Lưu ý**: Script sẽ tự động tạo cấu trúc thư mục và các file template cơ bản.

---

## 🛠️ Tech Stack

| Category            | Technology                   |
| ------------------- | ---------------------------- |
| **Framework**       | React 19                     |
| **Language**        | TypeScript                   |
| **Build Tool**      | Vite                         |
| **Styling**         | Tailwind CSS v4              |
| **Routing**         | TanStack Router              |
| **Server State**    | TanStack Query               |
| **Client State**    | Zustand                      |
| **i18n**            | i18next                      |
| **Form Validation** | Zod                          |
| **Testing**         | Jest + React Testing Library |
| **Linting**         | ESLint 9 + Prettier          |

---

## 📁 Cấu trúc Project

```
src/
├── app/              # App configuration (router, providers, config)
├── features/         # Feature modules (auth, dashboard, user, ...)
├── shared/           # Shared components, utils, layouts
├── locales/          # i18n translations
├── assets/           # Images, icons, fonts
├── styles/           # Global styles
└── tests/            # Test utilities
```

### Nguyên tắc cốt lõi

1. **Feature Isolation**: Mỗi feature độc lập, không import chéo
2. **Page vs Component**: Page chỉ orchestration, logic nằm trong hooks
3. **Shared là Pure**: Shared không phụ thuộc feature, không business logic
4. **API = 1 file/endpoint**: Mỗi API endpoint = 1 file riêng

> 📖 Xem chi tiết: [Architecture Overview](docs/architecture/overview.md)

---

## 📚 Tài liệu

### 🏗️ Architecture

- [Architecture Overview](docs/architecture/overview.md) - Tổng quan kiến trúc
- [Folder Structure](docs/architecture/folder-structure.md) - Cây thư mục chi tiết
- [ADR-001: Architecture Decision](docs/architecture/adr-001-architecture.md) - Quyết định kiến trúc

### 🚀 Setup & Configuration

- [Initial Setup](docs/setup/initial-setup.md) - Hướng dẫn setup từ đầu
- [Dependencies](docs/setup/dependencies.md) - Danh sách dependencies
- [Configuration](docs/setup/configuration.md) - Config files (Vite, TS, Tailwind, ESLint)
- [Environment Variables](docs/guides/environment-variables.md) - Hướng dẫn sử dụng env vars

### 📖 Guides

- [Creating a Feature](docs/guides/creating-feature.md) - Hướng dẫn tạo feature mới
- [Coding Conventions](docs/guides/coding-conventions.md) - Quy tắc viết code
- [TanStack Query](docs/guides/tanstack-query.md) - Convention cho TanStack Query
- [TanStack Router](docs/guides/tanstack-router.md) - Convention cho TanStack Router
- [Testing Strategy](docs/guides/testing-strategy.md) - Chiến lược testing
- [Environment Variables](docs/guides/environment-variables.md) - Hướng dẫn env vars
- [Quick Reference](docs/guides/quick-reference.md) - Quick reference cho common tasks

### 📝 Templates

- [Code Examples](docs/templates/code-examples.md) - Template code cho mỗi loại file
- [Feature Template](docs/templates/feature-template.md) - Template cho feature mới

### 👥 Team

- [Team Handbook](docs/team-handbook.md) - Team rules, decision tree, best practices

---

## 💻 Development

### Scripts

```bash
# Development
yarn dev              # Start dev server
yarn build            # Build for production
yarn preview          # Preview production build

# Code Quality
yarn lint             # Run ESLint
yarn format           # Format with Prettier
yarn type-check       # TypeScript type check

# Testing
yarn test             # Run tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage

# Bundle Analysis
yarn build:analyze    # Build and analyze bundle size
```

### Path Aliases

```typescript
// App setup
import { queryClient } from '@app/app.query-client';

// Features
import { LoginForm } from '@features/auth/components/LoginForm';

// Shared
import { Button } from '@shared/ui/Button';
import { formatDate } from '@shared/lib/date.utils';

// Locales
import { useTranslation } from 'react-i18next';
```

> 📖 Xem chi tiết: [Coding Conventions](docs/guides/coding-conventions.md)

### Environment Variables

Tạo file `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React 19 Base
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

> 📖 Xem chi tiết: [Environment Variables Guide](docs/guides/environment-variables.md)

---

## 🎯 Project Status & Optimizations

Project đã được tối ưu hóa toàn diện với các best practices hiện đại:

### Performance Optimizations

- ✅ **React.memo**: Đã thêm cho `DashboardCard`, `Sidebar`, `Header`, `Footer` components
- ✅ **useCallback**: Đã optimize callbacks trong `LoginForm` và `RegisterForm`
- ✅ **Lazy Loading**: Routes được lazy load với `React.lazy` và code splitting
- ✅ **Query Optimization**: Query client config với `gcTime`, `refetchOnMount`, exponential backoff
- ✅ **Route Optimization**: Index route sử dụng TanStack Router `Navigate` component

**Impact**: Giảm bundle size, tăng tốc độ load, giảm re-renders không cần thiết

### Security Improvements

- ✅ **Secure Token Storage**: Sử dụng `sessionStorage` thay vì `localStorage` (giảm XSS risk)
- ✅ **Router-Based Navigation**: Axios interceptor sử dụng router navigation thay vì `window.location.href`
- ✅ **Environment Variables Validation**: Tất cả env vars được validate với Zod schema
- ✅ **Token Refresh Mechanism**: Tự động refresh token khi gặp 401 errors

**Impact**: Bảo mật tốt hơn, UX tốt hơn với navigation không reload page

### Error Handling

- ✅ **Logger Utility**: Thay thế `console.error` với logger có nhiều log levels
- ✅ **Global Error Boundary**: Áp dụng ở root level với fallback UI
- ✅ **Consistent Error Handling**: Chuẩn hóa error handling pattern trong toàn bộ project
- ✅ **Error Logging**: Sẵn sàng tích hợp với Sentry hoặc error tracking services

**Impact**: Dễ debug hơn, error recovery tốt hơn, user experience tốt hơn

### Accessibility (a11y)

- ✅ **ARIA Attributes**: Đầy đủ ARIA labels, describedby, invalid cho Input và Button
- ✅ **Keyboard Navigation**: Focus states rõ ràng, keyboard navigation tốt
- ✅ **Skip Links**: Skip to main content link cho screen reader users
- ✅ **Loading States**: ARIA live regions cho loading và error states
- ✅ **Loading Skeletons**: Thay spinner bằng skeleton loaders

**Impact**: WCAG 2.1 AA compliance, tốt hơn cho screen readers và keyboard users

### Code Quality

- ✅ **Import Consistency**: Standardized imports (named vs namespace)
- ✅ **Internationalization**: Tất cả hardcoded strings đã được i18n
- ✅ **JSDoc Comments**: Đầy đủ JSDoc cho public APIs (components, hooks)
- ✅ **Type Safety**: Branded types cho IDs và tokens, utility types

**Impact**: Code dễ đọc hơn, maintainable hơn, type-safe hơn

### Testing

- ✅ **Unit Tests**: Tests cho utilities (`cn.utils`, `useDebounce`, `useLocalStorage`)
- ✅ **Component Tests**: Tests cho `LoginForm` component
- ✅ **Integration Tests**: Tests cho full login flow với MSW

**Impact**: Code reliability cao hơn, dễ refactor hơn

### Bundle Optimization

- ✅ **Code Splitting**: Lazy loading routes với manual chunks
  - `react-vendor`: React và React DOM
  - `router-vendor`: TanStack Router
  - `query-vendor`: TanStack Query
  - `form-vendor`: React Hook Form và Zod
- ✅ **Bundle Analyzer**: Setup `rollup-plugin-visualizer` để monitor bundle size

**Impact**: Bundle size nhỏ hơn, load time nhanh hơn

### Type Safety

- ✅ **Branded Types**: `EntityId`, `AccessToken`, `RefreshToken` để tránh type errors
- ✅ **Utility Types**: `DeepPartial`, `DeepRequired`, `ValueOf`, `ApiResponse`, etc.
- ✅ **Improved Type Definitions**: Cải thiện types trong auth và dashboard features

**Impact**: Type safety tốt hơn, developer experience tốt hơn

### Additional Features

- ✅ **Token Refresh**: Automatic token refresh mechanism với request queueing
- ✅ **JSDoc Documentation**: Comprehensive JSDoc comments cho tất cả public APIs
- ✅ **Integration Tests**: End-to-end tests cho user flows

---

## 🎨 UI Components & shadcn/ui

### Current UI Components

Project hiện có các shared components:

- **Button**: Với variants (primary, secondary, outline) và sizes (sm, md, lg)
- **Input**: Với label, error handling, và ARIA attributes đầy đủ

### shadcn/ui Setup

✅ **Đã setup sẵn sàng**:

- `components.json` - Config file cho shadcn/ui CLI
- CSS variables trong `src/styles/tailwind.css` cho shadcn/ui theme (light & dark mode)
- `cn()` utility function đã có sẵn

### Khuyến nghị: Nên tích hợp shadcn/ui

**Lý do:**

1. Project hiện chỉ có 2 UI components (Button, Input)
2. Sẽ cần thêm nhiều components (Modal, Select, Dialog, Table, Card, etc.)
3. shadcn/ui phù hợp với architecture (copy vào `src/shared/ui/`)
4. Tiết kiệm thời gian phát triển UI
5. Accessibility tốt (ARIA attributes đầy đủ)
6. Dễ customize theo brand identity
7. Tương thích với stack hiện tại:
   - ✅ React 19
   - ✅ Tailwind CSS v4
   - ✅ TypeScript
   - ✅ Đã có `cn()` utility

### Cách sử dụng shadcn/ui

1. **Cài đặt components cần thiết:**

   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add input
   npx shadcn@latest add dialog
   npx shadcn@latest add select
   npx shadcn@latest add card
   npx shadcn@latest add table
   ```

2. **Lưu ý:**
   - Components sẽ được copy vào `src/shared/ui/`
   - Có thể customize trực tiếp trong source code
   - Chỉ add components cần thiết (không add tất cả)
   - Update components khi có version mới

3. **Dependencies sẽ được thêm tự động:**
   - `@radix-ui/*` (cho các components phức tạp)
   - `class-variance-authority` (cho variant management)
   - `lucide-react` (cho icons, optional)

---

## 🎯 Next Steps

### Recommended

1. **Error Tracking**: Integrate Sentry hoặc error tracking service với logger utility
2. **E2E Testing**: Setup Playwright hoặc Cypress cho end-to-end testing
3. **Performance Monitoring**: Thêm performance metrics tracking
4. **PWA Support**: Thêm service worker và manifest
5. **Complete i18n**: Hoàn thiện i18n cho tất cả strings

### Optional

1. **JWT Decoding**: Implement proper JWT decoding trong `shouldRefreshToken()` để check expiration
2. **CSRF Protection**: Thêm CSRF token handling nếu cần
3. **Add shadcn/ui Components**: Thêm các components cần thiết từ shadcn/ui

---

## 📊 Project Metrics

### Code Quality

- ✅ **ESLint**: 0 warnings
- ✅ **TypeScript**: 0 errors
- ✅ **Test Coverage**: Unit tests, component tests, integration tests đã có

### Performance

- ✅ **Code Splitting**: Lazy loading routes
- ✅ **Bundle Size**: Monitor với bundle analyzer
- ✅ **Memoization**: React.memo và useCallback optimizations

### Security

- ✅ **Token Storage**: Secure với sessionStorage
- ✅ **Environment Validation**: Zod schema validation
- ✅ **Router Navigation**: Không dùng window.location.href

### Accessibility

- ✅ **ARIA Support**: Đầy đủ ARIA attributes
- ✅ **Keyboard Navigation**: Focus states và skip links
- ✅ **Screen Reader**: ARIA live regions

---

## 📄 License

MIT

---

## 🤝 Contributing

Xem [Team Handbook](docs/team-handbook.md) để biết quy tắc contribute.

---

**Happy Coding! 🚀**
