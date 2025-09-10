// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation (Vietnamese format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation helpers
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [field, value] of Object.entries(data)) {
    const fieldRules = rules[field];
    if (!fieldRules) {continue;}

    const fieldErrors: string[] = [];

    // Required validation
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push('Trường này là bắt buộc');
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
      continue;
    }

    // Min length validation
    if (fieldRules.minLength && value.toString().length < fieldRules.minLength) {
      fieldErrors.push(`Tối thiểu ${fieldRules.minLength} ký tự`);
    }

    // Max length validation
    if (fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
      fieldErrors.push(`Tối đa ${fieldRules.maxLength} ký tự`);
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value.toString())) {
      fieldErrors.push('Định dạng không hợp lệ');
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => !isValidEmail(value) ? 'Email không hợp lệ' : null
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = isValidPassword(value);
      return result.isValid ? null : result.errors[0];
    }
  },
  phone: {
    required: true,
    custom: (value: string) => !isValidPhoneNumber(value) ? 'Số điện thoại không hợp lệ' : null
  },
  required: {
    required: true
  }
};
