// src/layouts/index.ts
export { AdminLayout } from './AdminLayout';
export { UserLayout } from './UserLayout';
export { PublicLayout } from './PublicLayout';
export { TenantLayout } from './TenantLayout';

// ===== LAYOUT REGISTRY =====

import { LayoutType } from '@/types/routing';
import { AdminLayout } from './AdminLayout';
import { UserLayout } from './UserLayout';
import { PublicLayout } from './PublicLayout';
import { TenantLayout } from './TenantLayout';

export class LayoutRegistry {
  private static layouts: Map<LayoutType, React.ComponentType<any>> = new Map();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    // Register default layouts
    this.register('AdminLayout', AdminLayout);
    this.register('UserLayout', UserLayout);
    this.register('PublicLayout', PublicLayout);
    this.register('TenantLayout', TenantLayout);

    this.initialized = true;
  }

  static register(layoutType: LayoutType, component: React.ComponentType<any>): void {
    this.layouts.set(layoutType, component);
  }

  static unregister(layoutType: LayoutType): void {
    this.layouts.delete(layoutType);
  }

  static get(layoutType: LayoutType): React.ComponentType<any> | undefined {
    return this.layouts.get(layoutType);
  }

  static getAll(): Map<LayoutType, React.ComponentType<any>> {
    return new Map(this.layouts);
  }

  static getLayoutTypes(): LayoutType[] {
    return Array.from(this.layouts.keys());
  }

  static clear(): void {
    this.layouts.clear();
    this.initialized = false;
  }
}

// Initialize layout registry
LayoutRegistry.initialize();

// ===== LAYOUT WRAPPER =====

import React from 'react';
import { LayoutRegistry } from './index';

interface LayoutWrapperProps {
  layout: LayoutType;
  children: React.ReactNode;
  config?: any;
  tenant?: any;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  layout,
  children,
  config,
  tenant,
}) => {
  const LayoutComponent = LayoutRegistry.get(layout);
  
  if (!LayoutComponent) {
    console.warn(`Layout ${layout} not found, using default layout`);
    return <div>{children}</div>;
  }

  return (
    <LayoutComponent config={config} tenant={tenant}>
      {children}
    </LayoutComponent>
  );
};

// ===== LAYOUT UTILITIES =====

export const createCustomLayout = (
  layoutType: LayoutType,
  component: React.ComponentType<any>
): void => {
  LayoutRegistry.register(layoutType, component);
};

export const getLayoutComponent = (layoutType: LayoutType): React.ComponentType<any> | undefined => {
  return LayoutRegistry.get(layoutType);
};

export const getAllLayouts = (): Map<LayoutType, React.ComponentType<any>> => {
  return LayoutRegistry.getAll();
};

// ===== EXPORT ALL =====

export * from './AdminLayout';
export * from './UserLayout';
export * from './PublicLayout';
export * from './TenantLayout';
export { default as NotFoundPage } from './NotFoundPage';
