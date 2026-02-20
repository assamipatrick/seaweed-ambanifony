import { database } from './firebaseConfig';
import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  push,
  onValue,
  off,
  query,
  orderByChild,
  DataSnapshot
} from 'firebase/database';
import type { 
  Site, 
  Employee, 
  Farmer, 
  ServiceProvider,
  CreditType,
  SeaweedType,
  Module,
  CultivationCycle 
} from '../src/types';

// ============= HELPER FUNCTIONS =============

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Handle Firebase errors
 */
export function handleFirebaseError(error: any, context: string) {
  console.error(`[Firebase Error - ${context}]`, error);
  return null;
}

/**
 * Subscribe to real-time updates for a collection
 */
export function subscribeToCollection<T>(
  path: string,
  callback: (data: T[]) => void
): () => void {
  const collectionRef = ref(database, path);
  
  const unsubscribe = onValue(collectionRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert Firebase object to array
      const array = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(array as T[]);
    } else {
      callback([]);
    }
  });

  // Return cleanup function
  return () => off(collectionRef);
}

// ============= SITES =============

export async function fetchSites(): Promise<Site[]> {
  try {
    const sitesRef = ref(database, 'sites');
    const snapshot = await get(sitesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchSites');
    return [];
  }
}

export async function addSite(site: Omit<Site, 'id'>): Promise<Site | null> {
  try {
    const id = generateId();
    const newSite = { ...site, id };
    const siteRef = ref(database, `sites/${id}`);
    
    await set(siteRef, newSite);
    return newSite as Site;
  } catch (error) {
    return handleFirebaseError(error, 'addSite');
  }
}

export async function updateSite(site: Site): Promise<Site | null> {
  try {
    const { id, ...updates } = site;
    const siteRef = ref(database, `sites/${id}`);
    
    await update(siteRef, updates);
    return site;
  } catch (error) {
    return handleFirebaseError(error, 'updateSite');
  }
}

export async function deleteSite(siteId: string): Promise<boolean> {
  try {
    const siteRef = ref(database, `sites/${siteId}`);
    await remove(siteRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteSite');
    return false;
  }
}

// ============= EMPLOYEES =============

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const employeesRef = ref(database, 'employees');
    const snapshot = await get(employeesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchEmployees');
    return [];
  }
}

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee | null> {
  try {
    const id = generateId();
    const newEmployee = { ...employee, id };
    const employeeRef = ref(database, `employees/${id}`);
    
    await set(employeeRef, newEmployee);
    return newEmployee as Employee;
  } catch (error) {
    return handleFirebaseError(error, 'addEmployee');
  }
}

export async function updateEmployee(employee: Employee): Promise<Employee | null> {
  try {
    const { id, ...updates } = employee;
    const employeeRef = ref(database, `employees/${id}`);
    
    await update(employeeRef, updates);
    return employee;
  } catch (error) {
    return handleFirebaseError(error, 'updateEmployee');
  }
}

export async function deleteEmployee(employeeId: string): Promise<boolean> {
  try {
    const employeeRef = ref(database, `employees/${employeeId}`);
    await remove(employeeRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteEmployee');
    return false;
  }
}

export async function deleteMultipleEmployees(employeeIds: string[]): Promise<boolean> {
  try {
    const promises = employeeIds.map(id => {
      const employeeRef = ref(database, `employees/${id}`);
      return remove(employeeRef);
    });
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteMultipleEmployees');
    return false;
  }
}

// ============= FARMERS =============

export async function fetchFarmers(): Promise<Farmer[]> {
  try {
    const farmersRef = ref(database, 'farmers');
    const snapshot = await get(farmersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchFarmers');
    return [];
  }
}

export async function addFarmer(farmer: Omit<Farmer, 'id'>): Promise<Farmer | null> {
  try {
    const id = generateId();
    const newFarmer = { ...farmer, id };
    const farmerRef = ref(database, `farmers/${id}`);
    
    await set(farmerRef, newFarmer);
    return newFarmer as Farmer;
  } catch (error) {
    return handleFirebaseError(error, 'addFarmer');
  }
}

export async function updateFarmer(farmer: Farmer): Promise<Farmer | null> {
  try {
    const { id, ...updates } = farmer;
    const farmerRef = ref(database, `farmers/${id}`);
    
    await update(farmerRef, updates);
    return farmer;
  } catch (error) {
    return handleFirebaseError(error, 'updateFarmer');
  }
}

export async function deleteFarmer(farmerId: string): Promise<boolean> {
  try {
    const farmerRef = ref(database, `farmers/${farmerId}`);
    await remove(farmerRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteFarmer');
    return false;
  }
}

// ============= SERVICE PROVIDERS =============

export async function fetchServiceProviders(): Promise<ServiceProvider[]> {
  try {
    const providersRef = ref(database, 'service_providers');
    const snapshot = await get(providersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchServiceProviders');
    return [];
  }
}

export async function addServiceProvider(provider: Omit<ServiceProvider, 'id'>): Promise<ServiceProvider | null> {
  try {
    const id = generateId();
    const newProvider = { ...provider, id };
    const providerRef = ref(database, `service_providers/${id}`);
    
    await set(providerRef, newProvider);
    return newProvider as ServiceProvider;
  } catch (error) {
    return handleFirebaseError(error, 'addServiceProvider');
  }
}

export async function updateServiceProvider(provider: ServiceProvider): Promise<ServiceProvider | null> {
  try {
    const { id, ...updates } = provider;
    const providerRef = ref(database, `service_providers/${id}`);
    
    await update(providerRef, updates);
    return provider;
  } catch (error) {
    return handleFirebaseError(error, 'updateServiceProvider');
  }
}

export async function deleteServiceProvider(providerId: string): Promise<boolean> {
  try {
    const providerRef = ref(database, `service_providers/${providerId}`);
    await remove(providerRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteServiceProvider');
    return false;
  }
}

// ============= CREDIT TYPES =============

export async function fetchCreditTypes(): Promise<CreditType[]> {
  try {
    const creditTypesRef = ref(database, 'credit_types');
    const snapshot = await get(creditTypesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchCreditTypes');
    return [];
  }
}

export async function addCreditType(creditType: Omit<CreditType, 'id'>): Promise<CreditType | null> {
  try {
    const id = generateId();
    const newCreditType = { ...creditType, id };
    const creditTypeRef = ref(database, `credit_types/${id}`);
    
    await set(creditTypeRef, newCreditType);
    return newCreditType as CreditType;
  } catch (error) {
    return handleFirebaseError(error, 'addCreditType');
  }
}

export async function updateCreditType(creditType: CreditType): Promise<CreditType | null> {
  try {
    const { id, ...updates } = creditType;
    const creditTypeRef = ref(database, `credit_types/${id}`);
    
    await update(creditTypeRef, updates);
    return creditType;
  } catch (error) {
    return handleFirebaseError(error, 'updateCreditType');
  }
}

export async function deleteCreditType(creditTypeId: string): Promise<boolean> {
  try {
    const creditTypeRef = ref(database, `credit_types/${creditTypeId}`);
    await remove(creditTypeRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteCreditType');
    return false;
  }
}

// ============= SEAWEED TYPES =============

export async function fetchSeaweedTypes(): Promise<SeaweedType[]> {
  try {
    const seaweedTypesRef = ref(database, 'seaweed_types');
    const snapshot = await get(seaweedTypesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchSeaweedTypes');
    return [];
  }
}

export async function addSeaweedType(seaweedType: Omit<SeaweedType, 'id'>): Promise<SeaweedType | null> {
  try {
    const id = generateId();
    const newType = { ...seaweedType, id };
    const seaweedTypeRef = ref(database, `seaweed_types/${id}`);
    
    await set(seaweedTypeRef, newType);
    return newType as SeaweedType;
  } catch (error) {
    return handleFirebaseError(error, 'addSeaweedType');
  }
}

export async function updateSeaweedType(seaweedType: SeaweedType): Promise<SeaweedType | null> {
  try {
    const { id, ...updates } = seaweedType;
    const seaweedTypeRef = ref(database, `seaweed_types/${id}`);
    
    await update(seaweedTypeRef, updates);
    return seaweedType;
  } catch (error) {
    return handleFirebaseError(error, 'updateSeaweedType');
  }
}

export async function deleteSeaweedType(seaweedTypeId: string): Promise<boolean> {
  try {
    const seaweedTypeRef = ref(database, `seaweed_types/${seaweedTypeId}`);
    await remove(seaweedTypeRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteSeaweedType');
    return false;
  }
}

// ============= MODULES =============

export async function fetchModules(): Promise<Module[]> {
  try {
    const modulesRef = ref(database, 'modules');
    const snapshot = await get(modulesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchModules');
    return [];
  }
}

export async function addModule(module: Omit<Module, 'id'>): Promise<Module | null> {
  try {
    const id = generateId();
    const newModule = { ...module, id };
    const moduleRef = ref(database, `modules/${id}`);
    
    await set(moduleRef, newModule);
    return newModule as Module;
  } catch (error) {
    return handleFirebaseError(error, 'addModule');
  }
}

export async function updateModule(module: Module): Promise<Module | null> {
  try {
    const { id, ...updates } = module;
    const moduleRef = ref(database, `modules/${id}`);
    
    await update(moduleRef, updates);
    return module;
  } catch (error) {
    return handleFirebaseError(error, 'updateModule');
  }
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  try {
    const moduleRef = ref(database, `modules/${moduleId}`);
    await remove(moduleRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteModule');
    return false;
  }
}

// ============= CULTIVATION CYCLES =============

export async function fetchCultivationCycles(): Promise<CultivationCycle[]> {
  try {
    const cyclesRef = ref(database, 'cultivation_cycles');
    const snapshot = await get(cyclesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchCultivationCycles');
    return [];
  }
}

export async function addCultivationCycle(cycle: Omit<CultivationCycle, 'id'>): Promise<CultivationCycle | null> {
  try {
    const id = generateId();
    const newCycle = { ...cycle, id };
    const cycleRef = ref(database, `cultivation_cycles/${id}`);
    
    await set(cycleRef, newCycle);
    return newCycle as CultivationCycle;
  } catch (error) {
    return handleFirebaseError(error, 'addCultivationCycle');
  }
}

export async function updateCultivationCycle(cycle: CultivationCycle): Promise<CultivationCycle | null> {
  try {
    const { id, ...updates } = cycle;
    const cycleRef = ref(database, `cultivation_cycles/${id}`);
    
    await update(cycleRef, updates);
    return cycle;
  } catch (error) {
    return handleFirebaseError(error, 'updateCultivationCycle');
  }
}

export async function deleteCultivationCycle(cycleId: string): Promise<boolean> {
  try {
    const cycleRef = ref(database, `cultivation_cycles/${cycleId}`);
    await remove(cycleRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteCultivationCycle');
    return false;
  }
}
