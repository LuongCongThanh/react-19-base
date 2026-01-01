# 📘 Team Handbook

Team rules, decision tree, và best practices cho React 19 Base Project.

## 📋 Mục lục

- [Team Principles](#team-principles)
- [Decision Tree](#decision-tree)
- [Feature Rules](#feature-rules)
- [Code Review Guidelines](#code-review-guidelines)
- [CI/CD Rules](#cicd-rules)

---

## Team Principles

### 1. Feature-First, Not File-First

Code được tổ chức theo **feature** (business domain), không theo **file type**.

### 2. Page chỉ Orchestration

Page chỉ **compose components**, không chứa business logic.

### 3. Hooks là Trung tâm Logic

Tất cả business logic nằm trong **hooks**.

### 4. Shared là Pure

Shared layer **không phụ thuộc feature**, không chứa business logic.

### 5. Convention > Preference

Tuân thủ conventions, không tự ý thay đổi.

### 6. Automation > Documentation

Tự động hóa bằng ESLint, Prettier, scripts.

> Nếu có tranh cãi → quay lại [ADR](../architecture/adr-001-architecture.md).

---

## Decision Tree

### Logic này nằm ở đâu?

| Câu hỏi                | Nằm ở đâu     |
| ---------------------- | ------------- |
| Gọi backend?           | `api/`        |
| Dùng Query?            | `hooks/`      |
| Format / map / calc?   | `utils/`      |
| Validation?            | `validators/` |
| UI reusable?           | `shared/ui`   |
| State cross-component? | `stores/`     |
| Routing / guard?       | `app/routes`  |
| Chỉ compose?           | `pages/`      |

**Rule vàng**: Nếu phân vân → KHÔNG được nằm trong Page.

---

## Feature Rules

### Feature Isolation

❌ Feature KHÔNG import feature khác

✅ Feature chỉ import:

- `shared/`
- `shared/lib/`
- `types/`

### Page Rules

Page:

- ❌ Không gọi API
- ❌ Không dùng `useQuery`
- ❌ Không validation

Page chỉ:

- ✅ Compose component
- ✅ Wire hooks
- ✅ Handle layout

### API & Query Rules

- API = 1 use-case / 1 file
- `useQuery` / `useMutation` chỉ nằm trong hooks
- Query keys phải có namespace

---

## Code Review Guidelines

### Checklist cho Reviewer

- [ ] Feature không import feature khác
- [ ] Page không chứa business logic
- [ ] API không gọi trong component
- [ ] Query key có namespace
- [ ] Code đã được format (Prettier)
- [ ] Code đã được lint (ESLint)
- [ ] Type check pass
- [ ] Tests đã viết (nếu cần)

### Checklist cho Author

- [ ] Code đã được format
- [ ] Code đã được lint
- [ ] Type check pass
- [ ] Tests đã viết và pass
- [ ] Documentation đã cập nhật (nếu cần)

---

## CI/CD Rules

### CI phải fail nếu:

- ESLint architecture fail
- Circular dependency
- Feature structure sai
- Test fail
- Type check fail

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Naming Conventions

### Files

- API: `<action>.api.ts`
- Hook: `use<Name>.ts`
- Component: `<Name>.tsx`
- Page: `<Name>Page.tsx`
- Store: `<name>.store.ts`
- Types: `<name>.types.ts`
- Validator: `<name>.schema.ts`

### Variables

- camelCase: `userName`, `isAuthenticated`
- Constants: UPPER_SNAKE_CASE: `API_BASE_URL`

---

## Import Rules

### 1. Luôn dùng Path Aliases

```typescript
// ✅ Đúng
import { Button } from '@shared/ui/Button';

// ❌ Sai
import { Button } from '../../../shared/ui/Button';
```

### 2. Không dùng Barrel Exports

```typescript
// ✅ Đúng
import { Button } from '@shared/ui/Button';

// ❌ Sai
import { Button } from '@shared/ui';
```

### 3. Feature không import feature khác

```typescript
// ❌ Sai
import { useUser } from '@features/user/hooks/useUser';

// ✅ Đúng
import { Button } from '@shared/ui/Button';
```

---

## Testing Rules

### Test Pyramid

```
E2E (Playwright)
Integration (RTL + MSW)
Unit (utils / validators / store)
```

### Quy tắc

- ❌ Không mock hook nội bộ
- ❌ Không test TanStack internals
- ✅ Mock API bằng MSW
- ✅ Test theo feature

---

## Performance Guidelines

### Code Splitting

```typescript
// Route-based splitting
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'));
```

### TanStack Query

- Dùng `staleTime` hợp lý
- Không refetch vô tội vạ
- Dùng `select` để giảm re-render

### React

- Không premature memo
- `useMemo` / `useCallback` chỉ khi cần
- Prefer composition over props drilling

---

## Security Checklist

### XSS Protection

- ❌ Không dùng `dangerouslySetInnerHTML`
- ✅ Escape user input
- ✅ Dùng trusted HTML sanitizer nếu bắt buộc

### Auth & Token

- ❌ Không lưu token trong localStorage (nếu có lựa chọn khác)
- ✅ Prefer httpOnly cookie
- ✅ Không expose token qua error/log

### API Security

- ✅ Không hardcode API URL
- ✅ Không expose internal endpoint
- ✅ Validate response shape (zod / yup)

---

## Troubleshooting

### Lỗi path aliases không hoạt động

1. Kiểm tra `tsconfig.json` có đúng `paths`
2. Kiểm tra `vite.config.ts` có đúng `resolve.alias`
3. Restart dev server

### Lỗi ESLint không nhận path aliases

1. Cài đặt `eslint-plugin-import`
2. Thêm rule `import/no-relative-parent-imports`

### Lỗi feature import feature khác

1. Kiểm tra ESLint rules
2. Di chuyển shared code vào `shared/`
3. Sử dụng store hoặc query cache để share data

---

## 📚 Tài liệu liên quan

- [Architecture Overview](architecture/overview.md)
- [Coding Conventions](guides/coding-conventions.md)
- [Creating a Feature](guides/creating-feature.md)
- [Testing Strategy](guides/testing-strategy.md)

---

**Tuân thủ handbook này giúp codebase scale và maintain dễ dàng! 🚀**
