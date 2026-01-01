import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { useResetPassword } from '@features/auth/hooks/useResetPassword';
import { resetPasswordSchema, type ResetPasswordFormData } from '@features/auth/validators/auth.schema';

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = useCallback(
    (data: ResetPasswordFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Failed to reset password. Please try again.',
          });
        },
        onSuccess: () => {
          navigate({ to: '/auth/login' });
        },
      });
    },
    [mutate, navigate, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t('newPassword')}</Label>
        <Input
          {...register('password')}
          id="password"
          type="password"
          placeholder={t('enterNewPassword')}
          aria-invalid={errors.password ? 'true' : undefined}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
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
        {t('resetPassword')}
      </Button>
    </form>
  );
};
