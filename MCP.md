# AI Context: React TypeScript Vite Project Structure

> **Purpose**: This file provides context for AI assistants to understand the codebase architecture, patterns, and conventions.

## 🏗️ Project Architecture Overview

**Tech Stack**: React 18 + TypeScript + Vite + Redux Toolkit + Tailwind CSS + React Router + i18next

**Architecture Pattern**: Feature-driven development with centralized state management

## 📁 Directory Structure & Patterns

```
src/
├── pages/                    # Feature-based organization
│   └── auth/                # Authentication feature
│       ├── components/       # Feature-specific UI components
│       ├── hooks/           # Custom hooks for this feature
│       ├── services/        # API calls (authService.ts)
│       ├── slices/          # Redux state (authSlice.ts)
│       └── types/           # TypeScript definitions
├── components/
│   ├── ui/                  # Reusable UI components (Button, Input)
│   └── layout/              # App shell components (Header, Sidebar)
├── store/                   # Redux store configuration
├── routes/                  # Routing configuration
├── services/                # Shared API services
├── types/                   # Global type definitions
├── utils/                   # Utility functions
├── hooks/                   # Shared custom hooks
├── config/                  # App configuration (axios.ts)
└── i18n.ts                  # Internationalization setup
```

## 🎯 Key Patterns for AI Understanding

### 1. Feature Organization Pattern

```typescript
// When AI sees: src/pages/[featureName]/
// Understand: This is a self-contained feature module with:
// - components/ (UI specific to this feature)
// - hooks/ (business logic hooks like useLogin, useRegister)
// - services/ (API calls like authService.login())
// - slices/ (Redux state like authSlice with user, token, isAuthenticated)
// - types/ (TypeScript interfaces for this feature)
```

### 2. State Management Pattern

```typescript
// Redux Toolkit with createSlice pattern
// Location: src/pages/[feature]/slices/[feature]Slice.ts
// Contains: initialState, reducers, extraReducers for async thunks
// Example: authSlice manages { user, token, isAuthenticated, loading }
```

### 3. API Service Pattern

```typescript
// Location: src/pages/[feature]/services/[feature]Service.ts
// Pattern: Uses configured axios instance from src/config/axios.ts
// Returns: Promise with typed response
// Example: authService.login(credentials) → { user, token }
```

### 4. Component Patterns

```typescript
// UI Components: src/components/ui/ (Button, Input, Modal)
// Layout Components: src/components/layout/ (Header, Footer, Sidebar)
// Feature Components: src/pages/[feature]/components/ (LoginForm, RegisterForm)
// Naming: PascalCase.tsx
// Props: Always typed with [ComponentName]Props interface
```

### 5. Routing Pattern

```typescript
// Configuration: src/routes/index.ts (main route definitions)
// Path Constants: src/routes/pathConfig.ts (centralized path strings)
// Guards: src/routes/customPrivateRoute.tsx (auth protection)
// Pattern: React Router v6 with nested routes
```

## 🧠 AI Decision Making Guide

### When generating code, follow these patterns:

**For new features:**

1. Create folder in `src/pages/[featureName]/`
2. Add subfolders: `components/`, `hooks/`, `services/`, `slices/`, `types/`
3. Define types first in `types/[featureName].ts`
4. Create service with axios calls
5. Create Redux slice with async thunks
6. Build components using the slice state
7. Add routes to `src/routes/index.ts`

**For components:**

- Use TypeScript with proper Props interface
- Import from `@/` (alias for src/)
- Use Tailwind for styling
- Use `useTranslation` for text content
- Access Redux state with `useSelector`
- Dispatch actions with `useDispatch`

**For API calls:**

- Always use the configured axios instance from `src/config/axios.ts`
- Handle errors consistently
- Return typed responses
- Use async/await pattern

**For styling:**

- Prefer Tailwind utility classes
- Create reusable class combinations for common patterns
- Use responsive design classes (sm:, md:, lg:, xl:)
- Follow consistent spacing and color schemes

## 🔍 Code Context Clues

### File Import Patterns:

```typescript
// These imports tell you about the architecture:
import { useSelector, useDispatch } from 'react-redux'; // Redux usage
import { useTranslation } from 'react-i18next'; // i18n usage
import { Navigate } from 'react-router-dom'; // Routing
import { User } from '@/types/user'; // Global types
import { useLogin } from './hooks/useLogin'; // Feature hook
import authService from './services/authService'; // API service
```

### Component Structure Patterns:

```typescript
// Typical feature component structure:
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation('auth'); // i18n
  const dispatch = useDispatch(); // Redux
  const { login, isLoading } = useLogin(); // Custom hook

  // Component logic...

  return (
    // JSX with Tailwind classes
  );
};
```

## 📋 Naming Conventions for AI

| Type       | Pattern                    | Example             |
| ---------- | -------------------------- | ------------------- |
| Components | PascalCase                 | `LoginForm.tsx`     |
| Hooks      | camelCase + use prefix     | `useLogin.ts`       |
| Services   | camelCase + Service suffix | `authService.ts`    |
| Slices     | camelCase + Slice suffix   | `authSlice.ts`      |
| Types      | PascalCase                 | `User`, `AuthState` |
| Constants  | UPPER_SNAKE_CASE           | `API_BASE_URL`      |

## 🎯 Common AI Tasks & Context

### "Add authentication to a component"

- Check if component is in `src/routes/customPrivateRoute.tsx`
- Use `useSelector` to get auth state from `authSlice`
- Redirect to login if not authenticated
- Access user data from Redux state

### "Create a new feature"

- Follow the folder structure in `src/pages/[featureName]/`
- Start with types, then service, then slice, then components
- Add routes to routing configuration
- Add i18n keys to `public/locales/*/[featureName].json`

### "Style a component"

- Use Tailwind CSS utility classes
- Check existing components for consistent patterns
- Use responsive design classes for mobile-first approach
- Consider dark mode classes if theme switching is implemented

### "Handle API errors"

- Errors are handled in axios interceptors (`src/config/axios.ts`)
- Components should handle loading states from Redux
- Use consistent error message patterns with i18n

## 🔗 Integration Points

**Redux Store**: All async operations go through Redux Toolkit slices
**i18n**: All user-facing text should use translation keys  
**Routing**: Protected routes use authentication state
**API**: Centralized axios configuration with interceptors
**Theming**: Context-based theme switching (light/dark)

---

_This context helps AI understand the codebase patterns and make consistent suggestions aligned with the existing architecture._
