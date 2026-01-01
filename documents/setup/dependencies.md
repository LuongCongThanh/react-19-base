# 📦 Dependencies

Danh sách đầy đủ các dependencies cho React 19 Base Project.

## 📋 Mục lục

- [Core Dependencies](#core-dependencies)
- [Dev Dependencies](#dev-dependencies)
- [Version Recommendations](#version-recommendations)

---

## Core Dependencies

> 💡 **Lưu ý**: Tất cả dependencies này cần được cài đặt trong bước 2 của [Initial Setup Guide](initial-setup.md)

### React & Build

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### TypeScript

```json
{
  "typescript": "^5.3.0"
}
```

### Routing

```json
{
  "@tanstack/react-router": "^1.0.0"
}
```

### Server State

```json
{
  "@tanstack/react-query": "^5.0.0"
}
```

### Client State

```json
{
  "zustand": "^4.4.0"
}
```

### i18n

```json
{
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0"
}
```

### Form Validation

```json
{
  "zod": "^3.22.0",
  "react-hook-form": "^7.49.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### HTTP Client

```json
{
  "axios": "^1.6.0"
}
```

### Utilities

```json
{
  "date-fns": "^3.0.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

---

## Dev Dependencies

### Build & Dev

```json
{
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```

### TypeScript Types

```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "^20.10.0"
}
```

### Styling

```json
{
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

### Linting

```json
{
  "eslint": "^8.55.0",
  "@typescript-eslint/parser": "^6.15.0",
  "@typescript-eslint/eslint-plugin": "^6.15.0",
  "eslint-plugin-react": "^7.33.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-import": "^2.29.0",
  "eslint-config-prettier": "^9.1.0"
}
```

### Formatting

```json
{
  "prettier": "^3.1.0"
}
```

### Testing

```json
{
  "jest": "^29.7.0",
  "ts-jest": "^29.2.5",
  "@types/jest": "^29.5.12",
  "jest-environment-jsdom": "^29.7.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^23.0.0",
  "msw": "^2.0.0",
  "@mswjs/data": "^0.12.0"
}
```

---

## Version Recommendations

### React 19

React 19 là version mới nhất, khuyến nghị dùng:

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### TanStack Query v5

```json
{
  "@tanstack/react-query": "^5.0.0"
}
```

### TanStack Router v1

```json
{
  "@tanstack/react-router": "^1.0.0"
}
```

---

## 📝 package.json Example

```json
{
  "name": "react-19-base",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "i18next": "^23.7.0",
    "react-i18next": "^14.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.10.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.29.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "@types/jest": "^29.5.12",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0",
    "@mswjs/data": "^0.12.0"
  }
}
```

---

## 🔄 Update Dependencies

### Kiểm tra updates

```bash
yarn outdated
```

### Update tất cả

```bash
yarn upgrade
```

### Update major versions (cẩn thận)

```bash
yarn upgrade --latest
```

---

**Lưu ý**: Luôn test kỹ sau khi update dependencies, đặc biệt là major versions.
