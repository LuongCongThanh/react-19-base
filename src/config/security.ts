import { PERMISSIONS, ROLES } from '@/utils/permissions';

// Security configuration
export const SECURITY_CONFIG = {
  // Token settings
  TOKEN: {
    ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days
    CSRF_TOKEN_EXPIRY: 60 * 60, // 1 hour
  },
  
  // Rate limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW: 15 * 60, // 15 minutes
    API_REQUESTS: 100,
    API_WINDOW: 60 * 60, // 1 hour
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },
  
  // Session settings
  SESSION: {
    TIMEOUT: 30 * 60, // 30 minutes
    EXTEND_ON_ACTIVITY: true,
    MAX_CONCURRENT_SESSIONS: 3,
  },
  
  // CORS settings
  CORS: {
    ALLOWED_ORIGINS: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  },
  
  // Security headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
} as const;

// Permission mappings
export const PERMISSION_MAPPINGS = {
  // Dashboard permissions
  [PERMISSIONS.DASHBOARD_READ]: {
    name: 'Xem bảng điều khiển',
    description: 'Cho phép xem bảng điều khiển',
    category: 'dashboard',
  },
  [PERMISSIONS.DASHBOARD_WRITE]: {
    name: 'Chỉnh sửa bảng điều khiển',
    description: 'Cho phép chỉnh sửa bảng điều khiển',
    category: 'dashboard',
  },
  
  // User management permissions
  [PERMISSIONS.USER_READ]: {
    name: 'Xem người dùng',
    description: 'Cho phép xem danh sách người dùng',
    category: 'user',
  },
  [PERMISSIONS.USER_WRITE]: {
    name: 'Chỉnh sửa người dùng',
    description: 'Cho phép chỉnh sửa thông tin người dùng',
    category: 'user',
  },
  [PERMISSIONS.USER_DELETE]: {
    name: 'Xóa người dùng',
    description: 'Cho phép xóa người dùng',
    category: 'user',
  },
  
  // Admin permissions
  [PERMISSIONS.ADMIN_READ]: {
    name: 'Xem quản trị',
    description: 'Cho phép xem các chức năng quản trị',
    category: 'admin',
  },
  [PERMISSIONS.ADMIN_WRITE]: {
    name: 'Chỉnh sửa quản trị',
    description: 'Cho phép chỉnh sửa các cài đặt quản trị',
    category: 'admin',
  },
  [PERMISSIONS.ADMIN_DELETE]: {
    name: 'Xóa quản trị',
    description: 'Cho phép xóa các dữ liệu quản trị',
    category: 'admin',
  },
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [ROLES.GUEST]: {
    name: 'Khách',
    description: 'Người dùng chưa đăng nhập',
    permissions: [],
  },
  [ROLES.USER]: {
    name: 'Người dùng',
    description: 'Người dùng thông thường',
    permissions: [PERMISSIONS.DASHBOARD_READ],
  },
  [ROLES.ADMIN]: {
    name: 'Quản trị viên',
    description: 'Quản trị viên hệ thống',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.DASHBOARD_WRITE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_WRITE,
      PERMISSIONS.ADMIN_READ,
      PERMISSIONS.ADMIN_WRITE,
    ],
  },
  [ROLES.SUPER_ADMIN]: {
    name: 'Siêu quản trị viên',
    description: 'Quản trị viên cấp cao nhất',
    permissions: Object.values(PERMISSIONS),
  },
} as const;

// Security policies
export const SECURITY_POLICIES = {
  // Password policy
  PASSWORD_POLICY: {
    minLength: SECURITY_CONFIG.PASSWORD.MIN_LENGTH,
    maxLength: SECURITY_CONFIG.PASSWORD.MAX_LENGTH,
    requireUppercase: SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE,
    requireLowercase: SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE,
    requireNumbers: SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS,
    requireSymbols: SECURITY_CONFIG.PASSWORD.REQUIRE_SYMBOLS,
  },
  
  // Account lockout policy
  ACCOUNT_LOCKOUT: {
    maxFailedAttempts: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS,
    lockoutDuration: SECURITY_CONFIG.RATE_LIMIT.LOGIN_WINDOW,
  },
  
  // Session policy
  SESSION_POLICY: {
    timeout: SECURITY_CONFIG.SESSION.TIMEOUT,
    extendOnActivity: SECURITY_CONFIG.SESSION.EXTEND_ON_ACTIVITY,
    maxConcurrentSessions: SECURITY_CONFIG.SESSION.MAX_CONCURRENT_SESSIONS,
  },
} as const;
