import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { useChangePassword } from '@features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordFormData } from '@features/auth/validators/auth.schema';

export const ChangePasswordForm = () => {
  const { t } = useTranslation('auth');
  const { mutate, isPending } = useChangePassword();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = useCallback(
    (data: ChangePasswordFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Failed to change password. Please try again.',
          });
        },
        onSuccess: () => {
          setIsSuccess(true);
          reset();
          // Hide success message after 3 seconds
          setTimeout(() => setIsSuccess(false), 3000);
        },
      });
    },
    [mutate, setError, reset]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuccess && (
        <div className="rounded-md bg-green-50 p-3 text-green-800 text-sm">{t('passwordChangedSuccess')}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
        <Input
          {...register('currentPassword')}
          id="currentPassword"
          type="password"
          placeholder={t('enterCurrentPassword')}
          aria-invalid={errors.currentPassword ? 'true' : undefined}
          aria-describedby={errors.currentPassword ? 'current-password-error' : undefined}
        />
        {errors.currentPassword && (
          <p id="current-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('newPasswordLabel')}</Label>
        <Input
          {...register('newPassword')}
          id="newPassword"
          type="password"
          placeholder={t('enterNewPasswordPlaceholder')}
          aria-invalid={errors.newPassword ? 'true' : undefined}
          aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
        />
        {errors.newPassword && (
          <p id="new-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmNewPasswordLabel')}</Label>
        <Input
          {...register('confirmPassword')}
          id="confirmPassword"
          type="password"
          placeholder={t('confirmNewPasswordPlaceholder')}
          aria-invalid={errors.confirmPassword ? 'true' : undefined}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.root.message}</div>}

      <Button type="submit" loading={isPending} className="w-full">
        {t('changePassword')}
      </Button>
    </form>
  );
};
