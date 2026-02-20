import { useEffect, useCallback } from 'react';
import { subscribeToCollection } from '../lib/firebaseService';
import type {
  Site,
  Employee,
  Farmer,
  ServiceProvider,
  CreditType,
  SeaweedType,
  Module,
  CultivationCycle
} from '../types';

/**
 * Hook to sync data with Firebase Realtime Database
 * Provides real-time synchronization for all entities
 */

interface UseFirebaseSyncProps {
  // Sites
  sites: Site[];
  setSites: (sites: Site[]) => void;
  
  // Employees
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  
  // Farmers
  farmers: Farmer[];
  setFarmers: (farmers: Farmer[]) => void;
  
  // Service Providers
  serviceProviders: ServiceProvider[];
  setServiceProviders: (providers: ServiceProvider[]) => void;
  
  // Credit Types
  creditTypes: CreditType[];
  setCreditTypes: (types: CreditType[]) => void;
  
  // Seaweed Types
  seaweedTypes: SeaweedType[];
  setSeaweedTypes: (types: SeaweedType[]) => void;
  
  // Modules
  modules: Module[];
  setModules: (modules: Module[]) => void;
  
  // Cultivation Cycles
  cultivationCycles: CultivationCycle[];
  setCultivationCycles: (cycles: CultivationCycle[]) => void;
}

export function useFirebaseSync({
  sites,
  setSites,
  employees,
  setEmployees,
  farmers,
  setFarmers,
  serviceProviders,
  setServiceProviders,
  creditTypes,
  setCreditTypes,
  seaweedTypes,
  setSeaweedTypes,
  modules,
  setModules,
  cultivationCycles,
  setCultivationCycles
}: UseFirebaseSyncProps) {
  
  // Subscribe to Sites
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for sites...');
    
    const unsubscribe = subscribeToCollection<Site>('sites', (data) => {
      console.log(`[Firebase] Received ${data.length} sites from Firebase`);
      if (data.length > 0) {
        setSites(data);
      } else {
        console.log('[Firebase] No sites in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up sites subscription');
      unsubscribe();
    };
  }, [setSites]);
  
  // Subscribe to Employees
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for employees...');
    
    const unsubscribe = subscribeToCollection<Employee>('employees', (data) => {
      console.log(`[Firebase] Received ${data.length} employees from Firebase`);
      if (data.length > 0) {
        setEmployees(data);
      } else {
        console.log('[Firebase] No employees in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up employees subscription');
      unsubscribe();
    };
  }, [setEmployees]);
  
  // Subscribe to Farmers
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for farmers...');
    
    const unsubscribe = subscribeToCollection<Farmer>('farmers', (data) => {
      console.log(`[Firebase] Received ${data.length} farmers from Firebase`);
      if (data.length > 0) {
        setFarmers(data);
      } else {
        console.log('[Firebase] No farmers in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up farmers subscription');
      unsubscribe();
    };
  }, [setFarmers]);
  
  // Subscribe to Service Providers
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for service providers...');
    
    const unsubscribe = subscribeToCollection<ServiceProvider>('service_providers', (data) => {
      console.log(`[Firebase] Received ${data.length} service providers from Firebase`);
      if (data.length > 0) {
        setServiceProviders(data);
      } else {
        console.log('[Firebase] No service providers in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up service providers subscription');
      unsubscribe();
    };
  }, [setServiceProviders]);
  
  // Subscribe to Credit Types
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for credit types...');
    
    const unsubscribe = subscribeToCollection<CreditType>('credit_types', (data) => {
      console.log(`[Firebase] Received ${data.length} credit types from Firebase`);
      if (data.length > 0) {
        setCreditTypes(data);
      } else {
        console.log('[Firebase] No credit types in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up credit types subscription');
      unsubscribe();
    };
  }, [setCreditTypes]);
  
  // Subscribe to Seaweed Types
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for seaweed types...');
    
    const unsubscribe = subscribeToCollection<SeaweedType>('seaweed_types', (data) => {
      console.log(`[Firebase] Received ${data.length} seaweed types from Firebase`);
      if (data.length > 0) {
        setSeaweedTypes(data);
      } else {
        console.log('[Firebase] No seaweed types in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up seaweed types subscription');
      unsubscribe();
    };
  }, [setSeaweedTypes]);
  
  // Subscribe to Modules
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for modules...');
    
    const unsubscribe = subscribeToCollection<Module>('modules', (data) => {
      console.log(`[Firebase] Received ${data.length} modules from Firebase`);
      if (data.length > 0) {
        setModules(data);
      } else {
        console.log('[Firebase] No modules in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up modules subscription');
      unsubscribe();
    };
  }, [setModules]);
  
  // Subscribe to Cultivation Cycles
  useEffect(() => {
    console.log('[Firebase] Setting up real-time subscription for cultivation cycles...');
    
    const unsubscribe = subscribeToCollection<CultivationCycle>('cultivation_cycles', (data) => {
      console.log(`[Firebase] Received ${data.length} cultivation cycles from Firebase`);
      if (data.length > 0) {
        setCultivationCycles(data);
      } else {
        console.log('[Firebase] No cultivation cycles in Firebase, keeping local data');
      }
    });
    
    return () => {
      console.log('[Firebase] Cleaning up cultivation cycles subscription');
      unsubscribe();
    };
  }, [setCultivationCycles]);
  
  // Return status (can be extended)
  return {
    isConnected: true,
    isLoading: false
  };
}
