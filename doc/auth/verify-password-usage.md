# Verify Password Usage Guide

## Overview

The `VerifyPasswordDialog` component is used to verify a user's password before performing sensitive actions. This adds an extra layer of security for operations like:

- Changing email address
- Adding/removing payment methods
- Canceling orders
- Deleting account
- Changing sensitive account settings

## Basic Usage

```tsx
import { useState } from 'react';
import { VerifyPasswordDialog } from '@features/auth/components/VerifyPasswordDialog';
import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';

function SensitiveActionComponent() {
  const [showDialog, setShowDialog] = useState(false);

  const handleVerified = (data: VerifyPasswordResponse) => {
    // Use sessionToken for the sensitive action
    executeSensitiveAction(data.sessionToken);
    setShowDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Change Email</button>

      <VerifyPasswordDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onVerified={handleVerified}
        title="Verify Password"
        description="Please enter your password to change your email address"
      />
    </>
  );
}
```

## Example: Change Email

```tsx
import { useState } from 'react';
import { VerifyPasswordDialog } from '@features/auth/components/VerifyPasswordDialog';
import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';
import { changeEmailApi } from './api/change-email.api';

function ChangeEmailForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleChangeEmail = async (sessionToken: string) => {
    try {
      await changeEmailApi.changeEmail({
        newEmail,
        sessionToken, // Include session token from verification
      });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  const handleVerified = (data: VerifyPasswordResponse) => {
    if (data.sessionToken) {
      handleChangeEmail(data.sessionToken);
    }
    setShowDialog(false);
  };

  return (
    <>
      <form>
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email" />
        <button type="button" onClick={() => setShowDialog(true)}>
          Change Email
        </button>
      </form>

      <VerifyPasswordDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onVerified={handleVerified}
        title="Verify Password"
        description="Please enter your password to change your email address"
      />
    </>
  );
}
```

## Example: Add Payment Method

```tsx
import { useState } from 'react';
import { VerifyPasswordDialog } from '@features/auth/components/VerifyPasswordDialog';
import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';
import { addPaymentMethodApi } from './api/payment.api';

function AddPaymentMethodForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handleAddPaymentMethod = async (sessionToken: string) => {
    try {
      await addPaymentMethodApi.add({
        cardNumber,
        sessionToken, // Include session token from verification
      });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  const handleVerified = (data: VerifyPasswordResponse) => {
    if (data.sessionToken) {
      handleAddPaymentMethod(data.sessionToken);
    }
    setShowDialog(false);
  };

  return (
    <>
      <form>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="Card number"
        />
        <button type="button" onClick={() => setShowDialog(true)}>
          Add Payment Method
        </button>
      </form>

      <VerifyPasswordDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onVerified={handleVerified}
        title="Verify Password"
        description="Please enter your password to add a payment method"
      />
    </>
  );
}
```

## Props

| Prop          | Type                                     | Required | Description                                                            |
| ------------- | ---------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `open`        | `boolean`                                | Yes      | Controls dialog visibility                                             |
| `onClose`     | `() => void`                             | Yes      | Called when dialog is closed                                           |
| `onVerified`  | `(data: VerifyPasswordResponse) => void` | Yes      | Called when password is verified successfully                          |
| `title`       | `string`                                 | No       | Dialog title (default: "Verify Password")                              |
| `description` | `string`                                 | No       | Dialog description (default: "Please enter your password to continue") |

## VerifyPasswordResponse

```typescript
interface VerifyPasswordResponse {
  success: boolean;
  verified: boolean;
  sessionToken?: string; // Use this for sensitive actions
  expiresIn?: number; // Session token expiration in seconds (typically 300-600)
}
```

## Security Best Practices

1. **Always use sessionToken**: Include the `sessionToken` in requests for sensitive actions
2. **Check expiration**: The session token expires in 5-10 minutes. Handle expiration gracefully
3. **One-time use**: Consider implementing one-time use for session tokens on the backend
4. **Rate limiting**: The verify password endpoint has rate limiting (max 5 attempts per 15 minutes)
5. **Clear on error**: Clear the dialog state on verification failure

## Error Handling

```tsx
const handleVerified = (data: VerifyPasswordResponse) => {
  if (!data.sessionToken) {
    // Handle missing session token
    return;
  }

  // Check if session token is still valid
  if (data.expiresIn && data.expiresIn <= 0) {
    // Session expired, show error
    return;
  }

  // Proceed with sensitive action
  executeSensitiveAction(data.sessionToken);
};
```

## Notes

- The dialog automatically resets form state when closed
- Password field is auto-focused when dialog opens
- Loading state is handled automatically during verification
- Error messages are displayed inline
