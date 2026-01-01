import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';

import { useRegister } from '@features/auth/hooks/useRegister';
import { registerSchema, type RegisterFormData } from '@features/auth/validators/auth.schema';

export const RegisterForm = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      mutate(data, {
        onError: (error) => {
          setError('root', {
            message: error.message || 'Registration failed. Please try again.',
          });
        },
        onSuccess: () => {
          navigate({ to: '/' });
        },
      });
    },
    [mutate, navigate, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          {...register('name')}
          id="name"
          type="text"
          placeholder={t('namePlaceholder')}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-600" role="alert" aria-live="polite">
            {errors.name.message}
          </p>
        )}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
        <Input
          {...register('confirmPassword')}
          id="confirmPassword"
          type="password"
          placeholder={t('confirmPasswordPlaceholder')}
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
        {t('register')}
      </Button>
    </form>
  );
};
