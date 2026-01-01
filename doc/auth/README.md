# Auth System Documentation

## Overview

Complete authentication system for E-commerce Store with all standard auth features including login, register, password management, and security verification.

## Features

### Core Auth

- ✅ **Login** - User authentication with email/password
- ✅ **Register** - New user registration
- ✅ **Logout** - Session termination

### Password Management

- ✅ **Forgot Password** - Request password reset via email
- ✅ **Reset Password** - Set new password with reset token
- ✅ **Change Password** - Update password when logged in
- ✅ **Verify Password** - Verify password for sensitive actions

### Security

- ✅ **Access Token** - Short-lived JWT tokens
- ✅ **Refresh Token** - Long-lived tokens for automatic refresh
- ✅ **Token Refresh** - Automatic token refresh on 401 errors
- ✅ **Secure Storage** - SessionStorage for token storage

## Architecture

### File Structure

```
src/features/auth/
├── api/                    # API layer
│   ├── login.api.ts
│   ├── register.api.ts
│   ├── logout.api.ts
│   ├── forgot-password.api.ts
│   ├── reset-password.api.ts
│   ├── change-password.api.ts
│   ├── verify-password.api.ts
│   └── *.api.mock.ts      # Mock implementations
├── components/             # UI components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── ChangePasswordForm.tsx
│   └── VerifyPasswordDialog.tsx
├── hooks/                  # React hooks
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useLogout.ts
│   ├── useForgotPassword.ts
│   ├── useResetPassword.ts
│   ├── useChangePassword.ts
│   └── useVerifyPassword.ts
├── pages/                  # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── stores/                 # State management
│   └── auth.store.ts
├── types/                  # TypeScript types
│   └── auth.types.ts
└── validators/            # Validation schemas
    └── auth.schema.ts
```

## Usage Examples

### Login

```tsx
import { useLogin } from '@features/auth/hooks/useLogin';

function LoginComponent() {
  const { mutate, isPending } = useLogin();

  const handleLogin = () => {
    mutate(
      { email: 'user@example.com', password: 'password123' },
      {
        onSuccess: () => navigate({ to: '/dashboard' }),
        onError: (error) => showError(error.message),
      }
    );
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Forgot Password

```tsx
import { useForgotPassword } from '@features/auth/hooks/useForgotPassword';

function ForgotPasswordComponent() {
  const { mutate, isPending } = useForgotPassword();

  const handleForgotPassword = () => {
    mutate(
      { email: 'user@example.com' },
      {
        onSuccess: () => showSuccess('Reset email sent'),
        onError: (error) => showError(error.message),
      }
    );
  };

  return <button onClick={handleForgotPassword}>Send Reset Link</button>;
}
```

### Verify Password (Sensitive Actions)

```tsx
import { useState } from 'react';
import { VerifyPasswordDialog } from '@features/auth/components/VerifyPasswordDialog';
import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';

function SensitiveActionComponent() {
  const [showDialog, setShowDialog] = useState(false);

  const handleVerified = (data: VerifyPasswordResponse) => {
    // Use sessionToken for sensitive action
    executeSensitiveAction(data.sessionToken);
    setShowDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Change Email</button>
      <VerifyPasswordDialog open={showDialog} onClose={() => setShowDialog(false)} onVerified={handleVerified} />
    </>
  );
}
```

## API Contracts

See [API Contracts Documentation](./api-contracts.md) for detailed request/response formats.

## Auth Flows

See [Auth Flows Documentation](./auth-flows.md) for visual flow diagrams.

## Security Considerations

1. **Reset Tokens**: One-time use, expire in 15-30 minutes
2. **Session Tokens**: Valid for 5-10 minutes for sensitive actions
3. **Rate Limiting**:
   - Forgot Password: Max 3 requests/hour
   - Login: Max 5 attempts/15 minutes
   - Verify Password: Max 5 attempts/15 minutes
4. **Password Requirements**: Minimum 6 characters (recommended: 8+ with complexity)
5. **Token Storage**: SessionStorage (cleared on tab close)

## Testing

All hooks have unit tests. Run tests with:

```bash
npm run test -- src/features/auth
```

## Related Documentation

- [Auth Flows](./auth-flows.md) - Visual flow diagrams
- [API Contracts](./api-contracts.md) - API request/response formats
- [Verify Password Usage](./verify-password-usage.md) - How to use VerifyPasswordDialog
