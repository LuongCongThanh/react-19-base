# 📁 Folder Structure

Cây thư mục chi tiết với mô tả từng folder và file.

## 📋 Mục lục

- [Cấu trúc tổng quan](#cấu-trúc-tổng-quan)
- [App Layer](#app-layer)
- [Feature Layer](#feature-layer)
- [Shared Layer](#shared-layer)
- [Other Folders](#other-folders)
- [Decision Tree](#decision-tree)

---

## 📂 Cấu trúc tổng quan

```
src/
├── app/              # App configuration
├── features/         # Feature modules
├── shared/           # Shared code
├── locales/          # i18n translations
├── assets/           # Static assets
├── styles/           # Global styles
├── tests/            # Test utilities
├── main.tsx          # Entry point
└── vite-env.d.ts     # Vite types
```

---

## 🎯 App Layer

### `src/app/`

App configuration, router, providers.

```
app/
├── app.config.ts              # App config (API URL, feature flags)
├── app.providers.tsx          # Wrap all providers
├── app.router.tsx             # Root router
├── app.query-client.ts        # TanStack Query client
├── app.store.ts               # Zustand root store
└── app.i18n.ts                # i18next config
```

**Mục đích**: Setup và cấu hình app-level.

> 📖 **Xem examples**:
>
> - `app.config.ts`: [Code Examples](../templates/code-examples.md#app-configuration)
> - `app.store.ts`: [Code Examples](../templates/code-examples.md#app-configuration)

---

## 🎨 Feature Layer

### `src/features/<feature-name>/`

Mỗi feature là một module độc lập.

```
features/
├── auth/
│   ├── api/                   # API calls
│   │   ├── login.api.ts       # POST /auth/login
│   │   ├── register.api.ts   # POST /auth/register
│   │   └── logout.api.ts      # POST /auth/logout
│   │
│   ├── pages/                 # Route pages
│   │   ├── LoginPage.tsx      # /auth/login
│   │   └── RegisterPage.tsx   # /auth/register
│   │
│   ├── components/            # UI components
│   │   ├── LoginForm.tsx      # Login form
│   │   └── RegisterForm.tsx   # Register form
│   │
│   ├── hooks/                 # Business logic
│   │   ├── useLogin.ts        # Login hook
│   │   └── useRegister.ts     # Register hook
│   │
│   ├── stores/                # Client state
│   │   └── auth.store.ts      # Auth Zustand store
│   │
│   ├── types/                 # TypeScript types
│   │   └── auth.types.ts      # Auth types
│   │
│   ├── validators/            # Zod schemas
│   │   └── auth.schema.ts     # Validation schemas
│   │
│   ├── utils/                 # Feature utils
│   │   └── token.utils.ts     # Token helpers
│   │
│   ├── constants/              # Feature constants
│   │   └── auth-query-keys.constants.ts  # Query keys
│   │
│   ├── auth.routes.tsx        # Route definitions
│   └── auth.constants.ts      # Other constants
```

### Quy tắc Feature

1. **Mỗi API endpoint = 1 file**
2. **Page chỉ orchestration**
3. **Logic nằm trong hooks**
4. **Không import feature khác**

---

## 🔧 Shared Layer

### `src/shared/`

Code dùng chung, không phụ thuộc feature.

```
shared/
├── ui/                        # UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
│
├── layouts/                   # Layout components
│   ├── RootLayout.tsx
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx
│   └── components/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/                       # Utilities
│   ├── axios.client.ts       # Axios instance
│   ├── error-handler.ts      # Error handling
│   ├── date.utils.ts         # Date utilities
│   └── cn.utils.ts           # Class names
│
├── hooks/                     # Shared hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── ...
│
├── types/                     # Shared types
│   ├── api.types.ts          # API response types
│   └── common.types.ts       # Common types
│
├── constants/                 # Shared constants
│   ├── api.constants.ts      # API endpoints
│   └── routes.constants.ts   # Route paths
│
└── hocs/                      # Higher Order Components
    ├── withAuth.tsx          # Auth guard
    └── withErrorBoundary.tsx # Error boundary
```

**Quy tắc**: Shared không import feature, không business logic.

---

## 🌐 Other Folders

### `src/locales/`

i18n translations.

```
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── ...
├── vi/
│   ├── common.json
│   ├── auth.json
│   └── ...
└── i18n.config.ts
```

### `src/assets/`

Static assets.

```
assets/
├── images/
│   ├── logo.svg
│   └── ...
├── icons/
│   └── sprite.svg
└── fonts/
    └── inter.woff2
```

### `src/styles/`

Global styles.

```
styles/
├── base/
│   ├── reset.css
│   └── typography.css
├── components/
│   └── utilities.css
├── tailwind.css
└── globals.css
```

### `src/tests/`

Test utilities.

```
tests/
├── setup.ts              # Test setup
├── test-utils.tsx        # Test helpers
└── mocks/
    ├── handlers.ts       # MSW handlers
    └── server.ts         # MSW server
```

---

## 🗺️ Decision Tree

### File này nên đặt ở đâu?

```
Có gọi API?
├─ YES → features/<feature>/api/
└─ NO → Tiếp tục

Có dùng useQuery/useMutation?
├─ YES → features/<feature>/hooks/
└─ NO → Tiếp tục

Chỉ xử lý dữ liệu (format, map, calc)?
├─ YES → features/<feature>/utils/ hoặc shared/lib/
└─ NO → Tiếp tục

Validation?
├─ YES → features/<feature>/validators/
└─ NO → Tiếp tục

UI reusable (dùng nhiều feature)?
├─ YES → shared/ui/
└─ NO → features/<feature>/components/

State cross-component?
├─ YES → features/<feature>/stores/
└─ NO → Component local state

Routing/redirect/guard?
├─ YES → app/routes/ hoặc shared/hocs/
└─ NO → Tiếp tục

Chỉ compose components?
├─ YES → features/<feature>/pages/
└─ NO → features/<feature>/components/
```

---

## 📝 Naming Conventions

### Files

| Type      | Pattern                      | Example                        |
| --------- | ---------------------------- | ------------------------------ |
| API       | `<action>.api.ts`            | `login.api.ts`                 |
| Hook      | `use<Name>.ts`               | `useLogin.ts`                  |
| Component | `<Name>.tsx`                 | `LoginForm.tsx`                |
| Page      | `<Name>Page.tsx`             | `LoginPage.tsx`                |
| Store     | `<name>.store.ts`            | `auth.store.ts`                |
| Types     | `<name>.types.ts`            | `auth.types.ts`                |
| Validator | `<name>.schema.ts`           | `auth.schema.ts`               |
| Constants | `<name>-<type>.constants.ts` | `auth-query-keys.constants.ts` |

### Folders

- **lowercase** với dấu gạch ngang: `api/`, `pages/`, `components/`
- **PascalCase** cho feature: `features/Auth/` (không khuyến nghị, dùng lowercase)

---

## ✅ Checklist

Khi tạo feature mới, đảm bảo có:

- [ ] `api/` - API calls
- [ ] `pages/` - Route pages
- [ ] `components/` - UI components
- [ ] `hooks/` - Business logic
- [ ] `types/` - TypeScript types
- [ ] `validators/` - Zod schemas
- [ ] `constants/` - Query keys và constants
- [ ] `<feature>.routes.tsx` - Route definitions

---

## 📚 Tài liệu liên quan

- [Architecture Overview](overview.md) - Tổng quan kiến trúc
- [Creating a Feature](../guides/creating-feature.md) - Hướng dẫn tạo feature
- [Code Examples](../templates/code-examples.md) - Template code

---

**Cấu trúc rõ ràng giúp code dễ tìm, dễ maintain! 🚀**
