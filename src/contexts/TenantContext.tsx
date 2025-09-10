// src/contexts/TenantContext.tsx
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';

// ===== TENANT TYPES =====

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  logo?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  features: string[];
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantState {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface TenantContextValue extends TenantState {
  // Tenant management
  setCurrentTenant: (tenant: Tenant | null) => void;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
  
  // Tenant utilities
  getTenantByDomain: (domain: string) => Tenant | undefined;
  getTenantBySubdomain: (subdomain: string) => Tenant | undefined;
  hasFeature: (feature: string) => boolean;
  getSetting: (key: string) => any;
  setSetting: (key: string, value: any) => void;
  
  // Tenant detection
  detectTenant: () => Promise<Tenant | null>;
  isTenantRoute: (path: string) => boolean;
  
  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ===== TENANT REDUCER =====

type TenantAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_TENANT'; payload: Tenant | null }
  | { type: 'SET_AVAILABLE_TENANTS'; payload: Tenant[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_TENANT_SETTING'; payload: { key: string; value: any } }
  | { type: 'RESET_TENANT_STATE' };

const initialState: TenantState = {
  currentTenant: null,
  availableTenants: [],
  isLoading: false,
  error: null,
  isInitialized: false,
};

function tenantReducer(state: TenantState, action: TenantAction): TenantState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENT_TENANT':
      return { ...state, currentTenant: action.payload };
    
    case 'SET_AVAILABLE_TENANTS':
      return { ...state, availableTenants: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'UPDATE_TENANT_SETTING':
      if (!state.currentTenant) return state;
      return {
        ...state,
        currentTenant: {
          ...state.currentTenant,
          settings: {
            ...state.currentTenant.settings,
            [action.payload.key]: action.payload.value,
          },
        },
      };
    
    case 'RESET_TENANT_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// ===== TENANT CONTEXT =====

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

// ===== TENANT PROVIDER =====

interface TenantProviderProps {
  children: React.ReactNode;
  initialTenant?: Tenant;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({
  children,
  initialTenant,
}) => {
  const [state, dispatch] = useReducer(tenantReducer, {
    ...initialState,
    currentTenant: initialTenant || null,
  });

  // ===== TENANT MANAGEMENT =====

  const setCurrentTenant = useCallback((tenant: Tenant | null) => {
    dispatch({ type: 'SET_CURRENT_TENANT', payload: tenant });
    
    if (tenant) {
      // Store tenant in localStorage
      localStorage.setItem('current_tenant', JSON.stringify(tenant));
      
      // Apply tenant theme
      applyTenantTheme(tenant);
    } else {
      localStorage.removeItem('current_tenant');
    }
  }, []);

  const switchTenant = useCallback(async (tenantId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Find tenant by ID
      const tenant = state.availableTenants.find(t => t.id === tenantId);
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      // Switch to tenant
      setCurrentTenant(tenant);
      
      // Reload page to apply tenant changes
      window.location.reload();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch tenant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.availableTenants, setCurrentTenant]);

  const refreshTenant = useCallback(async () => {
    if (!state.currentTenant) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Fetch updated tenant data from API
      // const updatedTenant = await tenantService.getTenant(state.currentTenant.id);
      // setCurrentTenant(updatedTenant);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh tenant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentTenant]);

  // ===== TENANT UTILITIES =====

  const getTenantByDomain = useCallback((domain: string): Tenant | undefined => {
    return state.availableTenants.find(tenant => tenant.domain === domain);
  }, [state.availableTenants]);

  const getTenantBySubdomain = useCallback((subdomain: string): Tenant | undefined => {
    return state.availableTenants.find(tenant => tenant.subdomain === subdomain);
  }, [state.availableTenants]);

  const hasFeature = useCallback((feature: string): boolean => {
    return state.currentTenant?.features.includes(feature) || false;
  }, [state.currentTenant]);

  const getSetting = useCallback((key: string): any => {
    return state.currentTenant?.settings[key];
  }, [state.currentTenant]);

  const setSetting = useCallback((key: string, value: any) => {
    if (!state.currentTenant) return;
    
    dispatch({ type: 'UPDATE_TENANT_SETTING', payload: { key, value } });
    
    // TODO: Update setting on server
    // tenantService.updateSetting(state.currentTenant.id, key, value);
  }, [state.currentTenant]);

  // ===== TENANT DETECTION =====

  const detectTenant = useCallback(async (): Promise<Tenant | null> => {
    try {
      const hostname = window.location.hostname;
      
      // Check for subdomain
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www') {
        const tenant = getTenantBySubdomain(subdomain);
        if (tenant) return tenant;
      }
      
      // Check for domain
      const tenant = getTenantByDomain(hostname);
      if (tenant) return tenant;
      
      // Check localStorage for last tenant
      const storedTenant = localStorage.getItem('current_tenant');
      if (storedTenant) {
        try {
          return JSON.parse(storedTenant);
        } catch {
          localStorage.removeItem('current_tenant');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Tenant detection failed:', error);
      return null;
    }
  }, [getTenantBySubdomain, getTenantByDomain]);

  const isTenantRoute = useCallback((path: string): boolean => {
    // Check if path starts with tenant-specific routes
    return path.startsWith('/tenant/') || path.startsWith('/admin/');
  }, []);

  // ===== THEME APPLICATION =====

  const applyTenantTheme = useCallback((tenant: Tenant) => {
    const root = document.documentElement;
    const { theme } = tenant;
    
    // Apply CSS custom properties
    root.style.setProperty('--tenant-primary-color', theme.primaryColor);
    root.style.setProperty('--tenant-secondary-color', theme.secondaryColor);
    root.style.setProperty('--tenant-accent-color', theme.accentColor);
    root.style.setProperty('--tenant-font-family', theme.fontFamily);
    root.style.setProperty('--tenant-border-radius', theme.borderRadius);
    
    // Update document title
    document.title = `${tenant.name} - ${document.title}`;
  }, []);

  // ===== STATE MANAGEMENT =====

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  // ===== INITIALIZATION =====

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Detect tenant
        const detectedTenant = await detectTenant();
        if (detectedTenant) {
          setCurrentTenant(detectedTenant);
        }
        
        // TODO: Load available tenants
        // const tenants = await tenantService.getAvailableTenants();
        // dispatch({ type: 'SET_AVAILABLE_TENANTS', payload: tenants });
        
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } catch (error) {
        console.error('Tenant initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize tenant' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeTenant();
  }, [detectTenant, setCurrentTenant]);

  // ===== CONTEXT VALUE =====

  const contextValue: TenantContextValue = useMemo(() => ({
    ...state,
    setCurrentTenant,
    switchTenant,
    refreshTenant,
    getTenantByDomain,
    getTenantBySubdomain,
    hasFeature,
    getSetting,
    setSetting,
    detectTenant,
    isTenantRoute,
    clearError,
    setLoading,
  }), [
    state,
    setCurrentTenant,
    switchTenant,
    refreshTenant,
    getTenantByDomain,
    getTenantBySubdomain,
    hasFeature,
    getSetting,
    setSetting,
    detectTenant,
    isTenantRoute,
    clearError,
    setLoading,
  ]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// ===== TENANT HOOK =====

export const useTenant = (): TenantContextValue => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// ===== TENANT UTILITIES =====

export const createTenant = (config: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Tenant => {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...config,
  };
};

export const validateTenant = (tenant: Tenant): boolean => {
  return !!(
    tenant.id &&
    tenant.name &&
    tenant.domain &&
    tenant.subdomain &&
    tenant.theme &&
    tenant.features &&
    Array.isArray(tenant.features)
  );
};

export const getTenantFromUrl = (): string | null => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain && subdomain !== 'www' ? subdomain : null;
};

export default TenantContext;
