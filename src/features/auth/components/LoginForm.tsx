import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { env } from '@shared/lib/env.validation';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { MOCK_CREDENTIALS } from '@features/auth/api/login.api.mock';
import { useLogin } from '@features/auth/hooks/useLogin';
import { loginSchema, type LoginFormData } from '@features/auth/validators/auth.schema';

export const LoginForm = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: env.VITE_USE_MOCK_API
      ? {
          email: MOCK_CREDENTIALS.email,
          password: MOCK_CREDENTIALS.password,
        }
      : undefined,
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Login failed. Please try again.',
          });
        },
        onSuccess: () => {
          navigate({ to: '/dashboard' });
        },
      });
    },
    [mutate, navigate, setError]
  );

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

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
        <Input
          {...register('password')}
          id="password"
          type="password"
          placeholder={t('passwordPlaceholder')}
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

      <div className="flex items-center justify-end">
        <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
          {t('forgotPasswordLink')}
        </Link>
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        {t('login')}
      </Button>
    </form>
  );
};
