# 🔐 Environment Variables

Hướng dẫn sử dụng environment variables trong React 19 Base Project.

## 📋 Mục lục

- [Cấu hình](#cấu-hình)
- [Sử dụng trong Code](#sử-dụng-trong-code)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

> 💡 **Lưu ý**: File `environment.d.ts` cần được tạo trong Bước 11 của [Initial Setup Guide](../setup/initial-setup.md#bước-11-setup-axios-client)

---

## Cấu hình

### Tạo file `.env.local`

Tạo file `.env.local` ở root của project:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React 19 Base
VITE_APP_VERSION=1.0.0
```

### Tạo file `.env.example`

Tạo file `.env.example` để commit vào git (không có giá trị thực):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React 19 Base
VITE_APP_VERSION=1.0.0
```

### Thêm vào `.gitignore`

Đảm bảo `.env.local` đã có trong `.gitignore`:

```
.env.local
.env*.local
```

---

## Sử dụng trong Code

### Trong TypeScript/JavaScript

```typescript
// Lấy environment variable
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Với default value
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

### Trong Axios Client

```typescript
// src/shared/lib/axios.client.ts
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});
```

### Type Safety

Tạo file `src/shared/types/environment.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Best Practices

### 1. Prefix với VITE\_

Vite chỉ expose các biến có prefix `VITE_`:

```env
✅ Đúng: VITE_API_BASE_URL
❌ Sai: API_BASE_URL (không được expose)
```

### 2. Không commit secrets

```env
❌ Sai: VITE_SECRET_KEY=abc123 (không commit)
✅ Đúng: VITE_API_BASE_URL (có thể commit vào .env.example)
```

### 3. Sử dụng .env.example

Luôn có `.env.example` với structure nhưng không có giá trị thực:

```env
VITE_API_BASE_URL=
VITE_APP_NAME=
```

### 4. Default values

Luôn có default value trong code:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

---

## Troubleshooting

### Biến không được expose

**Nguyên nhân**: Thiếu prefix `VITE_`

**Giải pháp**: Thêm prefix `VITE_` vào tên biến

```env
# ❌ Sai
API_BASE_URL=http://localhost:3000/api

# ✅ Đúng
VITE_API_BASE_URL=http://localhost:3000/api
```

### Biến là undefined

**Nguyên nhân**: Chưa restart dev server sau khi thêm biến mới

**Giải pháp**: Restart dev server

```bash
# Stop server (Ctrl+C)
# Start lại
yarn dev
```

### TypeScript error

**Nguyên nhân**: Chưa define types cho env variables

**Giải pháp**: Tạo file `environment.d.ts` như trên

---

## 📚 Tài liệu liên quan

- [Initial Setup](setup/initial-setup.md)
- [Configuration](setup/configuration.md)
- [Axios Client](../templates/code-examples.md#axios-client)

---

**Environment variables giúp quản lý config dễ dàng! 🚀**
