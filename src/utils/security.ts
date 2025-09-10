import { securityService } from '@/services/auth/SecurityService';

// Re-export security utilities for convenience
export const sanitizeInput = (input: string): string => {
  return securityService.sanitizeInput(input);
};

export const sanitizeHTML = (html: string): string => {
  return securityService.sanitizeHTML(html);
};

export const generateCSRFToken = (): string => {
  return securityService.generateCSRFToken();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return securityService.validateCSRFToken(token, storedToken);
};

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return securityService.hasPermission(userPermissions, requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return securityService.hasAnyPermission(userPermissions, requiredPermissions);
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return securityService.hasAllPermissions(userPermissions, requiredPermissions);
};

export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
  return securityService.hasRole(userRoles, requiredRole);
};

export const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return securityService.hasAnyRole(userRoles, requiredRoles);
};

export const logSecurityEvent = (event: Parameters<typeof securityService.logSecurityEvent>[0]): void => {
  securityService.logSecurityEvent(event);
};
