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
  Zone,
  Employee, 
  Farmer, 
  ServiceProvider,
  CreditType,
  SeaweedType,
  Module,
  CultivationCycle,
  FarmerCredit,
  Repayment,
  MonthlyPayment,
  FarmerDelivery,
  StockMovement,
  PressingSlip,
  PressedStockMovement,
  CuttingOperation,
  ExportDocument,
  SiteTransfer,
  Incident,
  PeriodicTest,
  PestObservation,
  User,
  Role,
  Invitation,
  MessageLog,
  GalleryPhoto
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

// ============= ZONES =============

export async function fetchZones(): Promise<Zone[]> {
  try {
    const zonesRef = ref(database, 'zones');
    const snapshot = await get(zonesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchZones');
    return [];
  }
}

export async function addZone(zone: Omit<Zone, 'id'>): Promise<Zone | null> {
  try {
    const id = generateId();
    const newZone = { ...zone, id };
    const zoneRef = ref(database, `zones/${id}`);
    
    await set(zoneRef, newZone);
    return newZone as Zone;
  } catch (error) {
    return handleFirebaseError(error, 'addZone');
  }
}

export async function updateZone(zone: Zone): Promise<Zone | null> {
  try {
    const { id, ...updates } = zone;
    const zoneRef = ref(database, `zones/${id}`);
    
    await update(zoneRef, updates);
    return zone;
  } catch (error) {
    return handleFirebaseError(error, 'updateZone');
  }
}

export async function deleteZone(zoneId: string): Promise<boolean> {
  try {
    const zoneRef = ref(database, `zones/${zoneId}`);
    await remove(zoneRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteZone');
    return false;
  }
}

// ============= FARMER CREDITS =============

export async function fetchFarmerCredits(): Promise<FarmerCredit[]> {
  try {
    const creditsRef = ref(database, 'farmer_credits');
    const snapshot = await get(creditsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchFarmerCredits');
    return [];
  }
}

export async function addFarmerCredit(credit: Omit<FarmerCredit, 'id'>): Promise<FarmerCredit | null> {
  try {
    const id = generateId();
    const newCredit = { ...credit, id };
    const creditRef = ref(database, `farmer_credits/${id}`);
    
    await set(creditRef, newCredit);
    return newCredit as FarmerCredit;
  } catch (error) {
    return handleFirebaseError(error, 'addFarmerCredit');
  }
}

export async function updateFarmerCredit(credit: FarmerCredit): Promise<FarmerCredit | null> {
  try {
    const { id, ...updates } = credit;
    const creditRef = ref(database, `farmer_credits/${id}`);
    
    await update(creditRef, updates);
    return credit;
  } catch (error) {
    return handleFirebaseError(error, 'updateFarmerCredit');
  }
}

export async function deleteFarmerCredit(creditId: string): Promise<boolean> {
  try {
    const creditRef = ref(database, `farmer_credits/${creditId}`);
    await remove(creditRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteFarmerCredit');
    return false;
  }
}

// ============= REPAYMENTS =============

export async function fetchRepayments(): Promise<Repayment[]> {
  try {
    const repaymentsRef = ref(database, 'repayments');
    const snapshot = await get(repaymentsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchRepayments');
    return [];
  }
}

export async function addRepayment(repayment: Omit<Repayment, 'id'>): Promise<Repayment | null> {
  try {
    const id = generateId();
    const newRepayment = { ...repayment, id };
    const repaymentRef = ref(database, `repayments/${id}`);
    
    await set(repaymentRef, newRepayment);
    return newRepayment as Repayment;
  } catch (error) {
    return handleFirebaseError(error, 'addRepayment');
  }
}

export async function updateRepayment(repayment: Repayment): Promise<Repayment | null> {
  try {
    const { id, ...updates } = repayment;
    const repaymentRef = ref(database, `repayments/${id}`);
    
    await update(repaymentRef, updates);
    return repayment;
  } catch (error) {
    return handleFirebaseError(error, 'updateRepayment');
  }
}

export async function deleteRepayment(repaymentId: string): Promise<boolean> {
  try {
    const repaymentRef = ref(database, `repayments/${repaymentId}`);
    await remove(repaymentRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteRepayment');
    return false;
  }
}

// ============= MONTHLY PAYMENTS =============

export async function fetchMonthlyPayments(): Promise<MonthlyPayment[]> {
  try {
    const paymentsRef = ref(database, 'monthly_payments');
    const snapshot = await get(paymentsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchMonthlyPayments');
    return [];
  }
}

export async function addMonthlyPayment(payment: Omit<MonthlyPayment, 'id'>): Promise<MonthlyPayment | null> {
  try {
    const id = generateId();
    const newPayment = { ...payment, id };
    const paymentRef = ref(database, `monthly_payments/${id}`);
    
    await set(paymentRef, newPayment);
    return newPayment as MonthlyPayment;
  } catch (error) {
    return handleFirebaseError(error, 'addMonthlyPayment');
  }
}

export async function updateMonthlyPayment(payment: MonthlyPayment): Promise<MonthlyPayment | null> {
  try {
    const { id, ...updates } = payment;
    const paymentRef = ref(database, `monthly_payments/${id}`);
    
    await update(paymentRef, updates);
    return payment;
  } catch (error) {
    return handleFirebaseError(error, 'updateMonthlyPayment');
  }
}

export async function deleteMonthlyPayment(paymentId: string): Promise<boolean> {
  try {
    const paymentRef = ref(database, `monthly_payments/${paymentId}`);
    await remove(paymentRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteMonthlyPayment');
    return false;
  }
}

// ============= FARMER DELIVERIES =============

export async function fetchFarmerDeliveries(): Promise<FarmerDelivery[]> {
  try {
    const deliveriesRef = ref(database, 'farmer_deliveries');
    const snapshot = await get(deliveriesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchFarmerDeliveries');
    return [];
  }
}

export async function addFarmerDelivery(delivery: Omit<FarmerDelivery, 'id'>): Promise<FarmerDelivery | null> {
  try {
    const id = generateId();
    const newDelivery = { ...delivery, id };
    const deliveryRef = ref(database, `farmer_deliveries/${id}`);
    
    await set(deliveryRef, newDelivery);
    return newDelivery as FarmerDelivery;
  } catch (error) {
    return handleFirebaseError(error, 'addFarmerDelivery');
  }
}

export async function updateFarmerDelivery(delivery: FarmerDelivery): Promise<FarmerDelivery | null> {
  try {
    const { id, ...updates } = delivery;
    const deliveryRef = ref(database, `farmer_deliveries/${id}`);
    
    await update(deliveryRef, updates);
    return delivery;
  } catch (error) {
    return handleFirebaseError(error, 'updateFarmerDelivery');
  }
}

export async function deleteFarmerDelivery(deliveryId: string): Promise<boolean> {
  try {
    const deliveryRef = ref(database, `farmer_deliveries/${deliveryId}`);
    await remove(deliveryRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteFarmerDelivery');
    return false;
  }
}

// ============= STOCK MOVEMENTS =============

export async function fetchStockMovements(): Promise<StockMovement[]> {
  try {
    const movementsRef = ref(database, 'stock_movements');
    const snapshot = await get(movementsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchStockMovements');
    return [];
  }
}

export async function addStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement | null> {
  try {
    const id = generateId();
    const newMovement = { ...movement, id };
    const movementRef = ref(database, `stock_movements/${id}`);
    
    await set(movementRef, newMovement);
    return newMovement as StockMovement;
  } catch (error) {
    return handleFirebaseError(error, 'addStockMovement');
  }
}

export async function updateStockMovement(movement: StockMovement): Promise<StockMovement | null> {
  try {
    const { id, ...updates } = movement;
    const movementRef = ref(database, `stock_movements/${id}`);
    
    await update(movementRef, updates);
    return movement;
  } catch (error) {
    return handleFirebaseError(error, 'updateStockMovement');
  }
}

export async function deleteStockMovement(movementId: string): Promise<boolean> {
  try {
    const movementRef = ref(database, `stock_movements/${movementId}`);
    await remove(movementRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteStockMovement');
    return false;
  }
}

// ============= PRESSING SLIPS =============

export async function fetchPressingSlips(): Promise<PressingSlip[]> {
  try {
    const slipsRef = ref(database, 'pressing_slips');
    const snapshot = await get(slipsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchPressingSlips');
    return [];
  }
}

export async function addPressingSlip(slip: Omit<PressingSlip, 'id'>): Promise<PressingSlip | null> {
  try {
    const id = generateId();
    const newSlip = { ...slip, id };
    const slipRef = ref(database, `pressing_slips/${id}`);
    
    await set(slipRef, newSlip);
    return newSlip as PressingSlip;
  } catch (error) {
    return handleFirebaseError(error, 'addPressingSlip');
  }
}

export async function updatePressingSlip(slip: PressingSlip): Promise<PressingSlip | null> {
  try {
    const { id, ...updates } = slip;
    const slipRef = ref(database, `pressing_slips/${id}`);
    
    await update(slipRef, updates);
    return slip;
  } catch (error) {
    return handleFirebaseError(error, 'updatePressingSlip');
  }
}

export async function deletePressingSlip(slipId: string): Promise<boolean> {
  try {
    const slipRef = ref(database, `pressing_slips/${slipId}`);
    await remove(slipRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deletePressingSlip');
    return false;
  }
}

// ============= PRESSED STOCK MOVEMENTS =============

export async function fetchPressedStockMovements(): Promise<PressedStockMovement[]> {
  try {
    const movementsRef = ref(database, 'pressed_stock_movements');
    const snapshot = await get(movementsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchPressedStockMovements');
    return [];
  }
}

export async function addPressedStockMovement(movement: Omit<PressedStockMovement, 'id'>): Promise<PressedStockMovement | null> {
  try {
    const id = generateId();
    const newMovement = { ...movement, id };
    const movementRef = ref(database, `pressed_stock_movements/${id}`);
    
    await set(movementRef, newMovement);
    return newMovement as PressedStockMovement;
  } catch (error) {
    return handleFirebaseError(error, 'addPressedStockMovement');
  }
}

export async function updatePressedStockMovement(movement: PressedStockMovement): Promise<PressedStockMovement | null> {
  try {
    const { id, ...updates } = movement;
    const movementRef = ref(database, `pressed_stock_movements/${id}`);
    
    await update(movementRef, updates);
    return movement;
  } catch (error) {
    return handleFirebaseError(error, 'updatePressedStockMovement');
  }
}

export async function deletePressedStockMovement(movementId: string): Promise<boolean> {
  try {
    const movementRef = ref(database, `pressed_stock_movements/${movementId}`);
    await remove(movementRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deletePressedStockMovement');
    return false;
  }
}

// ============= CUTTING OPERATIONS =============

export async function fetchCuttingOperations(): Promise<CuttingOperation[]> {
  try {
    const operationsRef = ref(database, 'cutting_operations');
    const snapshot = await get(operationsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchCuttingOperations');
    return [];
  }
}

export async function addCuttingOperation(operation: Omit<CuttingOperation, 'id'>): Promise<CuttingOperation | null> {
  try {
    const id = generateId();
    const newOperation = { ...operation, id };
    const operationRef = ref(database, `cutting_operations/${id}`);
    
    await set(operationRef, newOperation);
    return newOperation as CuttingOperation;
  } catch (error) {
    return handleFirebaseError(error, 'addCuttingOperation');
  }
}

export async function updateCuttingOperation(operation: CuttingOperation): Promise<CuttingOperation | null> {
  try {
    const { id, ...updates } = operation;
    const operationRef = ref(database, `cutting_operations/${id}`);
    
    await update(operationRef, updates);
    return operation;
  } catch (error) {
    return handleFirebaseError(error, 'updateCuttingOperation');
  }
}

export async function deleteCuttingOperation(operationId: string): Promise<boolean> {
  try {
    const operationRef = ref(database, `cutting_operations/${operationId}`);
    await remove(operationRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteCuttingOperation');
    return false;
  }
}

// ============= EXPORT DOCUMENTS =============

export async function fetchExportDocuments(): Promise<ExportDocument[]> {
  try {
    const docsRef = ref(database, 'export_documents');
    const snapshot = await get(docsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchExportDocuments');
    return [];
  }
}

export async function addExportDocument(doc: Omit<ExportDocument, 'id'>): Promise<ExportDocument | null> {
  try {
    const id = generateId();
    const newDoc = { ...doc, id };
    const docRef = ref(database, `export_documents/${id}`);
    
    await set(docRef, newDoc);
    return newDoc as ExportDocument;
  } catch (error) {
    return handleFirebaseError(error, 'addExportDocument');
  }
}

export async function updateExportDocument(doc: ExportDocument): Promise<ExportDocument | null> {
  try {
    const { id, ...updates } = doc;
    const docRef = ref(database, `export_documents/${id}`);
    
    await update(docRef, updates);
    return doc;
  } catch (error) {
    return handleFirebaseError(error, 'updateExportDocument');
  }
}

export async function deleteExportDocument(docId: string): Promise<boolean> {
  try {
    const docRef = ref(database, `export_documents/${docId}`);
    await remove(docRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteExportDocument');
    return false;
  }
}

// ============= SITE TRANSFERS =============

export async function fetchSiteTransfers(): Promise<SiteTransfer[]> {
  try {
    const transfersRef = ref(database, 'site_transfers');
    const snapshot = await get(transfersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchSiteTransfers');
    return [];
  }
}

export async function addSiteTransfer(transfer: Omit<SiteTransfer, 'id'>): Promise<SiteTransfer | null> {
  try {
    const id = generateId();
    const newTransfer = { ...transfer, id };
    const transferRef = ref(database, `site_transfers/${id}`);
    
    await set(transferRef, newTransfer);
    return newTransfer as SiteTransfer;
  } catch (error) {
    return handleFirebaseError(error, 'addSiteTransfer');
  }
}

export async function updateSiteTransfer(transfer: SiteTransfer): Promise<SiteTransfer | null> {
  try {
    const { id, ...updates } = transfer;
    const transferRef = ref(database, `site_transfers/${id}`);
    
    await update(transferRef, updates);
    return transfer;
  } catch (error) {
    return handleFirebaseError(error, 'updateSiteTransfer');
  }
}

export async function deleteSiteTransfer(transferId: string): Promise<boolean> {
  try {
    const transferRef = ref(database, `site_transfers/${transferId}`);
    await remove(transferRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteSiteTransfer');
    return false;
  }
}

// ============= INCIDENTS =============

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const incidentsRef = ref(database, 'incidents');
    const snapshot = await get(incidentsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchIncidents');
    return [];
  }
}

export async function addIncident(incident: Omit<Incident, 'id'>): Promise<Incident | null> {
  try {
    const id = generateId();
    const newIncident = { ...incident, id };
    const incidentRef = ref(database, `incidents/${id}`);
    
    await set(incidentRef, newIncident);
    return newIncident as Incident;
  } catch (error) {
    return handleFirebaseError(error, 'addIncident');
  }
}

export async function updateIncident(incident: Incident): Promise<Incident | null> {
  try {
    const { id, ...updates } = incident;
    const incidentRef = ref(database, `incidents/${id}`);
    
    await update(incidentRef, updates);
    return incident;
  } catch (error) {
    return handleFirebaseError(error, 'updateIncident');
  }
}

export async function deleteIncident(incidentId: string): Promise<boolean> {
  try {
    const incidentRef = ref(database, `incidents/${incidentId}`);
    await remove(incidentRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteIncident');
    return false;
  }
}

// ============= PERIODIC TESTS =============

export async function fetchPeriodicTests(): Promise<PeriodicTest[]> {
  try {
    const testsRef = ref(database, 'periodic_tests');
    const snapshot = await get(testsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchPeriodicTests');
    return [];
  }
}

export async function addPeriodicTest(test: Omit<PeriodicTest, 'id'>): Promise<PeriodicTest | null> {
  try {
    const id = generateId();
    const newTest = { ...test, id };
    const testRef = ref(database, `periodic_tests/${id}`);
    
    await set(testRef, newTest);
    return newTest as PeriodicTest;
  } catch (error) {
    return handleFirebaseError(error, 'addPeriodicTest');
  }
}

export async function updatePeriodicTest(test: PeriodicTest): Promise<PeriodicTest | null> {
  try {
    const { id, ...updates } = test;
    const testRef = ref(database, `periodic_tests/${id}`);
    
    await update(testRef, updates);
    return test;
  } catch (error) {
    return handleFirebaseError(error, 'updatePeriodicTest');
  }
}

export async function deletePeriodicTest(testId: string): Promise<boolean> {
  try {
    const testRef = ref(database, `periodic_tests/${testId}`);
    await remove(testRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deletePeriodicTest');
    return false;
  }
}

// ============= PEST OBSERVATIONS =============

export async function fetchPestObservations(): Promise<PestObservation[]> {
  try {
    const observationsRef = ref(database, 'pest_observations');
    const snapshot = await get(observationsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchPestObservations');
    return [];
  }
}

export async function addPestObservation(observation: Omit<PestObservation, 'id'>): Promise<PestObservation | null> {
  try {
    const id = generateId();
    const newObservation = { ...observation, id };
    const observationRef = ref(database, `pest_observations/${id}`);
    
    await set(observationRef, newObservation);
    return newObservation as PestObservation;
  } catch (error) {
    return handleFirebaseError(error, 'addPestObservation');
  }
}

export async function updatePestObservation(observation: PestObservation): Promise<PestObservation | null> {
  try {
    const { id, ...updates } = observation;
    const observationRef = ref(database, `pest_observations/${id}`);
    
    await update(observationRef, updates);
    return observation;
  } catch (error) {
    return handleFirebaseError(error, 'updatePestObservation');
  }
}

export async function deletePestObservation(observationId: string): Promise<boolean> {
  try {
    const observationRef = ref(database, `pest_observations/${observationId}`);
    await remove(observationRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deletePestObservation');
    return false;
  }
}

// ============= USERS =============

export async function fetchUsers(): Promise<User[]> {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchUsers');
    return [];
  }
}

export async function addUser(user: Omit<User, 'id'>): Promise<User | null> {
  try {
    const id = generateId();
    const newUser = { ...user, id };
    const userRef = ref(database, `users/${id}`);
    
    await set(userRef, newUser);
    return newUser as User;
  } catch (error) {
    return handleFirebaseError(error, 'addUser');
  }
}

export async function updateUser(user: User): Promise<User | null> {
  try {
    const { id, ...updates } = user;
    const userRef = ref(database, `users/${id}`);
    
    await update(userRef, updates);
    return user;
  } catch (error) {
    return handleFirebaseError(error, 'updateUser');
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteUser');
    return false;
  }
}

// ============= ROLES =============

export async function fetchRoles(): Promise<Role[]> {
  try {
    const rolesRef = ref(database, 'roles');
    const snapshot = await get(rolesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchRoles');
    return [];
  }
}

export async function addRole(role: Omit<Role, 'id'>): Promise<Role | null> {
  try {
    const id = generateId();
    const newRole = { ...role, id };
    const roleRef = ref(database, `roles/${id}`);
    
    await set(roleRef, newRole);
    return newRole as Role;
  } catch (error) {
    return handleFirebaseError(error, 'addRole');
  }
}

export async function updateRole(role: Role): Promise<Role | null> {
  try {
    const { id, ...updates } = role;
    const roleRef = ref(database, `roles/${id}`);
    
    await update(roleRef, updates);
    return role;
  } catch (error) {
    return handleFirebaseError(error, 'updateRole');
  }
}

export async function deleteRole(roleId: string): Promise<boolean> {
  try {
    const roleRef = ref(database, `roles/${roleId}`);
    await remove(roleRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteRole');
    return false;
  }
}

// ============= INVITATIONS =============

export async function fetchInvitations(): Promise<Invitation[]> {
  try {
    const invitationsRef = ref(database, 'invitations');
    const snapshot = await get(invitationsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchInvitations');
    return [];
  }
}

export async function addInvitation(invitation: Omit<Invitation, 'id'>): Promise<Invitation | null> {
  try {
    const id = generateId();
    const newInvitation = { ...invitation, id };
    const invitationRef = ref(database, `invitations/${id}`);
    
    await set(invitationRef, newInvitation);
    return newInvitation as Invitation;
  } catch (error) {
    return handleFirebaseError(error, 'addInvitation');
  }
}

export async function updateInvitation(invitation: Invitation): Promise<Invitation | null> {
  try {
    const { id, ...updates } = invitation;
    const invitationRef = ref(database, `invitations/${id}`);
    
    await update(invitationRef, updates);
    return invitation;
  } catch (error) {
    return handleFirebaseError(error, 'updateInvitation');
  }
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  try {
    const invitationRef = ref(database, `invitations/${invitationId}`);
    await remove(invitationRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteInvitation');
    return false;
  }
}

// ============= MESSAGE LOGS =============

export async function fetchMessageLogs(): Promise<MessageLog[]> {
  try {
    const logsRef = ref(database, 'message_logs');
    const snapshot = await get(logsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchMessageLogs');
    return [];
  }
}

export async function addMessageLog(log: Omit<MessageLog, 'id'>): Promise<MessageLog | null> {
  try {
    const id = generateId();
    const newLog = { ...log, id };
    const logRef = ref(database, `message_logs/${id}`);
    
    await set(logRef, newLog);
    return newLog as MessageLog;
  } catch (error) {
    return handleFirebaseError(error, 'addMessageLog');
  }
}

export async function updateMessageLog(log: MessageLog): Promise<MessageLog | null> {
  try {
    const { id, ...updates } = log;
    const logRef = ref(database, `message_logs/${id}`);
    
    await update(logRef, updates);
    return log;
  } catch (error) {
    return handleFirebaseError(error, 'updateMessageLog');
  }
}

export async function deleteMessageLog(logId: string): Promise<boolean> {
  try {
    const logRef = ref(database, `message_logs/${logId}`);
    await remove(logRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteMessageLog');
    return false;
  }
}

// ============= GALLERY PHOTOS =============

export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const photosRef = ref(database, 'gallery_photos');
    const snapshot = await get(photosRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }
    return [];
  } catch (error) {
    handleFirebaseError(error, 'fetchGalleryPhotos');
    return [];
  }
}

export async function addGalleryPhoto(photo: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto | null> {
  try {
    const id = generateId();
    const newPhoto = { ...photo, id };
    const photoRef = ref(database, `gallery_photos/${id}`);
    
    await set(photoRef, newPhoto);
    return newPhoto as GalleryPhoto;
  } catch (error) {
    return handleFirebaseError(error, 'addGalleryPhoto');
  }
}

export async function updateGalleryPhoto(photo: GalleryPhoto): Promise<GalleryPhoto | null> {
  try {
    const { id, ...updates } = photo;
    const photoRef = ref(database, `gallery_photos/${id}`);
    
    await update(photoRef, updates);
    return photo;
  } catch (error) {
    return handleFirebaseError(error, 'updateGalleryPhoto');
  }
}

export async function deleteGalleryPhoto(photoId: string): Promise<boolean> {
  try {
    const photoRef = ref(database, `gallery_photos/${photoId}`);
    await remove(photoRef);
    return true;
  } catch (error) {
    handleFirebaseError(error, 'deleteGalleryPhoto');
    return false;
  }
}
