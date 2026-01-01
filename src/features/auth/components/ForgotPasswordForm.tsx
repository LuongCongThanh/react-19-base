import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { useForgotPassword } from '@features/auth/hooks/useForgotPassword';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@features/auth/validators/auth.schema';

export const ForgotPasswordForm = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate, isPending } = useForgotPassword();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = useCallback(
    (data: ForgotPasswordFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Failed to send reset email. Please try again.',
          });
        },
        onSuccess: () => {
          setIsSuccess(true);
        },
      });
    },
    [mutate, setError]
  );

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-green-800">
          <p className="font-medium">{t('emailSent')}</p>
          <p className="mt-1 text-sm">{t('emailSentDescription')}</p>
        </div>
        <Button onClick={() => navigate({ to: '/auth/login' })} className="w-full" variant="outline">
          {t('backToLogin')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.email.message}
          </p>
        )}
      </div>

      {errors.root && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.root.message}</div>}

      <Button type="submit" loading={isPending} className="w-full">
        {t('sendResetLink')}
      </Button>

      <div className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:underline">
          {t('backToLogin')}
        </Link>
      </div>
    </form>
  );
};
