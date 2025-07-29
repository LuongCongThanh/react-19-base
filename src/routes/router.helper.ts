/**
 * Helper cho router
 * - Lọc route theo role
 * - Có thể mở rộng thêm các hàm xử lý route động
 */
import { type AppRouteItem, type RouteRole, ROUTES } from '@/routes/pathConfig';

export const filterRoutesByRole = (role: RouteRole): AppRouteItem[] => {
  return ROUTES.filter((route) => !route.roles || route.roles.includes(role));
};
