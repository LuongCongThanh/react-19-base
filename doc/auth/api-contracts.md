# Auth API Contracts

## Base URL

All auth endpoints are prefixed with `/auth`

## Common Headers

```
Content-Type: application/json
Accept: application/json
```

## 1. Forgot Password

### Request

```http
POST /auth/forgot-password
```

**Body:**

```json
{
  "email": "user@example.com"
}
```

**Validation:**

- `email`: Required, valid email format

### Response Success (200)

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Response Error (400)

```json
{
  "success": false,
  "code": "EMAIL_NOT_FOUND",
  "message": "Email not found"
}
```

### Response Error (429 - Rate Limit)

```json
{
  "success": false,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later."
}
```

---

## 2. Reset Password

### Request

```http
POST /auth/reset-password
```

**Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Validation:**

- `token`: Required, valid reset token
- `password`: Required, min 6 characters
- `confirmPassword`: Required, must match password

### Response Success (200)

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Response Error (400)

```json
{
  "success": false,
  "code": "INVALID_TOKEN",
  "message": "Invalid or expired reset token"
}
```

### Response Error (400 - Validation)

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "password": "Password must be at least 6 characters",
    "confirmPassword": "Passwords do not match"
  }
}
```

---

## 3. Change Password

### Request

```http
POST /auth/change-password
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Validation:**

- `currentPassword`: Required
- `newPassword`: Required, min 6 characters, different from current
- `confirmPassword`: Required, must match newPassword

### Response Success (200)

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Response Error (401)

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

### Response Error (400)

```json
{
  "success": false,
  "code": "INVALID_CURRENT_PASSWORD",
  "message": "Current password is incorrect"
}
```

### Response Error (400 - Validation)

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "newPassword": "New password must be different from current password"
  }
}
```

---

## 4. Verify Password

### Request

```http
POST /auth/verify-password
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "password": "userPassword123"
}
```

**Validation:**

- `password`: Required

### Response Success (200)

```json
{
  "success": true,
  "verified": true,
  "sessionToken": "short-lived-session-token",
  "expiresIn": 300
}
```

**Note:** `sessionToken` is valid for 5-10 minutes and should be used for sensitive actions.

### Response Error (401)

```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials"
}
```

### Response Error (400)

```json
{
  "success": false,
  "code": "INVALID_PASSWORD",
  "message": "Password is incorrect"
}
```

---

## 5. Refresh Token

### Request

```http
POST /auth/refresh
```

**Body:**

```json
{
  "refreshToken": "refresh-token-string"
}
```

### Response Success (200)

```json
{
  "token": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### Response Error (401)

```json
{
  "success": false,
  "code": "INVALID_REFRESH_TOKEN",
  "message": "Refresh token is invalid or expired"
}
```

---

## Error Codes Reference

| Code                       | HTTP Status | Description                         |
| -------------------------- | ----------- | ----------------------------------- |
| `EMAIL_NOT_FOUND`          | 400         | Email does not exist in system      |
| `RATE_LIMIT_EXCEEDED`      | 429         | Too many requests                   |
| `INVALID_TOKEN`            | 400         | Reset token is invalid or expired   |
| `VALIDATION_ERROR`         | 400         | Request validation failed           |
| `INVALID_CURRENT_PASSWORD` | 400         | Current password is incorrect       |
| `INVALID_PASSWORD`         | 400         | Password verification failed        |
| `UNAUTHORIZED`             | 401         | Authentication required or invalid  |
| `INVALID_REFRESH_TOKEN`    | 401         | Refresh token is invalid or expired |

---

## Security Considerations

1. **Reset Token**:
   - One-time use only
   - Expires in 15-30 minutes
   - Secure random generation (minimum 32 characters)

2. **Rate Limiting**:
   - Forgot Password: Max 3 requests per hour per email
   - Login: Max 5 attempts per 15 minutes per IP
   - Change Password: No rate limit (requires authentication)
   - Verify Password: Max 5 attempts per 15 minutes

3. **Password Requirements**:
   - Minimum 6 characters
   - Recommended: 8+ characters with mix of letters, numbers, symbols
   - Cannot be same as current password (for change password)

4. **Session Token** (from Verify Password):
   - Valid for 5-10 minutes
   - Should be included in sensitive action requests
   - One-time use recommended
