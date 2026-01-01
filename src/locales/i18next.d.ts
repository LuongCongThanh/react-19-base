import 'i18next';

import type enAuth from './en/auth.json';
import type enCommon from './en/common.json';
import type enDashboard from './en/dashboard.json';

/**
 * TypeScript type augmentation for i18next
 * This provides autocomplete and type checking for translation keys
 *
 * @example
 * // Now you get autocomplete and type errors:
 * t('title')       // ✅ OK
 * t('tytle')       // ❌ TypeScript error!
 * t('unknown')     // ❌ TypeScript error!
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    // Set default namespace to 'common'
    defaultNS: 'common';

    // Define available resources for type checking
    resources: {
      common: typeof enCommon;
      auth: typeof enAuth;
      dashboard: typeof enDashboard;
    };

    // Return null for missing keys instead of the key itself
    returnNull: false;
  }
}
