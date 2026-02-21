
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { Site, Farmer, CreditType, FarmerCredit, Employee, SeaweedType, Module, CultivationCycle, ModuleStatusHistory, StockMovement, PressingSlip, PressedStockMovement, ExportDocument, SiteTransfer, ServiceProvider, SeaweedPriceHistory, Repayment, FarmerDelivery, CuttingOperation, SiteTransferHistoryEntry, Incident, IncidentType, IncidentSeverity, PeriodicTest, Role, MonthlyPayment, TestPeriod, PestObservation, User, Invitation, MessageLog, GalleryPhoto } from '../types';
import { ModuleStatus, StockMovementType, PressedStockMovementType, SiteTransferStatus, ExportDocType, ContainerType, IncidentStatus, RecipientType, InvitationStatus, EmployeeStatus, FarmerStatus, ServiceProviderStatus, HistoryStatus } from '../types';
import { PERMISSIONS } from '../permissions';
import * as firebaseService from '../../lib/firebaseService';

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

  const addSite = async (site: Omit<Site, 'id'>) => {
    const tempId = `site-${Date.now()}`;
    const tempSite = { ...site, id: tempId };
    // Optimistic UI update
    setSites(prev => [...prev, tempSite]);
    // Firebase sync
    const result = await firebaseService.addSite(site);
    if (result) {
      // Replace temp with real ID
      setSites(prev => prev.map(s => s.id === tempId ? result : s));
    } else {
      // Rollback on error
      setSites(prev => prev.filter(s => s.id !== tempId));
    }
  };
  const updateSite = async (updatedSite: Site) => {
    // Optimistic UI update
    setSites(prev => prev.map(s => s.id === updatedSite.id ? updatedSite : s));
    // Firebase sync
    await firebaseService.updateSite(updatedSite);
  };
  const deleteSite = async (siteId: string) => {
    // Optimistic UI update
    setSites(prev => prev.filter(s => s.id !== siteId));
    // Firebase sync
    await firebaseService.deleteSite(siteId);
  };
  const getFarmersBySite = (siteId: string) => farmers.filter(f => f.siteId === siteId);

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
      const tempEmployee: Employee = {
          ...employee,
          id: `emp-${Date.now()}`,
          status: EmployeeStatus.ACTIVE,
          hireDate: employee.hireDate || new Date().toISOString().split('T')[0]
      };
      // Optimistic UI update
      setEmployees(prev => [...prev, tempEmployee]);
      // Firebase sync
      const result = await firebaseService.addEmployee(employee);
      if (result) {
        setEmployees(prev => prev.map(e => e.id === tempEmployee.id ? result : e));
      } else {
        setEmployees(prev => prev.filter(e => e.id !== tempEmployee.id));
      }
  };
  const updateEmployee = async (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    await firebaseService.updateEmployee(updatedEmployee);
  };
  const deleteEmployee = async (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    setSites(prevSites => prevSites.map(site => site.managerId === employeeId ? { ...site, managerId: undefined } : site));
    await firebaseService.deleteEmployee(employeeId);
  };
  const deleteMultipleEmployees = async (employeeIds: string[]) => {
    const idSet = new Set(employeeIds);
    setEmployees(prev => prev.filter(e => !idSet.has(e.id)));
    setSites(prevSites => prevSites.map(site => site.managerId && idSet.has(site.managerId) ? { ...site, managerId: undefined } : site));
    await firebaseService.deleteMultipleEmployees(employeeIds);
  };
  const updateEmployeesSite = (employeeIds: string[], siteId: string) => {
    const idSet = new Set(employeeIds);
    setEmployees(prev => prev.map(e => (idSet.has(e.id) ? { ...e, siteId } : e)));
  };

  const addFarmer = async (farmer: Omit<Farmer, 'id'>) => {
    const tempFarmer: Farmer = {
        ...farmer,
        id: `farm-${Date.now()}`,
        status: farmer.status || FarmerStatus.ACTIVE,
        joinDate: farmer.joinDate || new Date().toISOString().split('T')[0]
    };
    setFarmers(prev => [...prev, tempFarmer]);
    const result = await firebaseService.addFarmer(farmer);
    if (result) {
      setFarmers(prev => prev.map(f => f.id === tempFarmer.id ? result : f));
    } else {
      setFarmers(prev => prev.filter(f => f.id !== tempFarmer.id));
    }
  };
  const updateFarmer = async (updatedFarmer: Farmer) => {
    setFarmers(prev => prev.map(f => f.id === updatedFarmer.id ? updatedFarmer : f));
    await firebaseService.updateFarmer(updatedFarmer);
  };
  const deleteFarmer = async (farmerId: string) => {
    setFarmers(prev => prev.filter(f => f.id !== farmerId));
    setFarmerCredits(prev => prev.filter(fc => fc.farmerId !== farmerId));
    setRepayments(prev => prev.filter(r => r.farmerId !== farmerId));
    await firebaseService.deleteFarmer(farmerId);
  };
   const deleteMultipleFarmers = (farmerIds: string[]) => {
    const idSet = new Set(farmerIds);
    setFarmers(prev => prev.filter(f => !idSet.has(f.id)));
    setFarmerCredits(prev => prev.filter(fc => !idSet.has(fc.farmerId)));
    setRepayments(prev => prev.filter(r => !idSet.has(r.farmerId)));
  };
  const updateFarmersSite = (farmerIds: string[], siteId: string) => {
    const idSet = new Set(farmerIds);
    setFarmers(prev => prev.map(f => (idSet.has(f.id) ? { ...f, siteId } : f)));
  };

  const addServiceProvider = async (provider: Omit<ServiceProvider, 'id'>) => {
      const tempProvider: ServiceProvider = {
          ...provider,
          id: `sp-${Date.now()}`,
          status: ServiceProviderStatus.ACTIVE,
          joinDate: provider.joinDate || new Date().toISOString().split('T')[0]
      };
      setServiceProviders(prev => [...prev, tempProvider]);
      const result = await firebaseService.addServiceProvider(provider);
      if (result) {
        setServiceProviders(prev => prev.map(p => p.id === tempProvider.id ? result : p));
      } else {
        setServiceProviders(prev => prev.filter(p => p.id !== tempProvider.id));
      }
  };
  const updateServiceProvider = async (updatedProvider: ServiceProvider) => {
    setServiceProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
    await firebaseService.updateServiceProvider(updatedProvider);
  };
  const deleteServiceProvider = async (providerId: string) => {
    setServiceProviders(prev => prev.filter(p => p.id !== providerId));
    await firebaseService.deleteServiceProvider(providerId);
  };

  const addCreditType = async (creditType: Omit<CreditType, 'id'>) => {
    const temp = { ...creditType, id: `ct-${Date.now()}` };
    setCreditTypes(prev => [...prev, temp]);
    const result = await firebaseService.addCreditType(creditType);
    if (result) {
      setCreditTypes(prev => prev.map(ct => ct.id === temp.id ? result : ct));
    } else {
      setCreditTypes(prev => prev.filter(ct => ct.id !== temp.id));
    }
  };
  const updateCreditType = async (updatedCreditType: CreditType) => {
    setCreditTypes(prev => prev.map(ct => ct.id === updatedCreditType.id ? updatedCreditType : ct));
    await firebaseService.updateCreditType(updatedCreditType);
  };
  const deleteCreditType = async (creditTypeId: string) => {
    // Save old state for rollback
    const oldCreditTypes = creditTypes;
    const oldFarmerCredits = farmerCredits;
    
    // Optimistic UI - remove immediately
    setCreditTypes(prev => prev.filter(ct => ct.id !== creditTypeId));
    setFarmerCredits(prev => prev.filter(fc => fc.creditTypeId !== creditTypeId));
    
    // Try to delete from Firebase
    const success = await firebaseService.deleteCreditType(creditTypeId);
    if (!success) {
      // Rollback on error
      console.error('Failed to delete credit type from Firebase, rolling back...');
      setCreditTypes(oldCreditTypes);
      setFarmerCredits(oldFarmerCredits);
    } else {
      // Also delete related farmer credits from Firebase
      const creditsToDelete = oldFarmerCredits.filter(fc => fc.creditTypeId === creditTypeId);
      for (const credit of creditsToDelete) {
        await firebaseService.deleteFarmerCredit(credit.id);
      }
    }
  };
  const addFarmerCredit = async (credit: Omit<FarmerCredit, 'id'>) => {
    const temp = { ...credit, id: `fc-${Date.now()}` };
    setFarmerCredits(prev => [...prev, temp]);
    const result = await firebaseService.addFarmerCredit(credit);
    if (result) {
      setFarmerCredits(prev => prev.map(fc => fc.id === temp.id ? result : fc));
    } else {
      setFarmerCredits(prev => prev.filter(fc => fc.id !== temp.id));
    }
  };
  const addMultipleFarmerCredits = (credits: Omit<FarmerCredit, 'id'>[]) => {
    const newCredits = credits.map(credit => ({...credit, id: `fc-${Date.now()}-${Math.random()}`}));
    setFarmerCredits(prev => [...prev, ...newCredits]);
  };
  const addRepayment = async (repayment: Omit<Repayment, 'id'>) => {
    const temp = { ...repayment, id: `rep-${Date.now()}` };
    setRepayments(prev => [...prev, temp]);
    const result = await firebaseService.addRepayment(repayment);
    if (result) {
      setRepayments(prev => prev.map(r => r.id === temp.id ? result : r));
    } else {
      setRepayments(prev => prev.filter(r => r.id !== temp.id));
    }
  };
  const addMultipleRepayments = (repayments: Omit<Repayment, 'id'>[]) => {
      const newRepayments = repayments.map(repayment => ({...repayment, id: `rep-${Date.now()}-${Math.random()}`}));
      setRepayments(prev => [...prev, ...newRepayments]);
  };

  const addMonthlyPayment = async (payment: Omit<MonthlyPayment, 'id'>) => {
    const temp: MonthlyPayment = { ...payment, id: `pay-${Date.now()}` };
    setMonthlyPayments(prev => [...prev, temp]);
    const result = await firebaseService.addMonthlyPayment(payment);
    if (result) {
      setMonthlyPayments(prev => prev.map(p => p.id === temp.id ? result : p));
    } else {
      setMonthlyPayments(prev => prev.filter(p => p.id !== temp.id));
    }
  };
  const addMultipleMonthlyPayments = (payments: Omit<MonthlyPayment, 'id'>[]) => {
    const newPayments = payments.map(p => ({ ...p, id: `pay-${Date.now()}-${Math.random()}` }));
    setMonthlyPayments(prev => [...prev, ...newPayments]);
  };
  const updateMonthlyPayment = async (updatedPayment: MonthlyPayment) => {
    setMonthlyPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
    await firebaseService.updateMonthlyPayment(updatedPayment);
  };
  const deleteMonthlyPayment = async (paymentId: string) => {
    setMonthlyPayments(prev => prev.filter(p => p.id !== paymentId));
    await firebaseService.deleteMonthlyPayment(paymentId);
  };

  const addSeaweedType = async (seaweedType: Omit<SeaweedType, 'id' | 'priceHistory'>) => {
    const tempType: SeaweedType = {
        ...seaweedType,
        id: `st-${Date.now()}`,
        priceHistory: [{ date: new Date().toISOString().split('T')[0], wetPrice: seaweedType.wetPrice, dryPrice: seaweedType.dryPrice }],
    };
    setSeaweedTypes(prev => [...prev, tempType]);
    const result = await firebaseService.addSeaweedType(seaweedType);
    if (result) {
      setSeaweedTypes(prev => prev.map(st => st.id === tempType.id ? result : st));
    } else {
      setSeaweedTypes(prev => prev.filter(st => st.id !== tempType.id));
    }
  };
  const updateSeaweedType = async (updatedType: SeaweedType) => {
    setSeaweedTypes(prev => prev.map(st => st.id === updatedType.id ? updatedType : st));
    await firebaseService.updateSeaweedType(updatedType);
  };
  const deleteSeaweedType = async (seaweedTypeId: string) => {
    // Optimistic UI - remove immediately
    const oldSeaweedTypes = seaweedTypes;
    setSeaweedTypes(prev => prev.filter(st => st.id !== seaweedTypeId));
    
    // Try to delete from Firebase
    const success = await firebaseService.deleteSeaweedType(seaweedTypeId);
    if (!success) {
      // Rollback on error
      console.error('Failed to delete seaweed type from Firebase, rolling back...');
      setSeaweedTypes(oldSeaweedTypes);
    }
  };
  const updateSeaweedPrices = (seaweedTypeId: string, newPrice: SeaweedPriceHistory) => {
    setSeaweedTypes(prev => prev.map(st => st.id === seaweedTypeId ? { ...st, wetPrice: newPrice.wetPrice, dryPrice: newPrice.dryPrice, priceHistory: [...st.priceHistory, newPrice] } : st));
  };

  const addModule = async (moduleData: Omit<Module, 'id' | 'farmerId' | 'statusHistory'>) => {
    const tempModule: Module = { 
      ...moduleData, 
      id: `mod-${Date.now()}`,
      statusHistory: [{ status: ModuleStatus.CREATED, date: new Date().toISOString() }, { status: ModuleStatus.FREE, date: new Date().toISOString(), notes: 'Module is ready for assignment.' }]
    };
    setModules(prev => [...prev, tempModule]);
    const result = await firebaseService.addModule(moduleData);
    if (result) {
      setModules(prev => prev.map(m => m.id === tempModule.id ? result : m));
    } else {
      setModules(prev => prev.filter(m => m.id !== tempModule.id));
    }
  };
  const updateModule = async (moduleData: Module) => {
    setModules(prev => prev.map(m => m.id === moduleData.id ? moduleData : m));
    await firebaseService.updateModule(moduleData);
  };
  const deleteModule = async (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setCultivationCycles(prev => prev.filter(c => c.moduleId !== moduleId));
    await firebaseService.deleteModule(moduleId);
  };
  const deleteMultipleModules = (moduleIds: string[]) => {
    const idSet = new Set(moduleIds);
    setModules(prev => prev.filter(m => !idSet.has(m.id)));
    setCultivationCycles(prev => prev.filter(c => c.moduleId && !idSet.has(c.moduleId)));
  };
  const updateModulesFarmer = (moduleIds: string[], farmerId: string) => {
    const idSet = new Set(moduleIds);
    const farmer = farmers.find(f => f.id === farmerId);
    if (!farmer) return;
    setModules(prev => prev.map(m => idSet.has(m.id) ? { ...m, farmerId, statusHistory: [...m.statusHistory, { status: ModuleStatus.ASSIGNED, date: new Date().toISOString(), notes: `Assigned to farmer ${farmer.firstName} ${farmer.lastName}` }] } : m));
  };

  const addCultivationCycle = async (cycleData: Omit<CultivationCycle, 'id'>, farmerId: string) => {
    const latestCuttingOp = cycleData.cuttingOperationId ? cuttingOperations.find(op => op.id === cycleData.cuttingOperationId) : undefined;
    const module = modules.find(m => m.id === cycleData.moduleId);
    if (!module) return;

    const tempCycle: CultivationCycle = { 
        ...cycleData, 
        id: `cyc-${Date.now()}`,
        linesPlanted: cycleData.linesPlanted || module.lines,
        cuttingOperationId: cycleData.cuttingOperationId || latestCuttingOp?.id
    };
    
    // Optimistic UI
    setCultivationCycles(prev => [...prev, tempCycle]);
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

    // Firebase sync
    const result = await firebaseService.addCultivationCycle(cycleData);
    if (result) {
      setCultivationCycles(prev => prev.map(c => c.id === tempCycle.id ? result : c));
    } else {
      // Rollback
      setCultivationCycles(prev => prev.filter(c => c.id !== tempCycle.id));
      // Rollback module history too
      setModules(prev => prev.map(m => m.id === cycleData.moduleId ? module : m));
    }
  };

  const updateCultivationCycle = async (cycleData: CultivationCycle) => {
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
                
                let nextStatus: HistoryStatus = cycleData.status;
                let nextFarmerId = m.farmerId;
                let note = cycleData.processingNotes;

                // RULE: Automatic Module Release on Full Harvest
                if (cycleData.status === ModuleStatus.HARVESTED) {
                    const planted = cycleData.linesPlanted || m.lines;
                    const harvested = cycleData.linesHarvested || 0;
                    
                    // If all (or more) lines are harvested, free the module
                    if (harvested >= planted) {
                        nextStatus = 'FREE';
                        nextFarmerId = undefined; // Unassign farmer
                        note = (note ? note + '. ' : '') + 'Automatic Release: Full harvest completed.';
                    }
                }

                // Existing logic for IN_STOCK (just in case they skipped steps to end)
                if (cycleData.status === ModuleStatus.IN_STOCK) {
                    nextStatus = 'FREE';
                    nextFarmerId = undefined;
                    note = 'Cycle completed. Module is available.';
                }
                
                const newHistoryEntry: ModuleStatusHistory = {
                    status: nextStatus,
                    date: statusDate,
                    notes: note,
                };

                const updatedHistory = [...m.statusHistory, newHistoryEntry];
                
                return { 
                    ...m, 
                    farmerId: nextFarmerId,
                    statusHistory: updatedHistory 
                };
            }
            return m;
        }));
    }
    
    // Firebase sync
    await firebaseService.updateCultivationCycle(cycleData);
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

  const deleteCultivationCycle = async (cycleId: string) => {
    setCultivationCycles(prev => prev.filter(c => c.id !== cycleId));
    await firebaseService.deleteCultivationCycle(cycleId);
  };

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
  
  const addStockMovement = async (movement: Omit<StockMovement, 'id'>) => {
    const temp = { ...movement, id: `sm-${Date.now()}` };
    setStockMovements(prev => [...prev, temp]);
    const result = await firebaseService.addStockMovement(movement);
    if (result) {
      setStockMovements(prev => prev.map(m => m.id === temp.id ? result : m));
    } else {
      setStockMovements(prev => prev.filter(m => m.id !== temp.id));
    }
  };
  const addMultipleStockMovements = (movements: Omit<StockMovement, 'id'>[]) => setStockMovements(prev => [...prev, ...movements.map(m => ({ ...m, id: `sm-${Date.now()}-${Math.random()}` }))]);

  const recordReturnFromPressing = (data: { date: string; siteId: string; seaweedTypeId: string; designation: string; kg: number; bags: number; pressingSlipId: string; }) => {
    addStockMovement({ date: data.date, siteId: data.siteId, seaweedTypeId: data.seaweedTypeId, type: StockMovementType.PRESSING_IN, designation: data.designation, inKg: data.kg, inBags: data.bags, relatedId: data.pressingSlipId });
    setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: data.date, siteId: 'pressing-warehouse', seaweedTypeId: data.seaweedTypeId, type: PressedStockMovementType.RETURN_TO_SITE, designation: `Return to site: ${sites.find(s => s.id === data.siteId)?.name || data.siteId}`, outBales: data.bags, outKg: data.kg, relatedId: data.pressingSlipId }]);
  };

  const addFarmerDelivery = async (data: Omit<FarmerDelivery, 'id' | 'slipNo'>) => {
    const slipNo = `DEL-${new Date().getFullYear()}-${String(farmerDeliveries.length + 1).padStart(3, '0')}`;
    const tempDelivery: FarmerDelivery = { ...data, id: `fd-${Date.now()}`, slipNo };
    setFarmerDeliveries(prev => [...prev, tempDelivery]);
    const farmer = farmers.find(f => f.id === data.farmerId);
    const designation = `Delivery from ${farmer?.firstName || ''} ${farmer?.lastName || ''} (${slipNo})`;
    
    // Firebase sync
    const result = await firebaseService.addFarmerDelivery(tempDelivery);
    if (result) {
      setFarmerDeliveries(prev => prev.map(d => d.id === tempDelivery.id ? result : d));
    } else {
      setFarmerDeliveries(prev => prev.filter(d => d.id !== tempDelivery.id));
      return; // Abort if Firebase fails
    }
    
    if (data.destination === 'PRESSING_WAREHOUSE_BULK') {
        setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: data.date, siteId: 'pressing-warehouse', seaweedTypeId: data.seaweedTypeId, type: PressedStockMovementType.FARMER_DELIVERY, designation, inKg: data.totalWeightKg, inBales: data.totalBags, relatedId: result.id }]);
    } else {
        await addStockMovement({ date: data.date, siteId: data.siteId, seaweedTypeId: data.seaweedTypeId, type: StockMovementType.FARMER_DELIVERY, designation, inKg: data.totalWeightKg, inBags: data.totalBags, relatedId: result.id });
    }
  };

  const deleteFarmerDelivery = async (deliveryId: string) => {
    setFarmerDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    setStockMovements(prev => prev.filter(m => m.relatedId !== deliveryId || m.type !== StockMovementType.FARMER_DELIVERY));
    setPressedStockMovements(prev => prev.filter(m => m.relatedId !== deliveryId || m.type !== PressedStockMovementType.FARMER_DELIVERY));
    await firebaseService.deleteFarmerDelivery(deliveryId);
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
    addPressingSlip: async (slipData: Omit<PressingSlip, 'id' | 'slipNo'>) => {
        const slipNo = `PRESS-${new Date().getFullYear()}-${String(pressingSlips.length + 1).padStart(3, '0')}`;
        const tempSlip: PressingSlip = { ...slipData, id: `ps-${Date.now()}`, slipNo };
        setPressingSlips(prev => [...prev, tempSlip]);
        setPressedStockMovements(prev => [...prev, 
            { id: `psm-cons-${Date.now()}`, date: tempSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: tempSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_CONSUMPTION, designation: `Consumed for Pressing Slip ${tempSlip.slipNo}`, outKg: tempSlip.consumedWeightKg, outBales: tempSlip.consumedBags, relatedId: tempSlip.id },
            { id: `psm-prod-${Date.now()}`, date: tempSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: tempSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_IN, designation: `Produced from Pressing Slip ${tempSlip.slipNo}`, inBales: tempSlip.producedBalesCount, inKg: tempSlip.producedWeightKg, relatedId: tempSlip.id }
        ]);
        
        // Firebase sync
        const result = await firebaseService.addPressingSlip(tempSlip);
        if (result) {
          setPressingSlips(prev => prev.map(s => s.id === tempSlip.id ? result : s));
        } else {
          setPressingSlips(prev => prev.filter(s => s.id !== tempSlip.id));
          setPressedStockMovements(prev => prev.filter(m => m.relatedId !== tempSlip.id));
        }
    },
    updatePressingSlip: async (updatedSlip: PressingSlip) => {
        setPressingSlips(prev => prev.map(s => s.id === updatedSlip.id ? updatedSlip : s));
        setPressedStockMovements(prev => {
            const otherMovements = prev.filter(m => m.relatedId !== updatedSlip.id);
            return [...otherMovements, 
                { id: `psm-upd-cons-${Date.now()}`, date: updatedSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_CONSUMPTION, designation: `Consumed for Pressing Slip ${updatedSlip.slipNo}`, outKg: updatedSlip.consumedWeightKg, outBales: updatedSlip.consumedBags, relatedId: updatedSlip.id },
                { id: `psm-upd-prod-${Date.now()}`, date: updatedSlip.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedSlip.seaweedTypeId, type: PressedStockMovementType.PRESSING_IN, designation: `Produced from Pressing Slip ${updatedSlip.slipNo}`, inBales: updatedSlip.producedBalesCount, inKg: updatedSlip.producedWeightKg, relatedId: updatedSlip.id }
            ];
        });
        await firebaseService.updatePressingSlip(updatedSlip);
    },
    deletePressingSlip: async (slipId: string) => {
        setPressingSlips(prev => prev.filter(s => s.id !== slipId));
        setPressedStockMovements(prev => prev.filter(m => m.relatedId !== slipId));
        await firebaseService.deletePressingSlip(slipId);
    },
    addInitialPressedStock: async (data: Omit<PressedStockMovement, 'id' | 'type' | 'relatedId'>) => {
        const temp = { ...data, id: `psm-${Date.now()}`, type: PressedStockMovementType.INITIAL_STOCK };
        setPressedStockMovements(prev => [...prev, temp]);
        const result = await firebaseService.addPressedStockMovement(temp);
        if (result) {
          setPressedStockMovements(prev => prev.map(m => m.id === temp.id ? result : m));
        } else {
          setPressedStockMovements(prev => prev.filter(m => m.id !== temp.id));
        }
    },
    addPressedStockAdjustment: async (data: Omit<PressedStockMovement, 'id' | 'relatedId'>) => {
        const temp = { ...data, id: `psm-adj-${Date.now()}`, relatedId: `adj-${Date.now()}` };
        setPressedStockMovements(prev => [...prev, temp]);
        const result = await firebaseService.addPressedStockMovement(temp);
        if (result) {
          setPressedStockMovements(prev => prev.map(m => m.id === temp.id ? result : m));
        } else {
          setPressedStockMovements(prev => prev.filter(m => m.id !== temp.id));
        }
    }
  };

  const exportDocFunctions = {
    addExportDocument: async (docData: Omit<ExportDocument, 'id' | 'docNo'>, sourceSiteId: string) => {
        const docNo = `EXP-${new Date().getFullYear()}-${String(exportDocuments.length + 1).padStart(3, '0')}`;
        const tempDoc: ExportDocument = { ...docData, id: `ed-${Date.now()}`, docNo, containers: docData.containers.map(c => ({...c, id: `ec-${Date.now()}-${Math.random()}`})) };
        setExportDocuments(prev => [...prev, tempDoc]);
        setPressingSlips(prev => prev.map(slip => tempDoc.pressingSlipIds.includes(slip.id) ? { ...slip, exportDocId: tempDoc.id } : slip));
        const slipsForMovement = pressingSlips.filter(s => tempDoc.pressingSlipIds.includes(s.id));
        const totalBales = slipsForMovement.reduce((sum, slip) => sum + slip.producedBalesCount, 0);
        const totalWeight = slipsForMovement.reduce((sum, slip) => sum + slip.producedWeightKg, 0);
        if (totalBales > 0) setPressedStockMovements(prev => [...prev, { id: `psm-${Date.now()}`, date: tempDoc.date, siteId: 'pressing-warehouse', seaweedTypeId: tempDoc.seaweedTypeId, type: PressedStockMovementType.EXPORT_OUT, designation: `Export Shipment ${tempDoc.docNo}`, outBales: totalBales, outKg: totalWeight, relatedId: tempDoc.id }]);
        
        // Firebase sync
        const result = await firebaseService.addExportDocument(tempDoc);
        if (result) {
          setExportDocuments(prev => prev.map(d => d.id === tempDoc.id ? result : d));
        } else {
          setExportDocuments(prev => prev.filter(d => d.id !== tempDoc.id));
          setPressingSlips(prev => prev.map(slip => slip.exportDocId === tempDoc.id ? { ...slip, exportDocId: undefined } : slip));
          if (totalBales > 0) setPressedStockMovements(prev => prev.filter(m => m.relatedId !== tempDoc.id));
        }
    },
    updateExportDocument: async (updatedDoc: ExportDocument) => {
        setExportDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
        setPressingSlips(prev => prev.map(slip => updatedDoc.pressingSlipIds.includes(slip.id) ? { ...slip, exportDocId: updatedDoc.id } : (slip.exportDocId === updatedDoc.id ? { ...slip, exportDocId: undefined } : slip)));
        const updatedMovements = pressedStockMovements.filter(m => m.relatedId !== updatedDoc.id);
        const slipsForMovement = pressingSlips.filter(s => updatedDoc.pressingSlipIds.includes(s.id));
        const totalBales = slipsForMovement.reduce((sum, s) => sum + s.producedBalesCount, 0);
        const totalWeight = slipsForMovement.reduce((sum, s) => sum + s.producedWeightKg, 0);
        if (totalBales > 0) updatedMovements.push({ id: `psm-${Date.now()}`, date: updatedDoc.date, siteId: 'pressing-warehouse', seaweedTypeId: updatedDoc.seaweedTypeId, type: PressedStockMovementType.EXPORT_OUT, designation: `Export Shipment ${updatedDoc.docNo}`, outBales: totalBales, outKg: totalWeight, relatedId: updatedDoc.id });
        setPressedStockMovements(updatedMovements);
        
        // Firebase sync
        await firebaseService.updateExportDocument(updatedDoc);
    },
    deleteExportDocument: async (docId: string) => {
        setPressingSlips(prev => prev.map(slip => slip.exportDocId === docId ? { ...slip, exportDocId: undefined } : slip));
        setExportDocuments(prev => prev.filter(d => d.id !== docId));
        setPressedStockMovements(prev => prev.filter(m => m.relatedId !== docId));
        
        // Firebase sync
        await firebaseService.deleteExportDocument(docId);
    },
  };

  const siteTransferFunctions = {
    addSiteTransfer: async (transferData: Omit<SiteTransfer, 'id' | 'status' | 'history'>) => {
        const tempTransfer: SiteTransfer = { ...transferData, id: `st-${Date.now()}`, status: SiteTransferStatus.AWAITING_OUTBOUND, history: [{ status: SiteTransferStatus.AWAITING_OUTBOUND, date: new Date().toISOString(), notes: 'Transfer initiated.' }] };
        setSiteTransfers(prev => [...prev, tempTransfer]);
        await addStockMovement({ date: tempTransfer.date, siteId: tempTransfer.sourceSiteId, seaweedTypeId: tempTransfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_OUT, designation: `Transfer to ${sites.find(s => s.id === tempTransfer.destinationSiteId)?.name} (${tempTransfer.id})`, outKg: tempTransfer.weightKg, outBags: tempTransfer.bags, relatedId: tempTransfer.id });
        
        // Firebase sync
        const result = await firebaseService.addSiteTransfer(tempTransfer);
        if (result) {
          setSiteTransfers(prev => prev.map(t => t.id === tempTransfer.id ? result : t));
        } else {
          setSiteTransfers(prev => prev.filter(t => t.id !== tempTransfer.id));
        }
    },
    updateSiteTransfer: async (updatedTransfer: SiteTransfer) => {
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
                await addStockMovement({ date: transfer.completionDate || new Date().toISOString().split('T')[0], siteId: transfer.destinationSiteId, seaweedTypeId: transfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_IN, designation: `Transfer from ${sites.find(s => s.id === transfer.sourceSiteId)?.name} (${transfer.id})`, inKg: transfer.receivedWeightKg, inBags: transfer.receivedBags, relatedId: transfer.id });
            }
        }
        if (original.status !== SiteTransferStatus.CANCELLED && transfer.status === SiteTransferStatus.CANCELLED) {
            await addStockMovement({ date: transfer.completionDate || new Date().toISOString().split('T')[0], siteId: transfer.sourceSiteId, seaweedTypeId: transfer.seaweedTypeId, type: StockMovementType.SITE_TRANSFER_IN, designation: `Cancelled Transfer ${transfer.id}: ${transfer.notes || ''}`.trim(), inKg: transfer.weightKg, inBags: transfer.bags, relatedId: transfer.id });
        }
        
        // Firebase sync
        await firebaseService.updateSiteTransfer(transfer);
    }
  };

  const cuttingOpFunctions = {
      addCuttingOperation: async (operationData: Omit<CuttingOperation, 'id'>) => {
        const tempOperation: CuttingOperation = { ...operationData, id: `cut-${Date.now()}`};
        const newCredits: FarmerCredit[] = [];
        operationData.moduleCuts.forEach(moduleCut => {
            const module = modules.find(m => m.id === moduleCut.moduleId);
            if (module && module.farmerId) {
                const creditAmount = moduleCut.linesCut * operationData.unitPrice;
                if (creditAmount > 0) newCredits.push({ id: `fc-${Date.now()}-${Math.random()}`, date: operationData.date, siteId: operationData.siteId, farmerId: module.farmerId, creditTypeId: 'ct-3', totalAmount: creditAmount, relatedOperationId: tempOperation.id, notes: `Cutting service for module ${module.code}` });
            }
        });
        setCuttingOperations(prev => [...prev, tempOperation]);
        if (newCredits.length > 0) setFarmerCredits(prev => [...prev, ...newCredits]);
        
        // Firebase sync
        const result = await firebaseService.addCuttingOperation(tempOperation);
        if (result) {
          setCuttingOperations(prev => prev.map(op => op.id === tempOperation.id ? result : op));
        } else {
          setCuttingOperations(prev => prev.filter(op => op.id !== tempOperation.id));
          if (newCredits.length > 0) setFarmerCredits(prev => prev.filter(fc => !newCredits.some(nc => nc.id === fc.id)));
        }
      },
      updateCuttingOperation: async (updatedOperation: CuttingOperation, moduleWeights?: Record<string, number>, plantingDate?: string) => {
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
                    plantingDate: plantingDate || updatedOperation.date,
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
                if (m.id === originalModuleId) {
                    const newCode = modules.find(mod=>mod.id === newModuleId)?.code || newModuleId;
                    return {
                        ...m,
                        farmerId: undefined,
                        statusHistory: [...m.statusHistory, { status: ModuleStatus.FREE, date: new Date().toISOString(), notes: `Operation moved to module ${newCode}` }]
                    };
                }
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
        } else if (newModuleId) {
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
        
        // Firebase sync
        await firebaseService.updateCuttingOperation(updatedOperation);
      },
      updateMultipleCuttingOperations: (operationIds: string[], paymentDate: string) => {
        const idSet = new Set(operationIds);
        setCuttingOperations(prev => prev.map(op => idSet.has(op.id) ? { ...op, isPaid: true, paymentDate } : op));
      },
      deleteCuttingOperation: async (operationId: string) => {
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
          
          // Firebase sync
          await firebaseService.deleteCuttingOperation(operationId);
      }
  };

  const incidentFunctions = {
    addIncident: async (incident: Omit<Incident, 'id'>) => {
      const temp = { ...incident, id: `inc-${Date.now()}` };
      setIncidents(prev => [...prev, temp]);
      const result = await firebaseService.addIncident(incident);
      if (result) {
        setIncidents(prev => prev.map(i => i.id === temp.id ? result : i));
      } else {
        setIncidents(prev => prev.filter(i => i.id !== temp.id));
      }
    },
    updateIncident: async (updatedIncident: Incident) => {
      setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
      await firebaseService.updateIncident(updatedIncident);
    },
    deleteIncident: async (incidentId: string) => {
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
      await firebaseService.deleteIncident(incidentId);
    },
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
    addRole: async (role: Omit<Role, 'id'>): Promise<Role | undefined> => {
        const newId = role.name.toUpperCase().replace(/\s/g, '_');
        if (roles.some(r => r.id === newId)) return undefined;
        const newRole = { ...role, id: newId, isDefault: false };
        setRoles(prev => [...prev, newRole]);
        const result = await firebaseService.addRole(newRole);
        if (!result) setRoles(prev => prev.filter(r => r.id !== newId));
        return result || undefined;
    },
    updateRole: async (updatedRole: Role) => {
      setRoles(prev => prev.map(it => it.id === updatedRole.id ? updatedRole : it));
      await firebaseService.updateRole(updatedRole);
    },
    deleteRole: async (roleId: string) => {
      setRoles(prev => prev.filter(it => it.id !== roleId && !it.isDefault));
      await firebaseService.deleteRole(roleId);
    }
  };

  const periodicTestFunctions = {
    addPeriodicTest: async (test: Omit<PeriodicTest, 'id'>) => {
      const temp = { ...test, id: `pt-${Date.now()}` };
      setPeriodicTests(prev => [...prev, temp]);
      const result = await firebaseService.addPeriodicTest(test);
      if (result) {
        setPeriodicTests(prev => prev.map(t => t.id === temp.id ? result : t));
      } else {
        setPeriodicTests(prev => prev.filter(t => t.id !== temp.id));
      }
    },
    updatePeriodicTest: async (updatedTest: PeriodicTest) => {
      setPeriodicTests(prev => prev.map(t => t.id === updatedTest.id ? updatedTest : t));
      await firebaseService.updatePeriodicTest(updatedTest);
    },
    deletePeriodicTest: async (testId: string) => {
      setPeriodicTests(prev => prev.filter(t => t.id !== testId));
      await firebaseService.deletePeriodicTest(testId);
    }
  };

  const findUserByEmail = (email: string): User | undefined => users.find(user => user.email.toLowerCase() === email.toLowerCase());

  const addUser = async (userData: Omit<User, 'id'>, invitationToken?: string): Promise<User | undefined> => {
      if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) return undefined;
      if (invitationToken) setInvitations(prev => prev.map(inv => inv.token === invitationToken ? { ...inv, status: InvitationStatus.ACCEPTED } : inv));
      const newUser: User = { id: `user-${Date.now()}`, ...userData };
      setUsers(prev => [...prev, newUser]);
      const result = await firebaseService.addUser(newUser);
      if (result) {
        setUsers(prev => prev.map(u => u.id === newUser.id ? result : u));
        return result;
      } else {
        setUsers(prev => prev.filter(u => u.id !== newUser.id));
        return undefined;
      }
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

  const updateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    await firebaseService.updateUser(updatedUser);
  };

  const markCyclesAsPaid = (cycleIds: string[], paymentRunId: string) => {
    const idSet = new Set(cycleIds);
    setCultivationCycles(prev => prev.map(c => idSet.has(c.id) ? { ...c, paymentRunId } : c));
  };

  const markDeliveriesAsPaid = (deliveryIds: string[], paymentRunId: string) => {
    const idSet = new Set(deliveryIds);
    setFarmerDeliveries(prev => prev.map(d => idSet.has(d.id) ? { ...d, paymentRunId } : d));
  };

  const addInvitation = async (data: Omit<Invitation, 'id' | 'token' | 'createdAt'>): Promise<Invitation> => {
    const newInvitation: Invitation = { ...data, id: `inv-${Date.now()}`, token: `inv-token-${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    setInvitations(prev => [...prev, newInvitation]);
    const result = await firebaseService.addInvitation(newInvitation);
    if (result) {
      setInvitations(prev => prev.map(i => i.id === newInvitation.id ? result : i));
      return result;
    }
    return newInvitation;
  };

  const deleteInvitation = async (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    await firebaseService.deleteInvitation(invitationId);
  };

  const findInvitationByToken = (token: string): Invitation | undefined => {
    const inv = invitations.find(i => i.token === token && i.status === InvitationStatus.PENDING);
    return (inv && new Date(inv.expiresAt) > new Date()) ? inv : undefined;
  };

  const addMessageLog = async (log: Omit<MessageLog, 'id'>) => {
    const temp = { ...log, id: `msg-${Date.now()}` };
    setMessageLogs(prev => [temp, ...prev]);
    const result = await firebaseService.addMessageLog(log);
    if (result) {
      setMessageLogs(prev => prev.map(m => m.id === temp.id ? result : m));
    } else {
      setMessageLogs(prev => prev.filter(m => m.id !== temp.id));
    }
  };
  const addGalleryPhoto = async (photo: Omit<GalleryPhoto, 'id'>) => {
    const temp = { ...photo, id: `photo-${Date.now()}` };
    setGalleryPhotos(prev => [temp, ...prev]);
    const result = await firebaseService.addGalleryPhoto(photo);
    if (result) {
      setGalleryPhotos(prev => prev.map(p => p.id === temp.id ? result : p));
    } else {
      setGalleryPhotos(prev => prev.filter(p => p.id !== temp.id));
    }
  };
  const updateGalleryPhotoComment = async (id: string, comment: string) => {
    const photo = galleryPhotos.find(p => p.id === id);
    if (photo) {
      const updated = { ...photo, comment };
      setGalleryPhotos(prev => prev.map(p => p.id === id ? updated : p));
      await firebaseService.updateGalleryPhoto(updated);
    }
  };
  const deleteGalleryPhoto = async (id: string) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== id));
    await firebaseService.deleteGalleryPhoto(id);
  };

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
