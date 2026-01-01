import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { useVerifyPassword } from '@features/auth/hooks/useVerifyPassword';
import type { VerifyPasswordResponse } from '@features/auth/types/auth.types';
import { verifyPasswordSchema, type VerifyPasswordFormData } from '@features/auth/validators/auth.schema';

interface VerifyPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: (data: VerifyPasswordResponse) => void;
  title?: string;
  description?: string;
}

/**
 * Reusable dialog component for password verification
 *
 * Used before sensitive actions like changing email, adding payment method, etc.
 *
 * @example
 * ```tsx
 * const [showDialog, setShowDialog] = useState(false);
 *
 * <VerifyPasswordDialog
 *   open={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onVerified={(data) => {
 *     // Use data.sessionToken for sensitive action
 *     executeSensitiveAction(data.sessionToken);
 *     setShowDialog(false);
 *   }}
 *   title="Verify your password"
 *   description="Please enter your password to continue"
 * />
 * ```
 */
export const VerifyPasswordDialog = ({ open, onClose, onVerified, title, description }: VerifyPasswordDialogProps) => {
  const { t } = useTranslation('auth');
  const { mutate, isPending } = useVerifyPassword();

  const dialogTitle = title || t('verifyPassword');
  const dialogDescription = description || t('verifyPasswordDescription');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<VerifyPasswordFormData>({
    resolver: zodResolver(verifyPasswordSchema),
  });

  const onSubmit = React.useCallback(
    (data: VerifyPasswordFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Password verification failed. Please try again.',
          });
        },
        onSuccess: (response) => {
          onVerified(response);
          reset();
        },
      });
    },
    [mutate, setError, onVerified, reset]
  );

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{dialogTitle}</h2>
        <p className="mt-1 text-sm text-gray-600">{dialogDescription}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-password">{t('passwordLabel')}</Label>
            <Input
              {...register('password')}
              id="verify-password"
              type="password"
              placeholder={t('enterPassword')}
              autoFocus
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.root.message}</div>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" loading={isPending}>
              {t('verify')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
