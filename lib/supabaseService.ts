import { supabase, handleSupabaseError, generateId } from './supabaseClient';
import type { 
  Site, Employee, Farmer, ServiceProvider, CreditType, 
  FarmerCredit, Repayment, MonthlyPayment, SeaweedType,
  Module, CultivationCycle, StockMovement, PressingSlip,
  PressedStockMovement, ExportDocument, SiteTransfer,
  CuttingOperation, FarmerDelivery, Incident, IncidentType,
  IncidentSeverity, Role, PeriodicTest, PestObservation,
  User, Invitation, MessageLog, GalleryPhoto
} from '../types';

// ============= SITES =============
export async function fetchSites(): Promise<Site[]> {
  const { data, error } = await supabase.from('sites').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchSites') || [];
  return data || [];
}

export async function addSite(site: Omit<Site, 'id'>): Promise<Site | null> {
  const newSite = { id: generateId(), ...site };
  const { data, error } = await supabase.from('sites').insert([newSite]).select().single();
  if (error) return handleSupabaseError(error, 'addSite');
  return data;
}

export async function updateSite(site: Site): Promise<Site | null> {
  const { data, error } = await supabase
    .from('sites')
    .update(site)
    .eq('id', site.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateSite');
  return data;
}

export async function deleteSite(siteId: string): Promise<boolean> {
  const { error } = await supabase.from('sites').delete().eq('id', siteId);
  if (error) {
    handleSupabaseError(error, 'deleteSite');
    return false;
  }
  return true;
}

// ============= EMPLOYEES =============
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchEmployees') || [];
  return data || [];
}

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee | null> {
  const newEmployee = { id: generateId(), ...employee };
  const { data, error } = await supabase.from('employees').insert([newEmployee]).select().single();
  if (error) return handleSupabaseError(error, 'addEmployee');
  return data;
}

export async function updateEmployee(employee: Employee): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .update(employee)
    .eq('id', employee.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateEmployee');
  return data;
}

export async function deleteEmployee(employeeId: string): Promise<boolean> {
  const { error } = await supabase.from('employees').delete().eq('id', employeeId);
  if (error) {
    handleSupabaseError(error, 'deleteEmployee');
    return false;
  }
  return true;
}

export async function deleteMultipleEmployees(employeeIds: string[]): Promise<boolean> {
  const { error } = await supabase.from('employees').delete().in('id', employeeIds);
  if (error) {
    handleSupabaseError(error, 'deleteMultipleEmployees');
    return false;
  }
  return true;
}

// ============= FARMERS =============
export async function fetchFarmers(): Promise<Farmer[]> {
  const { data, error } = await supabase.from('farmers').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchFarmers') || [];
  return data || [];
}

export async function addFarmer(farmer: Omit<Farmer, 'id'>): Promise<Farmer | null> {
  const newFarmer = { id: generateId(), ...farmer };
  const { data, error } = await supabase.from('farmers').insert([newFarmer]).select().single();
  if (error) return handleSupabaseError(error, 'addFarmer');
  return data;
}

export async function updateFarmer(farmer: Farmer): Promise<Farmer | null> {
  const { data, error } = await supabase
    .from('farmers')
    .update(farmer)
    .eq('id', farmer.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateFarmer');
  return data;
}

export async function deleteFarmer(farmerId: string): Promise<boolean> {
  const { error } = await supabase.from('farmers').delete().eq('id', farmerId);
  if (error) {
    handleSupabaseError(error, 'deleteFarmer');
    return false;
  }
  return true;
}

export async function deleteMultipleFarmers(farmerIds: string[]): Promise<boolean> {
  const { error } = await supabase.from('farmers').delete().in('id', farmerIds);
  if (error) {
    handleSupabaseError(error, 'deleteMultipleFarmers');
    return false;
  }
  return true;
}

// ============= SERVICE PROVIDERS =============
export async function fetchServiceProviders(): Promise<ServiceProvider[]> {
  const { data, error } = await supabase.from('service_providers').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchServiceProviders') || [];
  return data || [];
}

export async function addServiceProvider(provider: Omit<ServiceProvider, 'id'>): Promise<ServiceProvider | null> {
  const newProvider = { id: generateId(), ...provider };
  const { data, error } = await supabase.from('service_providers').insert([newProvider]).select().single();
  if (error) return handleSupabaseError(error, 'addServiceProvider');
  return data;
}

export async function updateServiceProvider(provider: ServiceProvider): Promise<ServiceProvider | null> {
  const { data, error } = await supabase
    .from('service_providers')
    .update(provider)
    .eq('id', provider.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateServiceProvider');
  return data;
}

export async function deleteServiceProvider(providerId: string): Promise<boolean> {
  const { error } = await supabase.from('service_providers').delete().eq('id', providerId);
  if (error) {
    handleSupabaseError(error, 'deleteServiceProvider');
    return false;
  }
  return true;
}

// ============= CREDIT TYPES =============
export async function fetchCreditTypes(): Promise<CreditType[]> {
  const { data, error } = await supabase.from('credit_types').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchCreditTypes') || [];
  return data || [];
}

export async function addCreditType(creditType: Omit<CreditType, 'id'>): Promise<CreditType | null> {
  const newCreditType = { id: generateId(), ...creditType };
  const { data, error } = await supabase.from('credit_types').insert([newCreditType]).select().single();
  if (error) return handleSupabaseError(error, 'addCreditType');
  return data;
}

export async function updateCreditType(creditType: CreditType): Promise<CreditType | null> {
  const { data, error } = await supabase
    .from('credit_types')
    .update(creditType)
    .eq('id', creditType.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateCreditType');
  return data;
}

export async function deleteCreditType(creditTypeId: string): Promise<boolean> {
  const { error } = await supabase.from('credit_types').delete().eq('id', creditTypeId);
  if (error) {
    handleSupabaseError(error, 'deleteCreditType');
    return false;
  }
  return true;
}

// ============= SEAWEED TYPES =============
export async function fetchSeaweedTypes(): Promise<SeaweedType[]> {
  const { data, error } = await supabase.from('seaweed_types').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchSeaweedTypes') || [];
  return data || [];
}

export async function addSeaweedType(seaweedType: Omit<SeaweedType, 'id'>): Promise<SeaweedType | null> {
  const newType = { id: generateId(), ...seaweedType };
  const { data, error } = await supabase.from('seaweed_types').insert([newType]).select().single();
  if (error) return handleSupabaseError(error, 'addSeaweedType');
  return data;
}

export async function updateSeaweedType(seaweedType: SeaweedType): Promise<SeaweedType | null> {
  const { data, error } = await supabase
    .from('seaweed_types')
    .update(seaweedType)
    .eq('id', seaweedType.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateSeaweedType');
  return data;
}

export async function deleteSeaweedType(seaweedTypeId: string): Promise<boolean> {
  const { error } = await supabase.from('seaweed_types').delete().eq('id', seaweedTypeId);
  if (error) {
    handleSupabaseError(error, 'deleteSeaweedType');
    return false;
  }
  return true;
}

// ============= MODULES =============
export async function fetchModules(): Promise<Module[]> {
  const { data, error } = await supabase.from('modules').select('*').order('name');
  if (error) return handleSupabaseError(error, 'fetchModules') || [];
  return data || [];
}

export async function addModule(module: Omit<Module, 'id'>): Promise<Module | null> {
  const newModule = { id: generateId(), ...module };
  const { data, error } = await supabase.from('modules').insert([newModule]).select().single();
  if (error) return handleSupabaseError(error, 'addModule');
  return data;
}

export async function updateModule(module: Module): Promise<Module | null> {
  const { data, error } = await supabase
    .from('modules')
    .update(module)
    .eq('id', module.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateModule');
  return data;
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  const { error } = await supabase.from('modules').delete().eq('id', moduleId);
  if (error) {
    handleSupabaseError(error, 'deleteModule');
    return false;
  }
  return true;
}

export async function deleteMultipleModules(moduleIds: string[]): Promise<boolean> {
  const { error } = await supabase.from('modules').delete().in('id', moduleIds);
  if (error) {
    handleSupabaseError(error, 'deleteMultipleModules');
    return false;
  }
  return true;
}

// ============= CULTIVATION CYCLES =============
export async function fetchCultivationCycles(): Promise<CultivationCycle[]> {
  const { data, error } = await supabase.from('cultivation_cycles').select('*').order('planted_date', { ascending: false });
  if (error) return handleSupabaseError(error, 'fetchCultivationCycles') || [];
  return data || [];
}

export async function addCultivationCycle(cycle: Omit<CultivationCycle, 'id'>): Promise<CultivationCycle | null> {
  const newCycle = { id: generateId(), ...cycle };
  const { data, error } = await supabase.from('cultivation_cycles').insert([newCycle]).select().single();
  if (error) return handleSupabaseError(error, 'addCultivationCycle');
  return data;
}

export async function updateCultivationCycle(cycle: CultivationCycle): Promise<CultivationCycle | null> {
  const { data, error } = await supabase
    .from('cultivation_cycles')
    .update(cycle)
    .eq('id', cycle.id)
    .select()
    .single();
  if (error) return handleSupabaseError(error, 'updateCultivationCycle');
  return data;
}

export async function deleteCultivationCycle(cycleId: string): Promise<boolean> {
  const { error } = await supabase.from('cultivation_cycles').delete().eq('id', cycleId);
  if (error) {
    handleSupabaseError(error, 'deleteCultivationCycle');
    return false;
  }
  return true;
}

// Helper to fetch all data at once for initial load
export async function fetchAllData() {
  const [
    sites,
    employees,
    farmers,
    serviceProviders,
    creditTypes,
    seaweedTypes,
    modules,
    cultivationCycles,
  ] = await Promise.all([
    fetchSites(),
    fetchEmployees(),
    fetchFarmers(),
    fetchServiceProviders(),
    fetchCreditTypes(),
    fetchSeaweedTypes(),
    fetchModules(),
    fetchCultivationCycles(),
  ]);

  return {
    sites,
    employees,
    farmers,
    serviceProviders,
    creditTypes,
    seaweedTypes,
    modules,
    cultivationCycles,
  };
}
