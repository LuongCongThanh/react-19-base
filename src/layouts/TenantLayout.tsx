// src/layouts/TenantLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import type { LayoutConfig, NavigationItem, TenantInfo } from '@/types/routing';

// ===== TENANT LAYOUT COMPONENT =====

interface TenantLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  tenant?: TenantInfo;
}

export const TenantLayout: React.FC<TenantLayoutProps> = ({ 
  children, 
  config, 
  tenant 
}) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== LAYOUT CONFIG =====

  const layoutConfig: LayoutConfig = {
    type: 'TenantLayout',
    theme: {
      primaryColor: tenant?.theme?.primaryColor || '#8b5cf6',
      secondaryColor: tenant?.theme?.secondaryColor || '#6b7280',
      accentColor: tenant?.theme?.accentColor || '#f59e0b',
      backgroundColor: tenant?.theme?.backgroundColor || '#fafafa',
      textColor: tenant?.theme?.textColor || '#111827',
      fontFamily: tenant?.theme?.fontFamily || 'Inter, sans-serif',
      borderRadius: tenant?.theme?.borderRadius || '0.5rem',
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        56: '14rem',
        64: '16rem',
      },
    },
    navigation: {
      type: 'vertical',
      items: getNavigationItems(),
      collapsible: true,
      sticky: true,
      position: 'left',
    },
    header: {
      height: '4rem',
      sticky: true,
      showLogo: true,
      showUserMenu: true,
      showNotifications: true,
      showSearch: true,
      actions: getHeaderActions(),
    },
    footer: {
      height: '3rem',
      showCopyright: true,
      showLinks: true,
      links: getFooterLinks(),
      social: getSocialLinks(),
    },
    sidebar: {
      width: sidebarCollapsed ? '4rem' : '16rem',
      collapsible: true,
      collapsed: sidebarCollapsed,
      showLogo: true,
      showUserInfo: true,
      items: getNavigationItems(),
    },
    responsive: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      mobile: {
        sidebar: { collapsed: true },
        header: { showSearch: false },
      },
      tablet: {
        sidebar: { collapsed: false },
        header: { showSearch: true },
      },
      desktop: {
        sidebar: { collapsed: false },
        header: { showSearch: true },
      },
    },
    ...config,
  };

  // ===== NAVIGATION ITEMS =====

  function getNavigationItems(): NavigationItem[] {
    const baseItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/tenant/dashboard',
        icon: '📊',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 1,
      },
      {
        id: 'projects',
        label: 'Projects',
        path: '/tenant/projects',
        icon: '📁',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 2,
        children: [
          {
            id: 'projects-list',
            label: 'All Projects',
            path: '/tenant/projects',
            icon: '📋',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'projects-create',
            label: 'Create Project',
            path: '/tenant/projects/create',
            icon: '➕',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'projects-templates',
            label: 'Templates',
            path: '/tenant/projects/templates',
            icon: '📄',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'team',
        label: 'Team',
        path: '/tenant/team',
        icon: '👥',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 3,
        children: [
          {
            id: 'team-members',
            label: 'Members',
            path: '/tenant/team',
            icon: '👤',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'team-roles',
            label: 'Roles',
            path: '/tenant/team/roles',
            icon: '🔐',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'team-invitations',
            label: 'Invitations',
            path: '/tenant/team/invitations',
            icon: '📧',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/tenant/analytics',
        icon: '📈',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 4,
      },
      {
        id: 'billing',
        label: 'Billing',
        path: '/tenant/billing',
        icon: '💳',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 5,
        children: [
          {
            id: 'billing-overview',
            label: 'Overview',
            path: '/tenant/billing',
            icon: '📊',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'billing-invoices',
            label: 'Invoices',
            path: '/tenant/billing/invoices',
            icon: '🧾',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'billing-payment',
            label: 'Payment Methods',
            path: '/tenant/billing/payment',
            icon: '💳',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/tenant/settings',
        icon: '⚙️',
        roles: ['admin', 'super_admin'],
        visible: true,
        order: 6,
        children: [
          {
            id: 'settings-general',
            label: 'General',
            path: '/tenant/settings/general',
            icon: '🔧',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'settings-branding',
            label: 'Branding',
            path: '/tenant/settings/branding',
            icon: '🎨',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'settings-integrations',
            label: 'Integrations',
            path: '/tenant/settings/integrations',
            icon: '🔌',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 3,
          },
          {
            id: 'settings-security',
            label: 'Security',
            path: '/tenant/settings/security',
            icon: '🔒',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 4,
          },
        ],
      },
    ];

    // Filter items based on user permissions and tenant features
    return baseItems.filter(item => {
      if (item.roles && !item.roles.includes(user?.role || 'guest')) {
        return false;
      }
      if (item.permissions && !item.permissions.some(perm => hasPermission(perm))) {
        return false;
      }
      if (item.visible === false) {
        return false;
      }
      
      // Check tenant features
      if (tenant?.features) {
        const requiredFeature = getRequiredFeature(item.id);
        if (requiredFeature && !tenant.features.includes(requiredFeature)) {
          return false;
        }
      }
      
      return true;
    });
  }

  // ===== HEADER ACTIONS =====

  function getHeaderActions() {
    return [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: '🔔',
        action: () => console.log('Open notifications'),
        roles: ['user', 'admin', 'super_admin'],
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: '❓',
        action: () => console.log('Open help'),
        roles: ['user', 'admin', 'super_admin'],
      },
      {
        id: 'tenant-switch',
        label: 'Switch Tenant',
        icon: '🔄',
        action: () => console.log('Switch tenant'),
        roles: ['user', 'admin', 'super_admin'],
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: '🚪',
        action: logout,
        roles: ['user', 'admin', 'super_admin'],
      },
    ];
  }

  // ===== FOOTER LINKS =====

  function getFooterLinks() {
    return [
      { label: 'Privacy Policy', path: '/privacy', external: false },
      { label: 'Terms of Service', path: '/terms', external: false },
      { label: 'Help Center', path: '/help', external: false },
      { label: 'Contact Support', path: '/support', external: false },
    ];
  }

  // ===== SOCIAL LINKS =====

  function getSocialLinks() {
    return [
      { platform: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
      { platform: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
      { platform: 'GitHub', url: 'https://github.com', icon: '🐙' },
    ];
  }

  // ===== UTILITY FUNCTIONS =====

  function getRequiredFeature(itemId: string): string | null {
    const featureMap: Record<string, string> = {
      'analytics': 'analytics',
      'billing': 'billing',
      'team': 'team_management',
      'settings': 'settings',
    };
    
    return featureMap[itemId] || null;
  }

  // ===== EFFECTS =====

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      try {
        // This would typically fetch from an API
        const mockNotifications = [
          { id: 1, title: 'New team member joined', time: '2 minutes ago', unread: true },
          { id: 2, title: 'Project deadline approaching', time: '1 hour ago', unread: false },
          { id: 3, title: 'Billing update', time: '3 hours ago', unread: true },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // ===== HANDLERS =====

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log('Searching for:', query);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    // Mark as read, navigate, etc.
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          backgroundColor: tenant?.theme?.backgroundColor || '#ffffff',
        }}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            {sidebarCollapsed ? (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: tenant?.theme?.primaryColor || '#8b5cf6' }}
              >
                <span className="text-white font-bold text-sm">
                  {tenant?.name?.charAt(0).toUpperCase() || 'T'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: tenant?.theme?.primaryColor || '#8b5cf6' }}
                >
                  <span className="text-white font-bold text-sm">
                    {tenant?.name?.charAt(0).toUpperCase() || 'T'}
                  </span>
                </div>
                <span 
                  className="text-xl font-bold"
                  style={{ color: tenant?.theme?.textColor || '#111827' }}
                >
                  {tenant?.name || 'Tenant Portal'}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          {!sidebarCollapsed && user && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {getNavigationItems().map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                collapsed={sidebarCollapsed}
                theme={tenant?.theme}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header 
          className="shadow-sm border-b border-gray-200 px-6 py-4"
          style={{
            backgroundColor: tenant?.theme?.backgroundColor || '#ffffff',
            height: layoutConfig.header.height,
          }}
        >
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSidebarToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-600">
                  {sidebarCollapsed ? '☰' : '✕'}
                </span>
              </button>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-600">🔔</span>
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2024 {tenant?.name || 'Tenant Portal'}. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              {getFooterLinks().map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  className="hover:text-gray-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// ===== NAVIGATION ITEM COMPONENT =====

interface NavigationItemComponentProps {
  item: NavigationItem;
  collapsed: boolean;
  theme?: any;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  collapsed,
  theme,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
          item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        }`}
        style={{
          backgroundColor: item.active ? theme?.primaryColor + '20' : 'transparent',
          color: item.active ? theme?.primaryColor : theme?.textColor || '#374151',
        }}
      >
        <span className="text-lg">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {hasChildren && (
              <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            )}
          </>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="ml-6 mt-2 space-y-1">
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantLayout;
