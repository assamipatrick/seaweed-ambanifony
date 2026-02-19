
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useSettings } from '../contexts/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/formatters';
import type { CuttingOperation } from '../types';
import { exportDataToExcel } from '../utils/excelExporter';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import CuttingOperationFormModal from '../components/CuttingOperationFormModal';
import StatusBadge from '../components/ui/StatusBadge';

type SortableKeys = keyof CuttingOperation | 'siteName' | 'providerName';

const CuttingsLedger: React.FC = () => {
    const { t } = useLocalization();
    const { settings } = useSettings();
    const { cuttingOperations, sites, serviceProviders, modules, farmers, seaweedTypes, deleteCuttingOperation } = useData();

    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [filters, setFilters] = useState({ seaweedTypeId: 'all', startDate: '', endDate: '', siteId: 'all' });
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOperation, setEditingOperation] = useState<CuttingOperation | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [operationToDelete, setOperationToDelete] = useState<string | null>(null);

    const siteMap = useMemo(() => new Map(sites.map(s => [s.id, s.name])), [sites]);
    const providerMap = useMemo(() => new Map(serviceProviders.map(p => [p.id, p.name])), [serviceProviders]);
    const farmerMap = useMemo(() => new Map(farmers.map(f => [f.id, `${f.firstName} ${f.lastName}`])), [farmers]);
    const seaweedTypeMap = useMemo(() => new Map(seaweedTypes.map(st => [st.id, st.name])), [seaweedTypes]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    };

    const clearFilters = useCallback(() => {
        setFilters({ seaweedTypeId: 'all', startDate: '', endDate: '', siteId: 'all' });
    }, []);

    const filteredOperations = useMemo(() => {
        let ops = [...cuttingOperations];

        if (filters.seaweedTypeId !== 'all') {
            ops = ops.filter(op => op.seaweedTypeId === filters.seaweedTypeId);
        }
        if (filters.siteId !== 'all') {
            ops = ops.filter(op => op.siteId === filters.siteId);
        }
        if (filters.startDate) {
            ops = ops.filter(op => op.date >= filters.startDate);
        }
        if (filters.endDate) {
            ops = ops.filter(op => op.date <= filters.endDate);
        }

        return ops;
    }, [cuttingOperations, filters]);

    const sortedOperations = useMemo(() => {
        let sortableItems = [...filteredOperations];
        sortableItems.sort((a, b) => {
            let valA: any = '', valB: any = '';

            if (sortConfig.key === 'siteName') {
                valA = siteMap.get(a.siteId) || '';
                valB = siteMap.get(b.siteId) || '';
            } else if (sortConfig.key === 'providerName') {
                valA = providerMap.get(a.serviceProviderId) || '';
                valB = providerMap.get(b.serviceProviderId) || '';
            } else {
                valA = a[sortConfig.key as keyof CuttingOperation];
                valB = b[sortConfig.key as keyof CuttingOperation];
            }

            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [filteredOperations, sortConfig, siteMap, providerMap]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableKeys) => {
        if (sortConfig.key !== key) return <Icon name="ChevronDown" className="w-4 h-4 text-transparent group-hover:text-gray-400 transition-colors" />;
        return sortConfig.direction === 'ascending' ? <Icon name="ArrowUp" className="w-4 h-4" /> : <Icon name="ArrowDown" className="w-4 h-4" />;
    };

    const SortableHeader: React.FC<{ sortKey: SortableKeys; label: string; className?: string }> = ({ sortKey, label, className = '' }) => (
        <th className={`p-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className={`group flex items-center gap-2 w-full ${className.includes('text-right') ? 'justify-end' : ''} ${className.includes('text-center') ? 'justify-center' : ''}`}>
                {label} {getSortIcon(sortKey)}
            </button>
        </th>
    );

    const handleOpenEditModal = (operation: CuttingOperation) => {
        setEditingOperation(operation);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setOperationToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (operationToDelete) {
            deleteCuttingOperation(operationToDelete);
        }
        setIsConfirmOpen(false);
        setOperationToDelete(null);
    };

    const handleExportExcel = async () => {
        const dataToExport = sortedOperations.map(op => {
             const beneficiary = op.beneficiaryFarmerId 
                ? farmerMap.get(op.beneficiaryFarmerId) 
                : t('various');
             
             const totalLines = op.moduleCuts.reduce((s, mc) => s + mc.linesCut, 0);

             return {
                date: op.date,
                site: siteMap.get(op.siteId) || t('unknown'),
                provider: providerMap.get(op.serviceProviderId) || t('unknown'),
                seaweedType: seaweedTypeMap.get(op.seaweedTypeId) || t('unknown'),
                beneficiary,
                totalLines,
                unitPrice: op.unitPrice,
                totalAmount: op.totalAmount,
                status: op.isPaid ? 'Paid' : 'Unpaid',
                paymentDate: op.paymentDate || ''
            };
        });

        const columns = [
            { header: t('date'), key: 'date', width: 15 },
            { header: t('site'), key: 'site', width: 20 },
            { header: t('serviceProvider'), key: 'provider', width: 25 },
            { header: t('seaweedType'), key: 'seaweedType', width: 20 },
            { header: t('beneficiaryFarmers'), key: 'beneficiary', width: 25 },
            { header: t('totalLinesCut'), key: 'totalLines', width: 15 },
            { header: t('unitPricePerLine'), key: 'unitPrice', width: 15 },
            { header: t('totalAmount'), key: 'totalAmount', width: 15 },
            { header: t('status'), key: 'status', width: 15 },
            { header: t('paymentDate'), key: 'paymentDate', width: 15 },
        ];

        await exportDataToExcel(dataToExport, columns, `CuttingsLedger_${new Date().toISOString().split('T')[0]}`, 'Operations');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">{t('cuttingOperationsTitle')}</h1>
                <Button onClick={handleExportExcel} variant="secondary">
                    <Icon name="FileSpreadsheet" className="w-5 h-5 mr-2" />
                    {t('exportExcel')}
                </Button>
            </div>

            <Card className="mb-6" title={t('filtersTitle')}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <Select label={t('site')} value={filters.siteId} onChange={e => handleFilterChange('siteId', e.target.value)}>
                        <option value="all">{t('allSites')}</option>
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <Select label={t('seaweedType')} value={filters.seaweedTypeId} onChange={e => handleFilterChange('seaweedTypeId', e.target.value)}>
                        <option value="all">{t('allSeaweedTypes')}</option>
                        {seaweedTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </Select>
                    <Input label={t('startDate')} type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
                    <Input label={t('endDate')} type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
                    <Button variant="secondary" onClick={clearFilters} className="h-[42px] w-full">{t('clearFilters')}</Button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <SortableHeader sortKey="date" label={t('date')} />
                                <SortableHeader sortKey="siteName" label={t('site')} />
                                <SortableHeader sortKey="providerName" label={t('serviceProvider')} />
                                <th className="p-3">{t('seaweedType')}</th>
                                <th className="p-3">{t('beneficiaryFarmers')}</th>
                                <th className="p-3 text-right">{t('totalLinesCut')}</th>
                                <SortableHeader sortKey="totalAmount" label={t('totalAmount')} className="text-right" />
                                <SortableHeader sortKey="isPaid" label={t('status')} className="text-center" />
                                <th className="p-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOperations.map(op => {
                                const totalLines = op.moduleCuts.reduce((s, mc) => s + mc.linesCut, 0);
                                const beneficiary = op.beneficiaryFarmerId 
                                    ? farmerMap.get(op.beneficiaryFarmerId) 
                                    : (op.moduleCuts.length > 1 ? t('various') : t('noBeneficiary'));
                                
                                return (
                                    <tr key={op.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                        <td className="p-3 whitespace-nowrap">{op.date}</td>
                                        <td className="p-3">{siteMap.get(op.siteId) || t('unknown')}</td>
                                        <td className="p-3 font-medium">{providerMap.get(op.serviceProviderId) || t('unknown')}</td>
                                        <td className="p-3">{seaweedTypeMap.get(op.seaweedTypeId) || '-'}</td>
                                        <td className="p-3">{beneficiary || '-'}</td>
                                        <td className="p-3 text-right">{totalLines}</td>
                                        <td className="p-3 text-right font-bold">{formatCurrency(op.totalAmount, settings.localization)}</td>
                                        <td className="p-3 text-center">
                                            {op.isPaid ? (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('paid')}</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{t('unpaid')}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => handleOpenEditModal(op)}>
                                                    <Icon name="Edit2" className="w-4 h-4" />
                                                </Button>
                                                <Button variant="danger" onClick={() => handleDeleteClick(op.id)}>
                                                    <Icon name="Trash2" className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedOperations.length === 0 && (
                                <tr><td colSpan={9} className="text-center p-8 text-gray-500 italic">{t('noDataForReport')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            {isEditModalOpen && (
                <CuttingOperationFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    operation={editingOperation}
                />
            )}
            
            {isConfirmOpen && (
                <ConfirmationModal 
                    isOpen={isConfirmOpen} 
                    onClose={() => setIsConfirmOpen(false)} 
                    onConfirm={handleConfirmDelete} 
                    title={t('confirmDeleteTitle')} 
                    message={t('confirmDeleteCuttingOperation')} 
                />
            )}
        </div>
    );
};

export default CuttingsLedger;
