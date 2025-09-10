import { ROUTES } from '@/utils/constants';

// Route constants for easy access
export const ROUTE_PATHS = {
  HOME: ROUTES.HOME,
  LOGIN: ROUTES.LOGIN,
  REGISTER: ROUTES.REGISTER,
  DASHBOARD: ROUTES.DASHBOARD,
  ADMIN: ROUTES.ADMIN,
  PROFILE: ROUTES.PROFILE,
  SETTINGS: ROUTES.SETTINGS,
  NOT_FOUND: ROUTES.NOT_FOUND,
} as const;

// Route titles
export const ROUTE_TITLES = {
  [ROUTES.HOME]: 'Trang chủ',
  [ROUTES.LOGIN]: 'Đăng nhập',
  [ROUTES.REGISTER]: 'Đăng ký',
  [ROUTES.DASHBOARD]: 'Bảng điều khiển',
  [ROUTES.ADMIN]: 'Quản trị',
  [ROUTES.PROFILE]: 'Hồ sơ',
  [ROUTES.SETTINGS]: 'Cài đặt',
  [ROUTES.NOT_FOUND]: 'Không tìm thấy',
} as const;

// Route metadata
export const ROUTE_META = {
  [ROUTES.HOME]: {
    title: 'Trang chủ',
    description: 'Trang chủ của ứng dụng',
    keywords: ['trang chủ', 'home'],
  },
  [ROUTES.LOGIN]: {
    title: 'Đăng nhập',
    description: 'Đăng nhập vào hệ thống',
    keywords: ['đăng nhập', 'login'],
  },
  [ROUTES.REGISTER]: {
    title: 'Đăng ký',
    description: 'Đăng ký tài khoản mới',
    keywords: ['đăng ký', 'register'],
  },
  [ROUTES.DASHBOARD]: {
    title: 'Bảng điều khiển',
    description: 'Bảng điều khiển người dùng',
    keywords: ['bảng điều khiển', 'dashboard'],
  },
  [ROUTES.ADMIN]: {
    title: 'Quản trị',
    description: 'Bảng điều khiển quản trị',
    keywords: ['quản trị', 'admin'],
  },
} as const;
