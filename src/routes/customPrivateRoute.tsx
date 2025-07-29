import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component bảo vệ route (Private Route)
 * - Kiểm tra quyền truy cập (đăng nhập, đúng role)
 * - Nếu không đủ quyền, tự động redirect
 */
interface CustomPrivateRouteProps {
  check: boolean;
  redirectPath: string;
  children?: React.ReactNode;
}

const CustomPrivateRoute: React.FC<CustomPrivateRouteProps> = ({ check, redirectPath, children }) => {
  if (check) {
    return children ? <>{children}</> : <Outlet />;
  }
  return <Navigate to={redirectPath} replace />;
};

export default CustomPrivateRoute;
