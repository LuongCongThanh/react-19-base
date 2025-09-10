// src/layouts/UserLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import type { LayoutConfig, NavigationItem } from '@/types/routing';

// ===== USER LAYOUT COMPONENT =====

interface UserLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children, config }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== LAYOUT CONFIG =====

  const layoutConfig: LayoutConfig = {
    type: 'UserLayout',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#6b7280',
      accentColor: '#f59e0b',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
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
      showSearch: false,
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
        header: { showSearch: false },
      },
      desktop: {
        sidebar: { collapsed: false },
        header: { showSearch: false },
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
        path: '/dashboard',
        icon: '🏠',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 1,
      },
      {
        id: 'profile',
        label: 'My Profile',
        path: '/profile',
        icon: '👤',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 2,
        children: [
          {
            id: 'profile-view',
            label: 'View Profile',
            path: '/profile',
            icon: '👁️',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'profile-edit',
            label: 'Edit Profile',
            path: '/profile/edit',
            icon: '✏️',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'profile-settings',
            label: 'Settings',
            path: '/profile/settings',
            icon: '⚙️',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'projects',
        label: 'My Projects',
        path: '/projects',
        icon: '📁',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 3,
        children: [
          {
            id: 'projects-list',
            label: 'All Projects',
            path: '/projects',
            icon: '📋',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'projects-create',
            label: 'Create Project',
            path: '/projects/create',
            icon: '➕',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'projects-templates',
            label: 'Templates',
            path: '/projects/templates',
            icon: '📄',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: '✅',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 4,
        children: [
          {
            id: 'tasks-list',
            label: 'My Tasks',
            path: '/tasks',
            icon: '📝',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'tasks-assigned',
            label: 'Assigned to Me',
            path: '/tasks/assigned',
            icon: '👥',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'tasks-completed',
            label: 'Completed',
            path: '/tasks/completed',
            icon: '🎉',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'messages',
        label: 'Messages',
        path: '/messages',
        icon: '💬',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 5,
        children: [
          {
            id: 'messages-inbox',
            label: 'Inbox',
            path: '/messages',
            icon: '📥',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'messages-sent',
            label: 'Sent',
            path: '/messages/sent',
            icon: '📤',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'messages-archived',
            label: 'Archived',
            path: '/messages/archived',
            icon: '📦',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'calendar',
        label: 'Calendar',
        path: '/calendar',
        icon: '📅',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 6,
      },
      {
        id: 'files',
        label: 'Files',
        path: '/files',
        icon: '📁',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 7,
        children: [
          {
            id: 'files-my-files',
            label: 'My Files',
            path: '/files',
            icon: '📄',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 1,
          },
          {
            id: 'files-shared',
            label: 'Shared with Me',
            path: '/files/shared',
            icon: '🤝',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 2,
          },
          {
            id: 'files-recent',
            label: 'Recent',
            path: '/files/recent',
            icon: '🕒',
            roles: ['user', 'admin', 'super_admin'],
            visible: true,
            order: 3,
          },
        ],
      },
      {
        id: 'help',
        label: 'Help & Support',
        path: '/help',
        icon: '❓',
        roles: ['user', 'admin', 'super_admin'],
        visible: true,
        order: 8,
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
      { label: 'Contact Us', path: '/contact', external: false },
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

  // ===== EFFECTS =====

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      try {
        // This would typically fetch from an API
        const mockNotifications = [
          { id: 1, title: 'New task assigned', time: '5 minutes ago', unread: true },
          { id: 2, title: 'Project deadline reminder', time: '1 hour ago', unread: false },
          { id: 3, title: 'Team message', time: '2 hours ago', unread: true },
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
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-xl font-bold text-gray-800">User Portal</span>
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

              {/* Page Title */}
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
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
              © 2024 User Portal. All rights reserved.
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
          item.active ? 'bg-green-50 text-green-600' : 'text-gray-700'
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

export default UserLayout;
