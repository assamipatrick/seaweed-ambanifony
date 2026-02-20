
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { Site, Farmer, CreditType, FarmerCredit, Employee, SeaweedType, Module, CultivationCycle, ModuleStatusHistory, StockMovement, PressingSlip, PressedStockMovement, ExportDocument, SiteTransfer, ServiceProvider, SeaweedPriceHistory, Repayment, FarmerDelivery, CuttingOperation, SiteTransferHistoryEntry, Incident, IncidentType, IncidentSeverity, PeriodicTest, Role, MonthlyPayment, TestPeriod, PestObservation, User, Invitation, MessageLog, GalleryPhoto } from '../types';
import { ModuleStatus, StockMovementType, PressedStockMovementType, SiteTransferStatus, ExportDocType, ContainerType, IncidentStatus, RecipientType, InvitationStatus, FarmerStatus, EmployeeStatus, ServiceProviderStatus } from '../types';
import { PERMISSIONS } from '../permissions';
import { useFirebaseSync } from '../hooks/useFirebaseSync';

// --- Default Seed Data ---
const defaultIncidentTypes: IncidentType[] = [
    { id: 'ENVIRONMENTAL', name: 'Environmental', isDefault: true },
    { id: 'EQUIPMENT_FAILURE', name: 'Equipment Failure', isDefault: true },
    { id: 'PEST_DISEASE', name: 'Pest/Disease', isDefault: true },
    { id: 'SECURITY', name: 'Security', isDefault: true },
    { id: 'OTHER', name: 'Other', isDefault: true },
];
const defaultIncidentSeverities: IncidentSeverity[] = [
    { id: 'LOW', name: 'Low', isDefault: true },
    { id: 'MEDIUM', name: 'Medium', isDefault: true },
    { id: 'HIGH', name: 'High', isDefault: true },
    { id: 'CRITICAL', name: 'Critical', isDefault: true },
];
const defaultRoles: Role[] = [
    { 
        id: 'SITE_MANAGER', 
        name: 'Site Manager (Admin)', 
        permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.OPERATIONS_VIEW,
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.STAKEHOLDERS_VIEW,
            PERMISSIONS.MONITORING_VIEW,
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.SETTINGS_VIEW,
            PERMISSIONS.USERS_VIEW,
            PERMISSIONS.ROLES_VIEW,
            PERMISSIONS.SITES_VIEW,
            PERMISSIONS.MODULES_VIEW,
            PERMISSIONS.SITES_MANAGE, 
            PERMISSIONS.MODULES_MANAGE, 
            PERMISSIONS.EMPLOYEES_MANAGE, 
            PERMISSIONS.FARMERS_MANAGE, 
            PERMISSIONS.INCIDENTS_MANAGE,
            PERMISSIONS.SETTINGS_GENERAL_MANAGE,
            PERMISSIONS.ROLES_MANAGE,
            PERMISSIONS.USERS_INVITE,
            PERMISSIONS.PAYMENTS_MANAGE,
            PERMISSIONS.CREDITS_MANAGE,
            PERMISSIONS.PAYROLL_MANAGE,
            PERMISSIONS.INVENTORY_MANAGE_ON_SITE,
            PERMISSIONS.EXPORTS_MANAGE,
            PERMISSIONS.GALLERY_VIEW,
            PERMISSIONS.GALLERY_MANAGE
        ], 
        isDefault: true 
    },
    { 
        id: 'OPERATIONS_LEAD', 
        name: 'Directeur des Opérations (Admin)', 
        permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.OPERATIONS_VIEW,
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.STAKEHOLDERS_VIEW,
            PERMISSIONS.MONITORING_VIEW,
            PERMISSIONS.REPORTS_VIEW,
            PERMISSIONS.SETTINGS_VIEW,
            PERMISSIONS.USERS_VIEW,
            PERMISSIONS.ROLES_VIEW,
            PERMISSIONS.SITES_VIEW,
            PERMISSIONS.MODULES_VIEW,
            PERMISSIONS.SITES_MANAGE, 
            PERMISSIONS.MODULES_MANAGE, 
            PERMISSIONS.EMPLOYEES_MANAGE, 
            PERMISSIONS.FARMERS_MANAGE, 
            PERMISSIONS.INCIDENTS_MANAGE,
            PERMISSIONS.SETTINGS_GENERAL_MANAGE,
            PERMISSIONS.ROLES_MANAGE,
            PERMISSIONS.USERS_INVITE,
            PERMISSIONS.PAYMENTS_MANAGE,
            PERMISSIONS.CREDITS_MANAGE,
            PERMISSIONS.PAYROLL_MANAGE,
            PERMISSIONS.INVENTORY_MANAGE_ON_SITE,
            PERMISSIONS.EXPORTS_MANAGE,
            PERMISSIONS.GALLERY_VIEW,
            PERMISSIONS.GALLERY_MANAGE
        ], 
        isDefault: true 
    },
    { 
        id: 'ACCOUNTANT', 
        name: 'Accountant', 
        permissions: [
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.STAKEHOLDERS_VIEW,
            PERMISSIONS.PAYMENTS_VIEW,
            PERMISSIONS.PAYMENTS_MANAGE, 
            PERMISSIONS.CREDITS_VIEW,
            PERMISSIONS.CREDITS_MANAGE, 
            PERMISSIONS.PAYROLL_VIEW,
            PERMISSIONS.PAYROLL_MANAGE,
            PERMISSIONS.REPORTS_VIEW
        ], 
        isDefault: true 
    },
];

const defaultUsers: User[] = [
  { id: 'user-admin', email: 'admin@seafarm.com', password: 'password', firstName: 'Admin', lastName: 'User', roleId: 'OPERATIONS_LEAD' }
];
const defaultCreditTypes: CreditType[] = [
    { id: 'ct-1', name: 'Rice', hasQuantity: true, unit: 'Kg', hasUnitPrice: true, isDirectAmount: false },
    { id: 'ct-2', name: 'Cash Advance', hasQuantity: false, hasUnitPrice: false, isDirectAmount: true },
    { id: 'ct-3', name: 'Cutting Service Fee', hasQuantity: false, unit: '', hasUnitPrice: false, isDirectAmount: true },
];


// --- Helper function for localStorage ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      return defaultValue;
    }
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage`, error);
    return defaultValue;
  }
}

interface DataContextType {
  sites: Site[];
  addSite: (site: Omit<Site, 'id'>) => void;
  updateSite: (site: Site) => void;
  deleteSite: (siteId: string) => void;
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  deleteMultipleEmployees: (employeeIds: string[]) => void;
  updateEmployeesSite: (employeeIds: string[], siteId: string) => void;
  farmers: Farmer[];
  addFarmer: (farmer: Omit<Farmer, 'id'>) => void;
  updateFarmer: (farmer: Farmer) => void;
  deleteFarmer: (farmerId: string) => void;
  deleteMultipleFarmers: (farmerIds: string[]) => void;
  updateFarmersSite: (farmerIds: string[], siteId: string) => void;
  getFarmersBySite: (siteId: string) => Farmer[];
  serviceProviders: ServiceProvider[];
  addServiceProvider: (provider: Omit<ServiceProvider, 'id'>) => void;
  updateServiceProvider: (provider: ServiceProvider) => void;
  deleteServiceProvider: (providerId: string) => void;
  creditTypes: CreditType[];
  addCreditType: (creditType: Omit<CreditType, 'id'>) => void;
  updateCreditType: (creditType: CreditType) => void;
  deleteCreditType: (creditTypeId: string) => void;
  farmerCredits: FarmerCredit[];
  addFarmerCredit: (credit: Omit<FarmerCredit, 'id'>) => void;
  addMultipleFarmerCredits: (credits: Omit<FarmerCredit, 'id'>[]) => void;
  repayments: Repayment[];
  addRepayment: (repayment: Omit<Repayment, 'id'>) => void;
  addMultipleRepayments: (repayments: Omit<Repayment, 'id'>[]) => void;
  monthlyPayments: MonthlyPayment[];
  addMonthlyPayment: (payment: Omit<MonthlyPayment, 'id'>) => void;
  addMultipleMonthlyPayments: (payments: Omit<MonthlyPayment, 'id'>[]) => void;
  updateMonthlyPayment: (payment: MonthlyPayment) => void;
  deleteMonthlyPayment: (paymentId: string) => void;
  seaweedTypes: SeaweedType[];
  addSeaweedType: (seaweedType: Omit<SeaweedType, 'id' | 'priceHistory'>) => void;
  updateSeaweedType: (seaweedType: SeaweedType) => void;
  deleteSeaweedType: (seaweedTypeId: string) => void;
  updateSeaweedPrices: (seaweedTypeId: string, newPrice: SeaweedPriceHistory) => void;
  modules: Module[];
  cultivationCycles: CultivationCycle[];
  addModule: (moduleData: Omit<Module, 'id' | 'farmerId' | 'statusHistory'>) => void;
  updateModule: (moduleData: Module) => void;
  deleteModule: (moduleId: string) => void;
  deleteMultipleModules: (moduleIds: string[]) => void;
  updateModulesFarmer: (moduleIds: string[], farmerId: string) => void;
  addCultivationCycle: (cycleData: Omit<CultivationCycle, 'id'>, farmerId: string) => void;
  updateCultivationCycle: (cycleData: CultivationCycle) => void;
  updateMultipleCultivationCycles: (cycles: CultivationCycle[]) => void;
  deleteCultivationCycle: (cycleId: string) => void;
  startCultivationFromCuttings: (cuttingData: Omit<CuttingOperation, 'id'>, cycleData: Omit<CultivationCycle, 'id'>, beneficiaryFarmerId: string) => void;
  stockMovements: StockMovement[];
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addMultipleStockMovements: (movements: Omit<StockMovement, 'id'>[]) => void;
  recordReturnFromPressing: (data: {
    date: string;
    siteId: string;
    seaweedTypeId: string;
    designation: string;
    kg: number;
    bags: number;
    pressingSlipId: string;
  }) => void;
  farmerDeliveries: FarmerDelivery[];
  addFarmerDelivery: (data: Omit<FarmerDelivery, 'id' | 'slipNo'>) => void;
  deleteFarmerDelivery: (deliveryId: string) => void;
  addInitialStock: (data: Omit<StockMovement, 'id' | 'type' | 'relatedId'>) => void;
  transferBaggedToStock: (cycleIds: string[], date?: string) => void;
  exportStockBatch: (cycleId: string) => void;
  pressingSlips: PressingSlip[];
  pressedStockMovements: PressedStockMovement[];
  addPressingSlip: (slipData: Omit<PressingSlip, 'id' | 'slipNo'>) => void;
  updatePressingSlip: (slip: PressingSlip) => void;
  deletePressingSlip: (slipId: string) => void;
  addInitialPressedStock: (data: Omit<PressedStockMovement, 'id' | 'type' | 'relatedId'>) => void;
  addPressedStockAdjustment: (data: Omit<PressedStockMovement, 'id' | 'relatedId'>) => void;
  exportDocuments: ExportDocument[];
  addExportDocument: (docData: Omit<ExportDocument, 'id' | 'docNo'>, sourceSiteId: string) => void;
  updateExportDocument: (docData: ExportDocument) => void;
  deleteExportDocument: (docId: string) => void;
  siteTransfers: SiteTransfer[];
  addSiteTransfer: (transferData: Omit<SiteTransfer, 'id' | 'status' | 'history'>) => void;
  updateSiteTransfer: (transfer: SiteTransfer) => void;
  cuttingOperations: CuttingOperation[];
  addCuttingOperation: (operationData: Omit<CuttingOperation, 'id'>) => void;
  updateCuttingOperation: (operation: CuttingOperation, moduleWeights?: Record<string, number>, plantingDate?: string) => void;
  updateMultipleCuttingOperations: (operationIds: string[], paymentDate: string) => void;
  deleteCuttingOperation: (operationId: string) => void;
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (incident: Incident) => void;
  deleteIncident: (incidentId: string) => void;
  incidentTypes: IncidentType[];
  addIncidentType: (type: Omit<IncidentType, 'id'>) => void;
  updateIncidentType: (type: IncidentType) => void;
  deleteIncidentType: (typeId: string) => void;
  incidentSeverities: IncidentSeverity[];
  addIncidentSeverity: (severity: Omit<IncidentSeverity, 'id'>) => void;
  updateIncidentSeverity: (severity: IncidentSeverity) => void;
  deleteIncidentSeverity: (severityId: string) => void;
  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => Role | undefined;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => void;
  periodicTests: PeriodicTest[];
  addPeriodicTest: (test: Omit<PeriodicTest, 'id'>) => void;
  updatePeriodicTest: (test: PeriodicTest) => void;
  deletePeriodicTest: (testId: string) => void;
  pestObservations: PestObservation[];
  users: User[];
  findUserByEmail: (email: string) => User | undefined;
  addUser: (userData: Omit<User, 'id'>, invitationToken?: string) => User | undefined;
  setUserPasswordResetToken: (email: string, token: string, expires: Date) => boolean;
  findUserByPasswordResetToken: (token: string) => User | undefined;
  updateUserPassword: (userId: string, newPassword: string) => boolean;
  updateUser: (user: User) => void;
  markCyclesAsPaid: (cycleIds: string[], paymentRunId: string) => void;
  markDeliveriesAsPaid: (deliveryIds: string[], paymentRunId: string) => void;
  invitations: Invitation[];
  addInvitation: (data: Omit<Invitation, 'id' | 'token' | 'createdAt'>) => Invitation;
  deleteInvitation: (invitationId: string) => void;
  findInvitationByToken: (token: string) => Invitation | undefined;
  addMessageLog: (log: Omit<MessageLog, 'id'>) => void;
  messageLogs: MessageLog[];
  galleryPhotos: GalleryPhoto[];
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  updateGalleryPhotoComment: (id: string, comment: string) => void;
  deleteGalleryPhoto: (id: string) => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<Site[]>(() => loadFromStorage('sites', []));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('employees', []));
  const [farmers, setFarmers] = useState<Farmer[]>(() => loadFromStorage('farmers', []));
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(() => loadFromStorage('serviceProviders', []));
  const [creditTypes, setCreditTypes] = useState<CreditType[]>(() => loadFromStorage('creditTypes', defaultCreditTypes));
  const [farmerCredits, setFarmerCredits] = useState<FarmerCredit[]>(() => loadFromStorage('farmerCredits', []));
  const [repayments, setRepayments] = useState<Repayment[]>(() => loadFromStorage('repayments', []));
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>(() => loadFromStorage('monthlyPayments', []));
  const [seaweedTypes, setSeaweedTypes] = useState<SeaweedType[]>(() => loadFromStorage('seaweedTypes', []));
  const [modules, setModules] = useState<Module[]>(() => loadFromStorage('modules', []));
  const [cultivationCycles, setCultivationCycles] = useState<CultivationCycle[]>(() => loadFromStorage('cultivationCycles', []));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadFromStorage('stockMovements', []));
  const [pressingSlips, setPressingSlips] = useState<PressingSlip[]>(() => loadFromStorage('pressingSlips', []));
  const [pressedStockMovements, setPressedStockMovements] = useState<PressedStockMovement[]>(() => loadFromStorage('pressedStockMovements', []));
  const [exportDocuments, setExportDocuments] = useState<ExportDocument[]>(() => loadFromStorage('exportDocuments', []));
  const [siteTransfers, setSiteTransfers] = useState<SiteTransfer[]>(() => loadFromStorage('siteTransfers', []));
  const [cuttingOperations, setCuttingOperations] = useState<CuttingOperation[]>(() => loadFromStorage('cuttingOperations', []));
  const [farmerDeliveries, setFarmerDeliveries] = useState<FarmerDelivery[]>(() => loadFromStorage('farmerDeliveries', []));
  const [incidents, setIncidents] = useState<Incident[]>(() => loadFromStorage('incidents', []));
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>(() => loadFromStorage('incidentTypes', defaultIncidentTypes));
  const [incidentSeverities, setIncidentSeverities] = useState<IncidentSeverity[]>(() => loadFromStorage('incidentSeverities', defaultIncidentSeverities));
  const [roles, setRoles] = useState<Role[]>(() => loadFromStorage('roles', defaultRoles));
  const [periodicTests, setPeriodicTests] = useState<PeriodicTest[]>(() => loadFromStorage('periodicTests', []));
  const [pestObservations, setPestObservations] = useState<PestObservation[]>(() => loadFromStorage('pestObservations', []));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', defaultUsers));
  const [invitations, setInvitations] = useState<Invitation[]>(() => loadFromStorage('invitations', []));
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => loadFromStorage('messageLogs', []));
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => loadFromStorage('galleryPhotos', []));
  
  const seedInitialized = useRef(false);

  // ========== FIREBASE REAL-TIME SYNC ==========
  // Sync main entities with Firebase Realtime Database
  useFirebaseSync({
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
  });
  
  // Keep localStorage as fallback cache
  useEffect(() => { localStorage.setItem('sites', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('farmers', JSON.stringify(farmers)); }, [farmers]);
  useEffect(() => { localStorage.setItem('serviceProviders', JSON.stringify(serviceProviders)); }, [serviceProviders]);
  useEffect(() => { localStorage.setItem('creditTypes', JSON.stringify(creditTypes)); }, [creditTypes]);
  useEffect(() => { localStorage.setItem('farmerCredits', JSON.stringify(farmerCredits)); }, [farmerCredits]);
  useEffect(() => { localStorage.setItem('repayments', JSON.stringify(repayments)); }, [repayments]);
  useEffect(() => { localStorage.setItem('monthlyPayments', JSON.stringify(monthlyPayments)); }, [monthlyPayments]);
  useEffect(() => { localStorage.setItem('seaweedTypes', JSON.stringify(seaweedTypes)); }, [seaweedTypes]);
  useEffect(() => { localStorage.setItem('modules', JSON.stringify(modules)); }, [modules]);
  useEffect(() => { localStorage.setItem('cultivationCycles', JSON.stringify(cultivationCycles)); }, [cultivationCycles]);
  useEffect(() => { localStorage.setItem('stockMovements', JSON.stringify(stockMovements)); }, [stockMovements]);
  useEffect(() => { localStorage.setItem('pressingSlips', JSON.stringify(pressingSlips)); }, [pressingSlips]);
  useEffect(() => { localStorage.setItem('pressedStockMovements', JSON.stringify(pressedStockMovements)); }, [pressedStockMovements]);
  useEffect(() => { localStorage.setItem('exportDocuments', JSON.stringify(exportDocuments)); }, [exportDocuments]);
  useEffect(() => { localStorage.setItem('siteTransfers', JSON.stringify(siteTransfers)); }, [siteTransfers]);
  useEffect(() => { localStorage.setItem('cuttingOperations', JSON.stringify(cuttingOperations)); }, [cuttingOperations]);
  useEffect(() => { localStorage.setItem('farmerDeliveries', JSON.stringify(farmerDeliveries)); }, [farmerDeliveries]);
  useEffect(() => { localStorage.setItem('incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem('incidentTypes', JSON.stringify(incidentTypes)); }, [incidentTypes]);
  useEffect(() => { localStorage.setItem('incidentSeverities', JSON.stringify(incidentSeverities)); }, [incidentSeverities]);
  useEffect(() => { localStorage.setItem('roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('periodicTests', JSON.stringify(periodicTests)); }, [periodicTests]);
  useEffect(() => { localStorage.setItem('pestObservations', JSON.stringify(pestObservations)); }, [pestObservations]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('invitations', JSON.stringify(invitations)); }, [invitations]);
  useEffect(() => { localStorage.setItem('messageLogs', JSON.stringify(messageLogs)); }, [messageLogs]);
  useEffect(() => { localStorage.setItem('galleryPhotos', JSON.stringify(galleryPhotos)); }, [galleryPhotos]);

  // Seeding logic
  useEffect(() => {
    if (seedInitialized.current) return;
    seedInitialized.current = true;
    
    const reqSlipId = 'ps-req-002';
    if (!pressingSlips.some(s => s.id === reqSlipId)) {
        let targetTypeId = 'seaweed-type-1';
        let typeToUse = seaweedTypes.find(t => t.id === targetTypeId);
        if (!typeToUse) {
            const newType = {
                id: targetTypeId,
                name: 'Spinosum (Type 1)',
                scientificName: 'Eucheuma denticulatum',
                description: 'Requested Seaweed Type',
                wetPrice: 400,
                dryPrice: 1800,
                priceHistory: []
            };
            setSeaweedTypes(prev => [...prev, newType]);
        }
        const initStock: PressedStockMovement = {
            id: `psm-init-${reqSlipId}`,
            date: new Date().toISOString().split('T')[0],
            siteId: 'pressing-warehouse',
            seaweedTypeId: targetTypeId,
            type: PressedStockMovementType.BULK_IN_FROM_SITE,
            designation: 'Initial Bulk Stock (Seed)',
            inKg: 1000,
            inBales: 20
        };
        const slip: PressingSlip = {
            id: reqSlipId,
            slipNo: 'PRESS-REQ-TODAY',
            date: new Date().toISOString().split('T')[0],
            sourceSiteId: 'pressing-warehouse',
            seaweedTypeId: targetTypeId,
            consumedWeightKg: 500,
            consumedBags: 8,
            producedWeightKg: 150,
            producedBalesCount: 15
        };
        const consMove: PressedStockMovement = {
            id: `psm-cons-${reqSlipId}`,
            date: new Date().toISOString().split('T')[0],
            siteId: 'pressing-warehouse',
            seaweedTypeId: targetTypeId,
            type: PressedStockMovementType.PRESSING_CONSUMPTION,
            designation: `Consumed for Pressing Slip ${slip.slipNo}`,
            outKg: 500,
            outBales: 8,
            relatedId: reqSlipId
        };
        const prodMove: PressedStockMovement = {
            id: `psm-prod-${reqSlipId}`,
            date: new Date().toISOString().split('T')[0],
            siteId: 'pressing-warehouse',
            seaweedTypeId: targetTypeId,
            type: PressedStockMovementType.PRESSING_IN,
            designation: `Produced from Pressing Slip ${slip.slipNo}`,
            inKg: 150,
            inBales: 15,
            relatedId: reqSlipId
        };
        setPressedStockMovements(prev => [...prev, initStock, consMove, prodMove]);
        setPressingSlips(prev => [...prev, slip]);
    }
  }, [pressingSlips, seaweedTypes]);

  const addSite = (site: Omit<Site, 'id'>) => {
    const newSite = { ...site, id: crypto.randomUUID() };
    // Update local state immediately (optimistic update)
    setSites(prev => [...prev, newSite]);
    // Sync to Supabase in background (non-blocking)
    import('../lib/firebaseService').then(m => m.addSite(newSite)).catch(err => console.error('[addSite] Firebase sync failed:', err));
  };
  
  const updateSite = (updatedSite: Site) => {
    // Update local state immediately
    setSites(prev => prev.map(s => s.id === updatedSite.id ? updatedSite : s));
    // Sync to Supabase in background
    import('../lib/firebaseService').then(m => m.updateSite(updatedSite)).catch(err => console.error('[updateSite] Firebase sync failed:', err));
  };
  
  const deleteSite = (siteId: string) => {
    // Update local state immediately
    setSites(prev => prev.filter(s => s.id !== siteId));
    // Sync to Supabase in background
    import('../lib/firebaseService').then(m => m.deleteSite(siteId)).catch(err => console.error('[deleteSite] Firebase sync failed:', err));
  };
  const getFarmersBySite = (siteId: string) => farmers.filter(f => f.siteId === siteId);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
      const newEmployee: Employee = {
          ...employee,
          id: crypto.randomUUID(),
          status: EmployeeStatus.ACTIVE,
          hireDate: employee.hireDate || new Date().toISOString().split('T')[0]
      };
      setEmployees(prev => [...prev, newEmployee]);
      import('../lib/firebaseService').then(m => m.addEmployee(newEmployee)).catch(err => console.error('[addEmployee] Firebase sync failed:', err));
  };
  
  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    import('../lib/firebaseService').then(m => m.updateEmployee(updatedEmployee)).catch(err => console.error('[updateEmployee] Firebase sync failed:', err));
  };
  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    setSites(prevSites => prevSites.map(site => site.managerId === employeeId ? { ...site, managerId: undefined } : site));
    import('../lib/firebaseService').then(m => m.deleteEmployee(employeeId)).catch(err => console.error('[deleteEmployee] Firebase sync failed:', err));
  };
  
  const deleteMultipleEmployees = (employeeIds: string[]) => {
    const idSet = new Set(employeeIds);
    setEmployees(prev => prev.filter(e => !idSet.has(e.id)));
    setSites(prevSites => prevSites.map(site => site.managerId && idSet.has(site.managerId) ? { ...site, managerId: undefined } : site));
    import('../lib/firebaseService').then(m => m.deleteMultipleEmployees(employeeIds)).catch(err => console.error('[deleteMultipleEmployees] Firebase sync failed:', err));
  };
  const updateEmployeesSite = (employeeIds: string[], siteId: string) => {
    const idSet = new Set(employeeIds);
    setEmployees(prev => prev.map(e => (idSet.has(e.id) ? { ...e, siteId } : e)));
  };

  const addFarmer = (farmer: Omit<Farmer, 'id'>) => {
    const newFarmer: Farmer = {
        ...farmer,
        id: crypto.randomUUID(),
        status: farmer.status || FarmerStatus.ACTIVE,
        joinDate: farmer.joinDate || new Date().toISOString().split('T')[0]
    };
    setFarmers(prev => [...prev, newFarmer]);
    import('../lib/firebaseService').then(m => m.addFarmer(newFarmer)).catch(err => console.error('[addFarmer] Firebase sync failed:', err));
  };
  
  const updateFarmer = (updatedFarmer: Farmer) => {
    setFarmers(prev => prev.map(f => f.id === updatedFarmer.id ? updatedFarmer : f));
    import('../lib/firebaseService').then(m => m.updateFarmer(updatedFarmer)).catch(err => console.error('[updateFarmer] Firebase sync failed:', err));
  };
  
  const deleteFarmer = (farmerId: string) => {
    setFarmers(prev => prev.filter(f => f.id !== farmerId));
    setFarmerCredits(prev => prev.filter(fc => fc.farmerId !== farmerId));
    setRepayments(prev => prev.filter(r => r.farmerId !== farmerId));
    import('../lib/firebaseService').then(m => m.deleteFarmer(farmerId)).catch(err => console.error('[deleteFarmer] Firebase sync failed:', err));
  };
  
  const deleteMultipleFarmers = (farmerIds: string[]) => {
    const idSet = new Set(farmerIds);
    setFarmers(prev => prev.filter(f => !idSet.has(f.id)));
    setFarmerCredits(prev => prev.filter(fc => !idSet.has(fc.farmerId)));
    setRepayments(prev => prev.filter(r => !idSet.has(r.farmerId)));
    import('../lib/firebaseService').then(m => m.deleteMultipleFarmers(farmerIds)).catch(err => console.error('[deleteMultipleFarmers] Firebase sync failed:', err));
  };
  const updateFarmersSite = (farmerIds: string[], siteId: string) => {
    const idSet = new Set(farmerIds);
    setFarmers(prev => prev.map(f => (idSet.has(f.id) ? { ...f, siteId } : f)));
  };

  const addServiceProvider = (provider: Omit<ServiceProvider, 'id'>) => {
      const newProvider: ServiceProvider = {
          ...provider,
          id: `sp-${Date.now()}`,
          status: ServiceProviderStatus.ACTIVE,
          joinDate: provider.joinDate || new Date().toISOString().split('T')[0]
      };
      setServiceProviders(prev => [...prev, newProvider]);
  };
  const updateServiceProvider = (updatedProvider: ServiceProvider) => setServiceProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
  const deleteServiceProvider = (providerId: string) => setServiceProviders(prev => prev.filter(p => p.id !== providerId));

  const addCreditType = (creditType: Omit<CreditType, 'id'>) => setCreditTypes(prev => [...prev, { ...creditType, id: `ct-${Date.now()}` }]);
  const updateCreditType = (updatedCreditType: CreditType) => setCreditTypes(prev => prev.map(ct => ct.id === updatedCreditType.id ? updatedCreditType : ct));
  const deleteCreditType = (creditTypeId: string) => {
    setCreditTypes(prev => prev.filter(ct => ct.id !== creditTypeId));
    setFarmerCredits(prev => prev.filter(fc => fc.creditTypeId !== creditTypeId));
  };
  const addFarmerCredit = (credit: Omit<FarmerCredit, 'id'>) => setFarmerCredits(prev => [...prev, { ...credit, id: `fc-${Date.now()}` }]);
  const addMultipleFarmerCredits = (credits: Omit<FarmerCredit, 'id'>[]) => {
    const newCredits = credits.map(credit => ({...credit, id: `fc-${Date.now()}-${Math.random()}`}));
    setFarmerCredits(prev => [...prev, ...newCredits]);
  };
  const addRepayment = (repayment: Omit<Repayment, 'id'>) => setRepayments(prev => [...prev, { ...repayment, id: `rep-${Date.now()}` }]);
  const addMultipleRepayments = (repayments: Omit<Repayment, 'id'>[]) => {
      const newRepayments = repayments.map(repayment => ({...repayment, id: `rep-${Date.now()}-${Math.random()}`}));
      setRepayments(prev => [...prev, ...newRepayments]);
  };

  const addMonthlyPayment = (payment: Omit<MonthlyPayment, 'id'>) => {
    const newPayment: MonthlyPayment = { ...payment, id: `pay-${Date.now()}` };
    setMonthlyPayments(prev => [...prev, newPayment]);
  };
  const addMultipleMonthlyPayments = (payments: Omit<MonthlyPayment, 'id'>[]) => {
    const newPayments = payments.map(p => ({ ...p, id: `pay-${Date.now()}-${Math.random()}` }));
    setMonthlyPayments(prev => [...prev, ...newPayments]);
  };
  const updateMonthlyPayment = (updatedPayment: MonthlyPayment) => setMonthlyPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  const deleteMonthlyPayment = (paymentId: string) => setMonthlyPayments(prev => prev.filter(p => p.id !== paymentId));

  const addSeaweedType = (seaweedType: Omit<SeaweedType, 'id' | 'priceHistory'>) => {
    const newType: SeaweedType = {
        ...seaweedType,
        id: `st-${Date.now()}`,
        priceHistory: [{ date: new Date().toISOString().split('T')[0], wetPrice: seaweedType.wetPrice, dryPrice: seaweedType.dryPrice }],
    };
    setSeaweedTypes(prev => [...prev, newType]);
  };
  const updateSeaweedType = (updatedType: SeaweedType) => setSeaweedTypes(prev => prev.map(st => st.id === updatedType.id ? updatedType : st));
  const deleteSeaweedType = (seaweedTypeId: string) => setSeaweedTypes(prev => prev.filter(st => st.id !== seaweedTypeId));
  const updateSeaweedPrices = (seaweedTypeId: string, newPrice: SeaweedPriceHistory) => {
    setSeaweedTypes(prev => prev.map(st => st.id === seaweedTypeId ? { ...st, wetPrice: newPrice.wetPrice, dryPrice: newPrice.dryPrice, priceHistory: [...st.priceHistory, newPrice] } : st));
  };

  const addModule = (moduleData: Omit<Module, 'id' | 'farmerId' | 'statusHistory'>) => {
    const newModule: Module = { 
      ...moduleData, 
      id: crypto.randomUUID(),
      statusHistory: [{ status: ModuleStatus.CREATED, date: new Date().toISOString() }, { status: ModuleStatus.FREE, date: new Date().toISOString(), notes: 'Module is ready for assignment.' }]
    };
    setModules(prev => [...prev, newModule]);
    import('../lib/firebaseService').then(m => m.addModule(newModule)).catch(err => console.error('[addModule] Firebase sync failed:', err));
  };
  
  const updateModule = (moduleData: Module) => {
    setModules(prev => prev.map(m => m.id === moduleData.id ? moduleData : m));
    import('../lib/firebaseService').then(m => m.updateModule(moduleData)).catch(err => console.error('[updateModule] Firebase sync failed:', err));
  };
  
  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setCultivationCycles(prev => prev.filter(c => c.moduleId !== moduleId));
    import('../lib/firebaseService').then(m => m.deleteModule(moduleId)).catch(err => console.error('[deleteModule] Firebase sync failed:', err));
  };
  
  const deleteMultipleModules = (moduleIds: string[]) => {
    const idSet = new Set(moduleIds);
    setModules(prev => prev.filter(m => !idSet.has(m.id)));
    setCultivationCycles(prev => prev.filter(c => c.moduleId && !idSet.has(c.moduleId)));
    import('../lib/firebaseService').then(m => m.deleteMultipleModules(moduleIds)).catch(err => console.error('[deleteMultipleModules] Firebase sync failed:', err));
  };
  const updateModulesFarmer = (moduleIds: string[], farmerId: string) => {
    const idSet = new Set(moduleIds);
    const farmer = farmers.find(f => f.id === farmerId);
    if (!farmer) return;
    setModules(prev => prev.map(m => idSet.has(m.id) ? { ...m, farmerId, statusHistory: [...m.statusHistory, { status: ModuleStatus.ASSIGNED, date: new Date().toISOString(), notes: `Assigned to farmer ${farmer.firstName} ${farmer.lastName}` }] } : m));
  };

  const addCultivationCycle = (cycleData: Omit<CultivationCycle, 'id'>, farmerId: string) => {
    const latestCuttingOp = cycleData.cuttingOperationId ? cuttingOperations.find(op => op.id === cycleData.cuttingOperationId) : undefined;
    const module = modules.find(m => m.id === cycleData.moduleId);
    if (!module) return;

    const newCycle: CultivationCycle = { 
        ...cycleData, 
        id: `cyc-${Date.now()}`,
        linesPlanted: cycleData.linesPlanted || module.lines,
        cuttingOperationId: cycleData.cuttingOperationId || latestCuttingOp?.id // Fixed logic: prioritize cycleData.cuttingOperationId
    };
    setCultivationCycles(prev => [...prev, newCycle]);

    const farmer = farmers.find(f => f.id === farmerId);
    setModules(prev => prev.map(m => {
        if (m.id === cycleData.moduleId) {
            const newHistory: ModuleStatusHistory[] = [...m.statusHistory];
            if (latestCuttingOp) newHistory.push({ status: ModuleStatus.CUTTING, date: latestCuttingOp.date });
            newHistory.push({ status: ModuleStatus.ASSIGNED, date: cycleData.plantingDate, notes: `Assigned to farmer ${farmer?.firstName} ${farmer?.lastName}` });
            newHistory.push({ status: ModuleStatus.PLANTED, date: cycleData.plantingDate });
            return { ...m, farmerId: farmerId, statusHistory: newHistory };
        }
        return m;
    }));
  };

  const updateCultivationCycle = (cycleData: CultivationCycle) => {
    let originalCycle: CultivationCycle | undefined;
    setCultivationCycles(prev => {
        originalCycle = prev.find(c => c.id === cycleData.id);
        return prev.map(c => c.id === cycleData.id ? cycleData : c);
    });

    // SYNC back to CuttingOperation
    if (cycleData.cuttingOperationId) {
        setCuttingOperations(prevOps => prevOps.map(op => {
            if (op.id === cycleData.cuttingOperationId) {
                const newModuleCuts = op.moduleCuts.map(mc => {
                    if (mc.moduleId === cycleData.moduleId) {
                        return { ...mc, linesCut: cycleData.linesPlanted || mc.linesCut };
                    }
                    return mc;
                });

                const newTotalAmount = newModuleCuts.reduce((sum, mc) => sum + (mc.linesCut * op.unitPrice), 0);

                return {
                    ...op,
                    seaweedTypeId: cycleData.seaweedTypeId,
                    moduleCuts: newModuleCuts,
                    totalAmount: newTotalAmount
                };
            }
            return op;
        }));
    }

    if (originalCycle && originalCycle.status !== cycleData.status) {
        setModules(prev => prev.map(m => {
            if (m.id === cycleData.moduleId) {
                const statusDate = cycleData.exportDate || cycleData.stockDate || cycleData.baggingStartDate || cycleData.dryingStartDate || cycleData.harvestDate || new Date().toISOString();
                const newHistory = [...m.statusHistory, { status: cycleData.status, date: statusDate }];
                let updatedModule = { ...m, statusHistory: newHistory };
                if (cycleData.status === ModuleStatus.IN_STOCK) {
                    newHistory.push({ status: ModuleStatus.FREE, date: cycleData.stockDate || new Date().toISOString(), notes: 'Cycle completed. Module is available.' });
                    updatedModule = { ...updatedModule, farmerId: undefined };
                }
                return updatedModule;
            }
            return m;
        }));
    }
  };

  const updateMultipleCultivationCycles = (cyclesToUpdate: CultivationCycle[]) => {
    const cyclesMap = new Map(cyclesToUpdate.map(c => [c.id, c]));
    setCultivationCycles(prev => prev.map(c => cyclesMap.get(c.id) || c));

    const modulesToUpdateMap = new Map<string, CultivationCycle>();
    cyclesToUpdate.forEach(c => { if (c.status === ModuleStatus.IN_STOCK) modulesToUpdateMap.set(c.moduleId, c); });

    if (modulesToUpdateMap.size > 0) {
        setModules(prevModules => prevModules.map(m => {
            if (modulesToUpdateMap.has(m.id)) {
                const cycle = modulesToUpdateMap.get(m.id)!;
                const newHistory: ModuleStatusHistory[] = [
                    ...m.statusHistory,
                    { status: ModuleStatus.IN_STOCK, date: cycle.stockDate || new Date().toISOString() },
                    { status: ModuleStatus.FREE, date: cycle.stockDate || new Date().toISOString(), notes: 'Cycle completed. Module is available.' }
                ];
                return { ...m, farmerId: undefined, statusHistory: newHistory };
            }
            return m;
        }));
    }
  };

  const deleteCultivationCycle = (cycleId: string) => setCultivationCycles(prev => prev.filter(c => c.id !== cycleId));

  const startCultivationFromCuttings = (
      cuttingData: Omit<CuttingOperation, 'id'>,
      cycleData: Omit<CultivationCycle, 'id'>,
      beneficiaryFarmerId: string
  ) => {
      const opId = `cut-${Date.now()}`;
      const newOp: CuttingOperation = { ...cuttingData, id: opId, beneficiaryFarmerId };
      setCuttingOperations(prev => [...prev, newOp]);
      
      const newCredits: FarmerCredit[] = [];
      cuttingData.moduleCuts.forEach(moduleCut => {
           const module = modules.find(m => m.id === moduleCut.moduleId);
           if (beneficiaryFarmerId) {
                const creditAmount = moduleCut.linesCut * cuttingData.unitPrice;
                if (creditAmount > 0) {
                    newCredits.push({
                        id: `fc-${Date.now()}-${Math.random()}`,
                        date: cuttingData.date,
                        siteId: cuttingData.siteId,
                        farmerId: beneficiaryFarmerId,
                        creditTypeId: 'ct-3',
                        totalAmount: creditAmount,
                        relatedOperationId: opId,
                        notes: `Cutting/Planting service for module ${module?.code || moduleCut.moduleId}`,
                    });
                }
           }
      });
      if (newCredits.length > 0) setFarmerCredits(prev => [...prev, ...newCredits]);
      
      // FIX: Ensure cuttingOperationId is passed so addCultivationCycle uses it.
      addCultivationCycle({ ...cycleData, cuttingOperationId: opId }, beneficiaryFarmerId);
  };
  
  const addStockMovement = (movement: Omit<StockMovement, 'id'>) => setStockMovements(prev => [...prev, { ...movement, id: `sm-${Date.now()}`}]);
  const addMultipleStockMovements = (movements: Omit<StockMovement, 'id'>[]) => setStockMovements(prev => [...prev, ...movements.map(m => ({ ...m, id: `sm-${Date.now()}-${Math.random()}` }))]);

  const recordReturnFromPressing = (data: { date: string; siteId: string; seaweedTypeId: string; designation: string; kg: number; bags: number; pressingSlipId: string; }) => {
    addStockMovement({ date: data.date, siteId: data.siteId, seaweedTypeId: data.seaweedTypeId, type: StockMovementType.PRESSING_IN, designation: data.designation, inKg: data.kg, inBags: data.bags, relatedId: data.pressingSlipId });
    setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: data.date, siteId: 'pressing-warehouse', seaweedTypeId: data.seaweedTypeId, type: PressedStockMovementType.RETURN_TO_SITE, designation: `Return to site: ${sites.find(s => s.id === data.siteId)?.name || data.siteId}`, outBales: data.bags, outKg: data.kg, relatedId: data.pressingSlipId }]);
  };

  const addFarmerDelivery = (data: Omit<FarmerDelivery, 'id' | 'slipNo'>) => {
    const slipNo = `DEL-${new Date().getFullYear()}-${String(farmerDeliveries.length + 1).padStart(3, '0')}`;
    const newDelivery: FarmerDelivery = { ...data, id: `fd-${Date.now()}`, slipNo };
    setFarmerDeliveries(prev => [...prev, newDelivery]);
    const farmer = farmers.find(f => f.id === data.farmerId);
    const designation = `Delivery from ${farmer?.firstName || ''} ${farmer?.lastName || ''} (${slipNo})`;
    if (data.destination === 'PRESSING_WAREHOUSE_BULK') {
        setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: data.date, siteId: 'pressing-warehouse', seaweedTypeId: data.seaweedTypeId, type: PressedStockMovementType.FARMER_DELIVERY, designation, inKg: data.totalWeightKg, inBales: data.totalBags, relatedId: newDelivery.id }]);
    } else {
        addStockMovement({ date: data.date, siteId: data.siteId, seaweedTypeId: data.seaweedTypeId, type: StockMovementType.FARMER_DELIVERY, designation, inKg: data.totalWeightKg, inBags: data.totalBags, relatedId: newDelivery.id });
    }
  };

  const deleteFarmerDelivery = (deliveryId: string) => {
    setFarmerDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    setStockMovements(prev => prev.filter(m => m.relatedId !== deliveryId || m.type !== StockMovementType.FARMER_DELIVERY));
    setPressedStockMovements(prev => prev.filter(m => m.relatedId !== deliveryId || m.type !== PressedStockMovementType.FARMER_DELIVERY));
  };

  const addInitialStock = (data: Omit<StockMovement, 'id' | 'type' | 'relatedId'>) => setStockMovements(prev => [...prev, { ...data, id: `sm-${Date.now()}`, type: StockMovementType.INITIAL_STOCK }]);

  const transferBaggedToStock = (cycleIds: string[], date?: string) => {
      const stockDate = date || new Date().toISOString().split('T')[0];
      const cyclesToUpdate = cultivationCycles.filter(c => cycleIds.includes(c.id) && c.status === ModuleStatus.BAGGED).map(c => ({ ...c, status: ModuleStatus.IN_STOCK, stockDate: stockDate }));
      const stockMovementsToAdd = cyclesToUpdate.map(cycle => {
          const module = modules.find(m => m.id === cycle.moduleId);
          if (!module || !cycle.baggedWeightKg || !cycle.baggedBagsCount) return null;
          return { date: stockDate, siteId: module.siteId, seaweedTypeId: cycle.seaweedTypeId, type: StockMovementType.BAGGING_TRANSFER, designation: `From Bagging (Module ${module.code})`, inKg: cycle.baggedWeightKg, inBags: cycle.baggedBagsCount, relatedId: cycle.id };
      }).filter((m): m is NonNullable<typeof m> => m !== null);
      if (cyclesToUpdate.length > 0) updateMultipleCultivationCycles(cyclesToUpdate);
      if (stockMovementsToAdd.length > 0) addMultipleStockMovements(stockMovementsToAdd);
  };

  const exportStockBatch = (cycleId: string) => {
    const cycle = cultivationCycles.find(c => c.id === cycleId);
    if (!cycle) return;
    updateCultivationCycle({ ...cycle, status: ModuleStatus.EXPORTED, exportDate: new Date().toISOString().split('T')[0] });
    const module = modules.find(m => m.id === cycle.moduleId);
    if (module && cycle.harvestedWeight) {
      addStockMovement({ date: new Date().toISOString().split('T')[0], siteId: module.siteId, seaweedTypeId: cycle.seaweedTypeId, type: StockMovementType.EXPORT_OUT, designation: `Export from Batch (Module ${module.code})`, outKg: cycle.harvestedWeight, outBags: Math.ceil(cycle.harvestedWeight / 50), relatedId: cycle.id });
    }
  };

  const pressingSlipsFunctions = {
    addPressingSlip: (slipData: Omit<PressingSlip, 'id' | 'slipNo'>) => {
        const slipNo = `PRESS-${new Date().getFullYear()}-${String(pressingSlips.length + 1).padStart(3, '0')}`;
        const newSlip: PressingSlip = { ...slipData, id: `ps-${Date.now()}`, slipNo };
        setPressingSlips(prev => [...prev, newSlip]);
        setPressedStockMovements(prev => [...prev, 
            { id: `psm-cons-${Date.now()}`, date: newSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: newSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_CONSUMPTION, designation: `Consumed for Pressing Slip ${newSlip.slipNo}`, outKg: newSlip.consumedWeightKg, outBales: newSlip.consumedBags, relatedId: newSlip.id },
            { id: `psm-prod-${Date.now()}`, date: newSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: newSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_IN, designation: `Produced from Pressing Slip ${newSlip.slipNo}`, inBales: newSlip.producedBalesCount, inKg: newSlip.producedWeightKg, relatedId: newSlip.id }
        ]);
    },
    updatePressingSlip: (updatedSlip: PressingSlip) => {
        setPressingSlips(prev => prev.map(s => s.id === updatedSlip.id ? updatedSlip : s));
        setPressedStockMovements(prev => {
            const otherMovements = prev.filter(m => m.relatedId !== updatedSlip.id);
            return [...otherMovements, 
                { id: `psm-upd-cons-${Date.now()}`, date: updatedSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_CONSUMPTION, designation: `Consumed for Pressing Slip ${updatedSlip.slipNo}`, outKg: updatedSlip.consumedWeightKg, outBales: updatedSlip.consumedBags, relatedId: updatedSlip.id },
                { id: `psm-upd-prod-${Date.now()}`, date: updatedSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_IN, designation: `Produced from Pressing Slip ${updatedSlip.slipNo}`, inBales: updatedSlip.producedBalesCount, inKg: updatedSlip.producedWeightKg, relatedId: updatedSlip.id }
            ];
        });
    },
    deletePressingSlip: (slipId: string) => {
        setPressingSlips(prev => prev.filter(s => s.id !== slipId));
        setPressedStockMovements(prev => prev.filter(m => m.relatedId !== slipId));
    },
    addInitialPressedStock: (data: Omit<PressedStockMovement, 'id' | 'type' | 'relatedId'>) => setPressedStockMovements(prev => [...prev, { ...data, id: `psm-${Date.now()}`, type: PressedStockMovementType.INITIAL_STOCK }]),
    addPressedStockAdjustment: (data: Omit<PressedStockMovement, 'id' | 'relatedId'>) => setPressedStockMovements(prev => [...prev, { ...data, id: `psm-adj-${Date.now()}`, relatedId: `adj-${Date.now()}` }])
  };

  const exportDocFunctions = {
    addExportDocument: (docData: Omit<ExportDocument, 'id' | 'docNo'>, sourceSiteId: string) => {
        const docNo = `EXP-${new Date().getFullYear()}-${String(exportDocuments.length + 1).padStart(3, '0')}`;
        const newDoc: ExportDocument = { ...docData, id: `ed-${Date.now()}`, docNo, containers: docData.containers.map(c => ({...c, id: `ec-${Date.now()}-${Math.random()}`})) };
        setExportDocuments(prev => [...prev, newDoc]);
        setPressingSlips(prev => prev.map(slip => newDoc.pressingSlipIds.includes(slip.id) ? { ...slip, exportDocId: newDoc.id } : slip));
        const slipsForMovement = pressingSlips.filter(s => newDoc.pressingSlipIds.includes(s.id));
        const totalBales = slipsForMovement.reduce((sum, slip) => sum + slip.producedBalesCount, 0);
        const totalWeight = slipsForMovement.reduce((sum, slip) => sum + slip.producedWeightKg, 0);
        if (totalBales > 0) setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: newDoc.date, siteId: 'pressing-warehouse', seaweedTypeId: newDoc.seaweedTypeId, type: PressedStockMovementType.EXPORT_OUT, designation: `Export Shipment ${newDoc.docNo}`, outBales: totalBales, outKg: totalWeight, relatedId: newDoc.id }]);
    },
    updateExportDocument: (updatedDoc: ExportDocument) => {
        setExportDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
        setPressingSlips(prev => prev.map(slip => updatedDoc.pressingSlipIds.includes(slip.id) ? { ...slip, exportDocId: updatedDoc.id } : (slip.exportDocId === updatedDoc.id ? { ...slip, exportDocId: undefined } : slip)));
        const updatedMovements = pressedStockMovements.filter(m => m.relatedId !== updatedDoc.id);
        const slipsForMovement = pressingSlips.filter(s => updatedDoc.pressingSlipIds.includes(s.id));
        const totalBales = slipsForMovement.reduce((sum, s) => sum + s.producedBalesCount, 0);
        const totalWeight = slipsForMovement.reduce((sum, s) => sum + s.producedWeightKg, 0);
        if (totalBales > 0) updatedMovements.push({ id: `psm-${Date.now()}`, date: updatedDoc.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedDoc.seaweedTypeId, type: PressedStockMovementType.EXPORT_OUT, designation: `Export Shipment ${updatedDoc.docNo}`, outBales: totalBales, outKg: totalWeight, relatedId: updatedDoc.id });
        setPressedStockMovements(updatedMovements);
    },
    deleteExportDocument: (docId: string) => {
        setPressingSlips(prev => prev.map(slip => slip.exportDocId === docId ? { ...slip, exportDocId: undefined } : slip));
        setExportDocuments(prev => prev.filter(d => d.id !== docId));
        setPressedStockMovements(prev => prev.filter(m => m.relatedId !== docId));
    },
  };

  const siteTransferFunctions = {
    addSiteTransfer: (transferData: Omit<SiteTransfer, 'id' | 'status' | 'history'>) => {
        const newTransfer: SiteTransfer = { ...transferData, id: `st-${Date.now()}`, status: SiteTransferStatus.AWAITING_OUTBOUND, history: [{ status: SiteTransferStatus.AWAITING_OUTBOUND, date: new Date().toISOString(), notes: 'Transfer initiated.' }] };
        setSiteTransfers(prev => [...prev, newTransfer]);
        addStockMovement({ date: newTransfer.date, siteId: newTransfer.sourceSiteId, seaweedTypeId: newTransfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_OUT, designation: `Transfer to ${sites.find(s => s.id === newTransfer.destinationSiteId)?.name} (${newTransfer.id})`, outKg: newTransfer.weightKg, outBags: newTransfer.bags, relatedId: newTransfer.id });
    },
    updateSiteTransfer: (updatedTransfer: SiteTransfer) => {
        const original = siteTransfers.find(t => t.id === updatedTransfer.id);
        if (!original) return;
        const transfer = { ...updatedTransfer };
        if (original.status !== transfer.status) {
             let notes = '';
             if (transfer.status === SiteTransferStatus.IN_TRANSIT) notes = 'Marked as in transit.';
             else if (transfer.status === SiteTransferStatus.PENDING_RECEPTION) notes = 'Marked as arrived at destination, pending checks.';
             else if (transfer.status === SiteTransferStatus.COMPLETED) notes = `Completed. Received ${transfer.receivedWeightKg}kg in ${transfer.receivedBags} bags.`;
             else if (transfer.status === SiteTransferStatus.CANCELLED) notes = `Cancelled. Reason: ${transfer.notes}`;
             transfer.history = [...(original.history || []), { status: transfer.status, date: new Date().toISOString(), notes }];
        }
        setSiteTransfers(prev => prev.map(t => t.id === transfer.id ? transfer : t));
        if (original.status !== SiteTransferStatus.COMPLETED && transfer.status === SiteTransferStatus.COMPLETED) {
            if (transfer.destinationSiteId === 'pressing-warehouse') {
                setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: transfer.completionDate || new Date().toISOString().split('T')[0], siteId: 'pressing-warehouse', seaweedTypeId: transfer.seaweedTypeId, type: PressedStockMovementType.BULK_IN_FROM_SITE, designation: `Transfer from ${sites.find(s => s.id === transfer.sourceSiteId)?.name} (${transfer.id})`, inKg: transfer.receivedWeightKg, inBales: transfer.receivedBags, relatedId: transfer.id }]);
            } else {
                addStockMovement({ date: transfer.completionDate || new Date().toISOString().split('T')[0], siteId: transfer.destinationSiteId, seaweedTypeId: transfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_IN, designation: `Transfer from ${sites.find(s => s.id === transfer.sourceSiteId)?.name} (${transfer.id})`, inKg: transfer.receivedWeightKg, inBags: transfer.receivedBags, relatedId: transfer.id });
            }
        }
        if (original.status !== SiteTransferStatus.CANCELLED && transfer.status === SiteTransferStatus.CANCELLED) {
            addStockMovement({ date: transfer.completionDate || new Date().toISOString().split('T')[0], siteId: transfer.sourceSiteId, seaweedTypeId: transfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_IN, designation: `Cancelled Transfer ${transfer.id}: ${transfer.notes || ''}`.trim(), inKg: transfer.weightKg, inBags: transfer.bags, relatedId: transfer.id });
        }
    }
  };

  const cuttingOpFunctions = {
      addCuttingOperation: (operationData: Omit<CuttingOperation, 'id'>) => {
        const newOperation: CuttingOperation = { ...operationData, id: `cut-${Date.now()}`};
        const newCredits: FarmerCredit[] = [];
        operationData.moduleCuts.forEach(moduleCut => {
            const module = modules.find(m => m.id === moduleCut.moduleId);
            if (module && module.farmerId) {
                const creditAmount = moduleCut.linesCut * operationData.unitPrice;
                if (creditAmount > 0) newCredits.push({ id: `fc-${Date.now()}-${Math.random()}`, date: operationData.date, siteId: operationData.siteId, farmerId: module.farmerId, creditTypeId: 'ct-3', totalAmount: creditAmount, relatedOperationId: newOperation.id, notes: `Cutting service for module ${module.code}` });
            }
        });
        setCuttingOperations(prev => [...prev, newOperation]);
        if (newCredits.length > 0) setFarmerCredits(prev => [...prev, ...newCredits]);
      },
      updateCuttingOperation: (updatedOperation: CuttingOperation, moduleWeights?: Record<string, number>, plantingDate?: string) => {
        const originalOperation = cuttingOperations.find(op => op.id === updatedOperation.id);
        if (!originalOperation) {
            console.error("Original operation not found for update:", updatedOperation.id);
            return;
        }

        const originalModuleId = originalOperation.moduleCuts[0]?.moduleId;
        const newModuleId = updatedOperation.moduleCuts[0]?.moduleId;

        // 1. Update CuttingOperations array
        setCuttingOperations(prevOps => prevOps.map(op => op.id === updatedOperation.id ? updatedOperation : op));

        // 2. Directly update the associated cultivation cycle
        setCultivationCycles(prevCycles => prevCycles.map(c => {
            if (c.cuttingOperationId === updatedOperation.id) {
                const weight = moduleWeights?.[newModuleId!] ?? c.initialWeight;
                return {
                    ...c,
                    moduleId: newModuleId!,
                    seaweedTypeId: updatedOperation.seaweedTypeId,
                    plantingDate: plantingDate || updatedOperation.date, // Use passed date or fallback to op date
                    linesPlanted: updatedOperation.moduleCuts[0]?.linesCut,
                    initialWeight: weight,
                };
            }
            return c;
        }));

        // 3. Re-calculate and replace farmer credits for this operation
        setFarmerCredits(prevCredits => {
            const otherCredits = prevCredits.filter(credit => credit.relatedOperationId !== updatedOperation.id);
            const newCredits: FarmerCredit[] = [];
            const farmerId = updatedOperation.beneficiaryFarmerId;
            
            if (farmerId) {
                const creditAmount = updatedOperation.moduleCuts.reduce((sum, mc) => sum + mc.linesCut * updatedOperation.unitPrice, 0);
                if (creditAmount > 0) {
                    const module = modules.find(m => m.id === newModuleId);
                    newCredits.push({
                        id: `fc-edit-${Date.now()}`,
                        date: updatedOperation.date,
                        siteId: updatedOperation.siteId,
                        farmerId: farmerId,
                        creditTypeId: 'ct-3',
                        totalAmount: creditAmount,
                        relatedOperationId: updatedOperation.id,
                        notes: `Cutting service for module ${module?.code || newModuleId}`,
                    });
                }
            }
            return [...otherCredits, ...newCredits];
        });

        // 4. Update module statuses if module has changed
        if (originalModuleId && newModuleId && originalModuleId !== newModuleId) {
            const farmer = farmers.find(f => f.id === updatedOperation.beneficiaryFarmerId);
            const plantingTimestamp = plantingDate || updatedOperation.date;
            setModules(prevModules => prevModules.map(m => {
                // Free the old module
                if (m.id === originalModuleId) {
                    const newCode = modules.find(mod=>mod.id === newModuleId)?.code || newModuleId;
                    return {
                        ...m,
                        farmerId: undefined,
                        statusHistory: [...m.statusHistory, { status: ModuleStatus.FREE, date: new Date().toISOString(), notes: `Operation moved to module ${newCode}` }]
                    };
                }
                // Assign and plant the new module
                if (m.id === newModuleId) {
                     return {
                        ...m,
                        farmerId: updatedOperation.beneficiaryFarmerId,
                        statusHistory: [
                            ...m.statusHistory,
                            { status: ModuleStatus.ASSIGNED, date: plantingTimestamp, notes: `Assigned to farmer ${farmer?.firstName} ${farmer?.lastName}` },
                            { status: ModuleStatus.PLANTED, date: plantingTimestamp }
                        ]
                    };
                }
                return m;
            }));
        } else if (newModuleId) { // Module is same, but farmer or date might have changed
            const farmer = farmers.find(f => f.id === updatedOperation.beneficiaryFarmerId);
            const plantingTimestamp = plantingDate || updatedOperation.date;
            setModules(prevModules => prevModules.map(m => {
                if (m.id === newModuleId) {
                    let needsUpdate = false;
                    let updatedModule = { ...m };
                    const newHistory = [...m.statusHistory];
                    
                    if(m.farmerId !== updatedOperation.beneficiaryFarmerId) {
                        updatedModule.farmerId = updatedOperation.beneficiaryFarmerId;
                        newHistory.push({ status: ModuleStatus.ASSIGNED, date: plantingTimestamp, notes: `Re-assigned to farmer ${farmer?.firstName} ${farmer?.lastName}` });
                        needsUpdate = true;
                    }
                    
                    const plantingEventIndex = newHistory.map(h => h.status).lastIndexOf(ModuleStatus.PLANTED);
                    if (plantingEventIndex > -1 && newHistory[plantingEventIndex].date !== plantingTimestamp) {
                        newHistory[plantingEventIndex] = { ...newHistory[plantingEventIndex], date: plantingTimestamp };
                        const assignedEventIndex = newHistory.map(h => h.status).lastIndexOf(ModuleStatus.ASSIGNED, plantingEventIndex);
                        if (assignedEventIndex > -1) {
                            newHistory[assignedEventIndex] = { ...newHistory[assignedEventIndex], date: plantingTimestamp };
                        }
                        needsUpdate = true;
                    }

                    if(needsUpdate) {
                        updatedModule.statusHistory = newHistory;
                        return updatedModule;
                    }
                }
                return m;
            }));
        }
      },
      updateMultipleCuttingOperations: (operationIds: string[], paymentDate: string) => {
        const idSet = new Set(operationIds);
        setCuttingOperations(prev => prev.map(op => idSet.has(op.id) ? { ...op, isPaid: true, paymentDate } : op));
      },
      deleteCuttingOperation: (operationId: string) => {
          const opToDelete = cuttingOperations.find(op => op.id === operationId);
          if (!opToDelete) {
              console.error("Operation to delete not found:", operationId);
              return;
          }
          
          const moduleIdToFree = opToDelete.moduleCuts[0]?.moduleId;
          if (moduleIdToFree) {
              setModules(prev => prev.map(m => 
                  m.id === moduleIdToFree 
                      ? { 
                          ...m, 
                          farmerId: undefined, 
                          statusHistory: [...m.statusHistory, { 
                              status: ModuleStatus.FREE, 
                              date: new Date().toISOString(), 
                              notes: 'Cutting operation deleted, module freed.' 
                          }] 
                        } 
                      : m
              ));
          }
          
          setCultivationCycles(prev => prev.filter(c => c.cuttingOperationId !== operationId));
          setFarmerCredits(prev => prev.filter(credit => credit.relatedOperationId !== operationId));
          setCuttingOperations(prev => prev.filter(op => op.id !== operationId));
      }
  };

  const incidentFunctions = {
    addIncident: (incident: Omit<Incident, 'id'>) => setIncidents(prev => [...prev, { ...incident, id: `inc-${Date.now()}` }]),
    updateIncident: (updatedIncident: Incident) => setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i)),
    deleteIncident: (incidentId: string) => setIncidents(prev => prev.filter(i => i.id !== incidentId)),
    addIncidentType: (type: Omit<IncidentType, 'id'>) => {
        const newId = type.name.toUpperCase().replace(/\s/g, '_');
        if (!incidentTypes.some(t => t.id === newId)) setIncidentTypes(prev => [...prev, { ...type, id: newId, isDefault: false }]);
    },
    updateIncidentType: (updatedType: IncidentType) => setIncidentTypes(prev => prev.map(it => it.id === updatedType.id ? { ...it, name: updatedType.name } : it)),
    deleteIncidentType: (typeId: string) => {
          setIncidentTypes(prev => prev.filter(it => it.id !== typeId && !it.isDefault));
          const otherType = incidentTypes.find(it => it.id === 'OTHER');
          if (otherType) setIncidents(prev => prev.map(i => i.type === typeId ? { ...i, type: otherType.id } : i));
    },
    addIncidentSeverity: (severity: Omit<IncidentSeverity, 'id'>) => {
          const newId = severity.name.toUpperCase().replace(/\s/g, '_');
          if (!incidentSeverities.some(s => s.id === newId)) setIncidentSeverities(prev => [...prev, { ...severity, id: newId, isDefault: false }]);
    },
    updateIncidentSeverity: (updatedSeverity: IncidentSeverity) => setIncidentSeverities(prev => prev.map(is => is.id === updatedSeverity.id ? { ...is, name: updatedSeverity.name } : is)),
    deleteIncidentSeverity: (severityId: string) => {
          setIncidentSeverities(prev => prev.filter(is => is.id !== severityId && !is.isDefault));
          const lowSeverity = incidentSeverities.find(is => is.id === 'LOW');
          if (lowSeverity) setIncidents(prev => prev.map(i => i.severity === severityId ? { ...i, severity: lowSeverity.id } : i));
    }
  };

  const roleFunctions = {
    addRole: (role: Omit<Role, 'id'>): Role | undefined => {
        const newId = role.name.toUpperCase().replace(/\s/g, '_');
        if (roles.some(r => r.id === newId)) return undefined;
        const newRole = { ...role, id: newId, isDefault: false };
        setRoles(prev => [...prev, newRole]);
        return newRole;
    },
    updateRole: (updatedRole: Role) => setRoles(prev => prev.map(it => it.id === updatedRole.id ? updatedRole : it)),
    deleteRole: (roleId: string) => setRoles(prev => prev.filter(it => it.id !== roleId && !it.isDefault))
  };

  const periodicTestFunctions = {
    addPeriodicTest: (test: Omit<PeriodicTest, 'id'>) => setPeriodicTests(prev => [...prev, { ...test, id: `pt-${Date.now()}` }]),
    updatePeriodicTest: (updatedTest: PeriodicTest) => setPeriodicTests(prev => prev.map(t => t.id === updatedTest.id ? updatedTest : t)),
    deletePeriodicTest: (testId: string) => setPeriodicTests(prev => prev.filter(t => t.id !== testId))
  };

  const findUserByEmail = (email: string): User | undefined => users.find(user => user.email.toLowerCase() === email.toLowerCase());

  const addUser = (userData: Omit<User, 'id'>, invitationToken?: string): User | undefined => {
      if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) return undefined;
      if (invitationToken) setInvitations(prev => prev.map(inv => inv.token === invitationToken ? { ...inv, status: InvitationStatus.ACCEPTED } : inv));
      const newUser: User = { id: `user-${Date.now()}`, ...userData };
      setUsers(prev => [...prev, newUser]);
      return newUser;
  };

  const setUserPasswordResetToken = (email: string, token: string, expires: Date): boolean => {
    let userFound = false;
    setUsers(prevUsers => prevUsers.map(user => {
        if (user.email.toLowerCase() === email.toLowerCase()) { userFound = true; return { ...user, passwordResetToken: token, passwordResetExpires: expires }; }
        return user;
    }));
    return userFound;
  };

  const findUserByPasswordResetToken = (token: string): User | undefined => {
      const user = users.find(u => u.passwordResetToken === token);
      return (user && user.passwordResetExpires && new Date() < new Date(user.passwordResetExpires)) ? user : undefined;
  };

  const updateUserPassword = (userId: string, newPassword: string): boolean => {
      let userFound = false;
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) { userFound = true; return { ...user, password: newPassword, passwordResetToken: undefined, passwordResetExpires: undefined }; }
          return user;
      }));
      return userFound;
  };

  const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

  const markCyclesAsPaid = (cycleIds: string[], paymentRunId: string) => {
    const idSet = new Set(cycleIds);
    setCultivationCycles(prev => prev.map(c => idSet.has(c.id) ? { ...c, paymentRunId } : c));
  };

  const markDeliveriesAsPaid = (deliveryIds: string[], paymentRunId: string) => {
    const idSet = new Set(deliveryIds);
    setFarmerDeliveries(prev => prev.map(d => idSet.has(d.id) ? { ...d, paymentRunId } : d));
  };

  const addInvitation = (data: Omit<Invitation, 'id' | 'token' | 'createdAt'>): Invitation => {
    const newInvitation: Invitation = { ...data, id: `inv-${Date.now()}`, token: `inv-token-${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    setInvitations(prev => [...prev, newInvitation]);
    return newInvitation;
  };

  const deleteInvitation = (invitationId: string) => setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

  const findInvitationByToken = (token: string): Invitation | undefined => {
    const inv = invitations.find(i => i.token === token && i.status === InvitationStatus.PENDING);
    return (inv && new Date(inv.expiresAt) > new Date()) ? inv : undefined;
  };

  const addMessageLog = (log: Omit<MessageLog, 'id'>) => setMessageLogs(prev => [{ ...log, id: `msg-${Date.now()}` }, ...prev]);
  const addGalleryPhoto = (photo: Omit<GalleryPhoto, 'id'>) => setGalleryPhotos(prev => [{ ...photo, id: `photo-${Date.now()}` }, ...prev]);
  const updateGalleryPhotoComment = (id: string, comment: string) => setGalleryPhotos(prev => prev.map(p => p.id === id ? { ...p, comment } : p));
  const deleteGalleryPhoto = (id: string) => setGalleryPhotos(prev => prev.filter(p => p.id !== id));

  const clearAllData = () => {
      localStorage.clear();
      setSites([]); setEmployees([]); setFarmers([]); setServiceProviders([]); setCreditTypes(defaultCreditTypes); setFarmerCredits([]); setRepayments([]); setMonthlyPayments([]); setSeaweedTypes([]); setModules([]); setCultivationCycles([]); setStockMovements([]); setPressingSlips([]); setPressedStockMovements([]); setExportDocuments([]); setSiteTransfers([]); setCuttingOperations([]); setFarmerDeliveries([]); setIncidents([]); setIncidentTypes(defaultIncidentTypes); setIncidentSeverities(defaultIncidentSeverities); setRoles(defaultRoles); setPeriodicTests([]); setPestObservations([]); setUsers(defaultUsers); setInvitations([]); setMessageLogs([]); setGalleryPhotos([]);
  };

  const value = { 
      sites, addSite, updateSite, deleteSite, 
      employees, addEmployee, updateEmployee, deleteEmployee, deleteMultipleEmployees, updateEmployeesSite, 
      farmers, addFarmer, updateFarmer, getFarmersBySite, deleteFarmer, deleteMultipleFarmers, updateFarmersSite, 
      serviceProviders, addServiceProvider, updateServiceProvider, deleteServiceProvider, 
      creditTypes, addCreditType, updateCreditType, deleteCreditType, 
      farmerCredits, addFarmerCredit, addMultipleFarmerCredits, 
      repayments, addRepayment, addMultipleRepayments, 
      monthlyPayments, addMonthlyPayment, addMultipleMonthlyPayments, updateMonthlyPayment, deleteMonthlyPayment, 
      seaweedTypes, addSeaweedType, updateSeaweedType, deleteSeaweedType, updateSeaweedPrices, 
      modules, cultivationCycles, addModule, updateModule, deleteModule, deleteMultipleModules, updateModulesFarmer, 
      addCultivationCycle, updateCultivationCycle, updateMultipleCultivationCycles, deleteCultivationCycle, startCultivationFromCuttings, 
      stockMovements, addStockMovement, addMultipleStockMovements, recordReturnFromPressing, 
      farmerDeliveries, addFarmerDelivery, deleteFarmerDelivery, 
      addInitialStock, transferBaggedToStock, exportStockBatch, 
      pressingSlips, pressedStockMovements, ...pressingSlipsFunctions,
      exportDocuments, ...exportDocFunctions,
      siteTransfers, ...siteTransferFunctions,
      cuttingOperations, ...cuttingOpFunctions,
      incidents, ...incidentFunctions,
      incidentTypes, incidentSeverities,
      roles, ...roleFunctions,
      periodicTests, ...periodicTestFunctions,
      pestObservations, 
      users, findUserByEmail, addUser, setUserPasswordResetToken, findUserByPasswordResetToken, updateUserPassword, updateUser,
      markCyclesAsPaid, markDeliveriesAsPaid, 
      invitations, addInvitation, deleteInvitation, findInvitationByToken,
      addMessageLog, messageLogs,
      galleryPhotos, addGalleryPhoto, updateGalleryPhotoComment, deleteGalleryPhoto,
      clearAllData 
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
