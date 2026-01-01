# Auth Flows Documentation

## 1. Login Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginForm
    participant useLogin
    participant loginApi
    participant Backend
    participant tokenStorage
    participant authStore

    User->>LoginForm: Enter email & password
    LoginForm->>useLogin: mutate(credentials)
    useLogin->>loginApi: login(credentials)
    loginApi->>Backend: POST /auth/login
    Backend-->>loginApi: { token, refreshToken, user }
    loginApi-->>useLogin: LoginResponse
    useLogin->>tokenStorage: setToken(token)
    useLogin->>tokenStorage: setRefreshToken(refreshToken)
    useLogin->>authStore: setAuth(user, token)
    useLogin-->>LoginForm: onSuccess
    LoginForm->>User: Navigate to /dashboard
```

## 2. Register Flow

```mermaid
sequenceDiagram
    participant User
    participant RegisterForm
    participant useRegister
    participant registerApi
    participant Backend
    participant tokenStorage
    participant authStore

    User->>RegisterForm: Enter email, password, name
    RegisterForm->>useRegister: mutate(data)
    useRegister->>registerApi: register(data)
    registerApi->>Backend: POST /auth/register
    Backend-->>registerApi: { token, refreshToken, user }
    registerApi-->>useRegister: RegisterResponse
    useRegister->>tokenStorage: setToken(token)
    useRegister->>tokenStorage: setRefreshToken(refreshToken)
    useRegister->>authStore: setAuth(user, token)
    useRegister-->>RegisterForm: onSuccess
    RegisterForm->>User: Navigate to /dashboard
```

## 3. Forgot Password Flow

```mermaid
sequenceDiagram
    participant User
    participant ForgotPasswordForm
    participant useForgotPassword
    participant forgotPasswordApi
    participant Backend
    participant EmailService

    User->>ForgotPasswordForm: Enter email
    ForgotPasswordForm->>useForgotPassword: mutate({ email })
    useForgotPassword->>forgotPasswordApi: forgotPassword({ email })
    forgotPasswordApi->>Backend: POST /auth/forgot-password
    Backend->>EmailService: Send reset email with token
    EmailService-->>User: Email with reset link
    Backend-->>forgotPasswordApi: { success: true }
    forgotPasswordApi-->>useForgotPassword: Success
    useForgotPassword-->>ForgotPasswordForm: onSuccess
    ForgotPasswordForm->>User: Show success message
```

## 4. Reset Password Flow

```mermaid
sequenceDiagram
    participant User
    participant Email
    participant ResetPasswordPage
    participant useResetPassword
    participant resetPasswordApi
    participant Backend

    Email->>User: Click reset link
    User->>ResetPasswordPage: Navigate with token
    ResetPasswordPage->>ResetPasswordPage: Extract token from URL
    User->>ResetPasswordPage: Enter new password
    ResetPasswordPage->>useResetPassword: mutate({ token, password })
    useResetPassword->>resetPasswordApi: resetPassword({ token, password })
    resetPasswordApi->>Backend: POST /auth/reset-password
    Backend->>Backend: Validate token & update password
    Backend-->>resetPasswordApi: { success: true }
    resetPasswordApi-->>useResetPassword: Success
    useResetPassword-->>ResetPasswordPage: onSuccess
    ResetPasswordPage->>User: Navigate to /auth/login
```

## 5. Change Password Flow

```mermaid
sequenceDiagram
    participant User
    participant ChangePasswordForm
    participant useChangePassword
    participant changePasswordApi
    participant Backend

    User->>ChangePasswordForm: Enter current & new password
    ChangePasswordForm->>useChangePassword: mutate({ currentPassword, newPassword })
    useChangePassword->>changePasswordApi: changePassword(data)
    changePasswordApi->>Backend: POST /auth/change-password
    Note over Backend: Verify current password
    Backend->>Backend: Update password
    Backend-->>changePasswordApi: { success: true }
    changePasswordApi-->>useChangePassword: Success
    useChangePassword-->>ChangePasswordForm: onSuccess
    ChangePasswordForm->>User: Show success message
```

## 6. Verify Password Flow (Sensitive Actions)

```mermaid
sequenceDiagram
    participant User
    participant SensitiveAction
    participant VerifyPasswordDialog
    participant useVerifyPassword
    participant verifyPasswordApi
    participant Backend
    participant ActionHandler

    User->>SensitiveAction: Trigger action (e.g., change email)
    SensitiveAction->>VerifyPasswordDialog: Open dialog
    User->>VerifyPasswordDialog: Enter password
    VerifyPasswordDialog->>useVerifyPassword: mutate({ password })
    useVerifyPassword->>verifyPasswordApi: verifyPassword({ password })
    verifyPasswordApi->>Backend: POST /auth/verify-password
    Backend->>Backend: Verify password
    Backend-->>verifyPasswordApi: { verified: true, sessionToken }
    verifyPasswordApi-->>useVerifyPassword: Success
    useVerifyPassword-->>VerifyPasswordDialog: onSuccess
    VerifyPasswordDialog->>SensitiveAction: onVerified(sessionToken)
    SensitiveAction->>ActionHandler: Execute action with sessionToken
```

## 7. Token Refresh Flow

```mermaid
sequenceDiagram
    participant App
    participant httpClient
    participant Backend
    participant tokenStorage
    participant refreshApi

    App->>httpClient: API Request
    httpClient->>Backend: Request with token
    Backend-->>httpClient: 401 Unauthorized
    httpClient->>refreshApi: refreshAccessToken()
    refreshApi->>tokenStorage: getRefreshToken()
    refreshApi->>Backend: POST /auth/refresh
    Backend-->>refreshApi: { token, refreshToken }
    refreshApi->>tokenStorage: setToken(newToken)
    refreshApi->>tokenStorage: setRefreshToken(newRefreshToken)
    refreshApi-->>httpClient: newToken
    httpClient->>Backend: Retry original request
    Backend-->>httpClient: Success response
    httpClient-->>App: Response data
```

## 8. Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant LogoutButton
    participant useLogout
    participant logoutApi
    participant Backend
    participant tokenStorage
    participant authStore
    participant queryClient

    User->>LogoutButton: Click logout
    LogoutButton->>useLogout: mutate()
    useLogout->>logoutApi: logout()
    logoutApi->>Backend: POST /auth/logout
    Backend-->>logoutApi: Success
    logoutApi-->>useLogout: Success
    useLogout->>tokenStorage: clear()
    useLogout->>authStore: clearAuth()
    useLogout->>queryClient: removeQueries()
    useLogout-->>LogoutButton: onSuccess
    LogoutButton->>User: Navigate to /auth/login
```
