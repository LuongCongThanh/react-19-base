// src/layouts/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import type { LayoutConfig, NavigationItem, HeaderAction } from '@/types/routing';

// ===== ADMIN LAYOUT COMPONENT =====

interface AdminLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, config }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== LAYOUT CONFIG =====

  const layoutConfig: LayoutConfig = {
    type: 'AdminLayout',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '0.5rem',
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
        path: '/admin/dashboard',
        icon: '📊',
        roles: ['admin', 'super_admin'],
        visible: true,
        order: 1,
      },
      {
        id: 'users',
        label: 'User Management',
        path: '/admin/users',
        icon: '👥',
        roles: ['admin', 'super_admin'],
        permissions: ['admin:users:read'],
        visible: true,
        order: 2,
        children: [
          {
            id: 'users-list',
            label: 'All Users',
            path: '/admin/users',
            icon: '📋',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'users-roles',
            label: 'Roles & Permissions',
            path: '/admin/users/roles',
            icon: '🔐',
            roles: ['admin', 'super_admin'],
            permissions: ['admin:roles:read'],
            visible: true,
            order: 2,
          },
          {
            id: 'users-groups',
            label: 'User Groups',
            path: '/admin/users/groups',
            icon: '👥',
            roles: ['admin', 'super_admin'],
            permissions: ['admin:groups:read'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'content',
        label: 'Content Management',
        path: '/admin/content',
        icon: '📝',
        roles: ['admin', 'super_admin', 'moderator'],
        permissions: ['admin:content:read'],
        visible: true,
        order: 3,
        children: [
          {
            id: 'content-posts',
            label: 'Posts',
            path: '/admin/content/posts',
            icon: '📄',
            roles: ['admin', 'super_admin', 'moderator'],
            visible: true,
            order: 1,
          },
          {
            id: 'content-media',
            label: 'Media Library',
            path: '/admin/content/media',
            icon: '🖼️',
            roles: ['admin', 'super_admin', 'moderator'],
            visible: true,
            order: 2,
          },
          {
            id: 'content-categories',
            label: 'Categories',
            path: '/admin/content/categories',
            icon: '📁',
            roles: ['admin', 'super_admin', 'moderator'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/admin/analytics',
        icon: '📈',
        roles: ['admin', 'super_admin'],
        permissions: ['admin:analytics:read'],
        visible: true,
        order: 4,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        icon: '⚙️',
        roles: ['admin', 'super_admin'],
        permissions: ['admin:settings:read'],
        visible: true,
        order: 5,
        children: [
          {
            id: 'settings-general',
            label: 'General',
            path: '/admin/settings/general',
            icon: '🔧',
            roles: ['admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'settings-security',
            label: 'Security',
            path: '/admin/settings/security',
            icon: '🔒',
            roles: ['admin', 'super_admin'],
            permissions: ['admin:security:read'],
            visible: true,
            order: 2,
          },
          {
            id: 'settings-integrations',
            label: 'Integrations',
            path: '/admin/settings/integrations',
            icon: '🔌',
            roles: ['admin', 'super_admin'],
            permissions: ['admin:integrations:read'],
            visible: true,
            order: 3,
          },
        ],
      },
    ];

    // Filter items based on user permissions
    return baseItems.filter(item => {
      if (item.roles && !item.roles.includes(user?.role || 'guest')) {
        return false;
      }
      if (item.permissions && !item.permissions.some(perm => hasPermission(perm))) {
        return false;
      }
      return item.visible !== false;
    });
  }

  // ===== HEADER ACTIONS =====

  function getHeaderActions(): HeaderAction[] {
    return [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: '🔔',
        action: () => console.log('Open notifications'),
        roles: ['admin', 'super_admin', 'moderator'],
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: '❓',
        action: () => console.log('Open help'),
        roles: ['admin', 'super_admin', 'moderator', 'user'],
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: '🚪',
        action: logout,
        roles: ['admin', 'super_admin', 'moderator', 'user'],
      },
    ];
  }

  // ===== FOOTER LINKS =====

  function getFooterLinks() {
    return [
      { label: 'Privacy Policy', path: '/privacy', external: false },
      { label: 'Terms of Service', path: '/terms', external: false },
      { label: 'Documentation', path: '/docs', external: false },
      { label: 'API Reference', path: '/api-docs', external: false },
    ];
  }

  // ===== SOCIAL LINKS =====

  function getSocialLinks() {
    return [
      { platform: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { platform: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
      { platform: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
    ];
  }

  // ===== EFFECTS =====

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      try {
        // This would typically fetch from an API
        const mockNotifications = [
          { id: 1, title: 'New user registered', time: '2 minutes ago', unread: true },
          { id: 2, title: 'System update available', time: '1 hour ago', unread: false },
          { id: 3, title: 'Security alert', time: '3 hours ago', unread: true },
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
      >
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            {sidebarCollapsed ? (
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Admin Panel</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {getNavigationItems().map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                collapsed={sidebarCollapsed}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
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
              © 2024 Admin Panel. All rights reserved.
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
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  collapsed,
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
