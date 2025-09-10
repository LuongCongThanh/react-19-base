// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    AVATAR: '/user/avatar',
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    TENANTS: '/admin/tenants',
    TENANT_DETAIL: '/admin/tenants/:id',
    SYSTEM_SETTINGS: '/admin/settings',
  },
  TENANT: {
    INFO: '/tenant/info',
    SETTINGS: '/tenant/settings',
    MEMBERS: '/tenant/members',
    FEATURES: '/tenant/features',
  },
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TENANT_DATA: 'tenant_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language constants
export const LANGUAGES = {
  VI: 'vi',
  EN: 'en',
  FR: 'fr',
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Form validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Truy cập bị từ chối',
  NOT_FOUND: 'Không tìm thấy tài nguyên',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  SERVER_ERROR: 'Lỗi máy chủ',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  SAVE_SUCCESS: 'Lưu thành công',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
