// src/layouts/PublicLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import type { LayoutConfig, NavigationItem } from '@/types/routing';

// ===== PUBLIC LAYOUT COMPONENT =====

interface PublicLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, config }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== LAYOUT CONFIG =====

  const layoutConfig: LayoutConfig = {
    type: 'PublicLayout',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
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
      type: 'horizontal',
      items: getNavigationItems(),
      collapsible: true,
      sticky: true,
      position: 'top',
    },
    header: {
      height: '4rem',
      sticky: true,
      showLogo: true,
      showUserMenu: true,
      showNotifications: false,
      showSearch: true,
      actions: getHeaderActions(),
    },
    footer: {
      height: 'auto',
      showCopyright: true,
      showLinks: true,
      links: getFooterLinks(),
      social: getSocialLinks(),
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
        navigation: { type: 'vertical' },
        header: { showSearch: false },
      },
      tablet: {
        navigation: { type: 'horizontal' },
        header: { showSearch: true },
      },
      desktop: {
        navigation: { type: 'horizontal' },
        header: { showSearch: true },
      },
    },
    ...config,
  };

  // ===== NAVIGATION ITEMS =====

  function getNavigationItems(): NavigationItem[] {
    const baseItems: NavigationItem[] = [
      {
        id: 'home',
        label: 'Home',
        path: '/',
        icon: '🏠',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 1,
      },
      {
        id: 'features',
        label: 'Features',
        path: '/features',
        icon: '⭐',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 2,
      },
      {
        id: 'pricing',
        label: 'Pricing',
        path: '/pricing',
        icon: '💰',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 3,
      },
      {
        id: 'about',
        label: 'About',
        path: '/about',
        icon: 'ℹ️',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 4,
      },
      {
        id: 'contact',
        label: 'Contact',
        path: '/contact',
        icon: '📞',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 5,
      },
      {
        id: 'blog',
        label: 'Blog',
        path: '/blog',
        icon: '📝',
        roles: ['guest', 'user', 'admin', 'super_admin'],
        visible: true,
        order: 6,
      },
    ];

    // Add auth-specific items
    if (user) {
      baseItems.push(
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: '📊',
          roles: ['user', 'admin', 'super_admin'],
          visible: true,
          order: 7,
        },
        {
          id: 'profile',
          label: 'Profile',
          path: '/profile',
          icon: '👤',
          roles: ['user', 'admin', 'super_admin'],
          visible: true,
          order: 8,
        }
      );
    }

    return baseItems.filter(item => {
      if (item.roles && !item.roles.includes(user?.role || 'guest')) {
        return false;
      }
      return item.visible !== false;
    });
  }

  // ===== HEADER ACTIONS =====

  function getHeaderActions() {
    const actions = [];

    if (user) {
      actions.push(
        {
          id: 'profile',
          label: 'Profile',
          icon: '👤',
          action: () => console.log('Go to profile'),
          roles: ['user', 'admin', 'super_admin'],
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: '🚪',
          action: logout,
          roles: ['user', 'admin', 'super_admin'],
        }
      );
    } else {
      actions.push(
        {
          id: 'login',
          label: 'Login',
          icon: '🔑',
          action: () => console.log('Go to login'),
          roles: ['guest'],
        },
        {
          id: 'register',
          label: 'Sign Up',
          icon: '📝',
          action: () => console.log('Go to register'),
          roles: ['guest'],
        }
      );
    }

    return actions;
  }

  // ===== FOOTER LINKS =====

  function getFooterLinks() {
    return [
      { label: 'Privacy Policy', path: '/privacy', external: false },
      { label: 'Terms of Service', path: '/terms', external: false },
      { label: 'Cookie Policy', path: '/cookies', external: false },
      { label: 'GDPR', path: '/gdpr', external: false },
      { label: 'Help Center', path: '/help', external: false },
      { label: 'Contact Us', path: '/contact', external: false },
      { label: 'Status', path: '/status', external: false },
      { label: 'Security', path: '/security', external: false },
    ];
  }

  // ===== SOCIAL LINKS =====

  function getSocialLinks() {
    return [
      { platform: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
      { platform: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
      { platform: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { platform: 'Discord', url: 'https://discord.com', icon: '💬' },
    ];
  }

  // ===== HANDLERS =====

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log('Searching for:', query);
  };

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    // Navigation will be handled by React Router
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Public Site</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {getNavigationItems().map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={() => handleNavClick(item.path || '')}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Search */}
            <div className="hidden md:block">
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

            {/* Auth Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {getHeaderActions().map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">
                  {isMenuOpen ? '✕' : '☰'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getNavigationItems().map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={() => handleNavClick(item.path || '')}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Auth Actions */}
              <div className="pt-4 border-t border-gray-200">
                {getHeaderActions().map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold">Public Site</span>
              </div>
              <p className="text-gray-400 mb-4">
                Building amazing web applications with modern technology and best practices.
              </p>
              <div className="flex space-x-4">
                {getSocialLinks().map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {getFooterLinks().slice(0, 4).map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {getFooterLinks().slice(4).map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Public Site. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms
                </a>
                <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
