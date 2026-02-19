import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocalization } from '../contexts/LocalizationContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import type { ServiceProvider } from '../types';
import ServiceProviderFormModal from '../components/ServiceProviderFormModal';
import StatusBadge from '../components/ui/StatusBadge';
import { ServiceProviderStatus } from '../types';
import DeactivateProviderModal from '../components/DeactivateProviderModal';

type SortableKeys = keyof ServiceProvider;

const ServiceProviders: React.FC = () => {
    const { t } = useLocalization();
    const { serviceProviders, addServiceProvider, updateServiceProvider, deleteServiceProvider } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    
    // Status Filter and Deactivate
    const [statusFilter, setStatusFilter] = useState<ServiceProviderStatus | 'ALL'>(ServiceProviderStatus.ACTIVE);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [providerToDeactivate, setProviderToDeactivate] = useState<ServiceProvider | null>(null);

    const filteredProviders = useMemo(() => {
        if (statusFilter === 'ALL') return serviceProviders;
        return serviceProviders.filter(p => p.status === statusFilter);
    }, [serviceProviders, statusFilter]);

    const sortedProviders = useMemo(() => {
        let sortableItems = [...filteredProviders];
        sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';
            
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [filteredProviders, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableKeys) => {
        if (sortConfig.key !== key) return <Icon name="ChevronDown" className="w-4 h-4 text-transparent group-hover:text-gray-400" />;
        return sortConfig.direction === 'ascending' ? <Icon name="ArrowUp" className="w-4 h-4" /> : <Icon name="ArrowDown" className="w-4 h-4" />;
    };

    const SortableHeader: React.FC<{ sortKey: SortableKeys; label: string; className?: string }> = ({ sortKey, label, className }) => (
        <th className={`p-3 ${className}`}><button onClick={() => requestSort(sortKey)} className={`group flex items-center gap-2 w-full ${className?.includes('text-right') ? 'justify-end' : ''}`}>{label}{getSortIcon(sortKey)}</button></th>
    );

    const handleOpenModal = (provider: ServiceProvider | null = null) => {
        setEditingProvider(provider);
        setIsFormModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProvider(null);
        setIsFormModalOpen(false);
    };

    const handleDeleteClick = (providerId: string) => {
        setProviderToDelete(providerId);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (providerToDelete) {
            deleteServiceProvider(providerToDelete);
        }
        setIsConfirmOpen(false);
        setProviderToDelete(null);
    };
    
    const handleDeactivateClick = (provider: ServiceProvider) => {
        setProviderToDeactivate(provider);
        setIsDeactivateModalOpen(true);
    };

    const handleConfirmDeactivate = (providerId: string, exitDate: string, exitReason: string) => {
        if (providerToDeactivate) {
            updateServiceProvider({
                ...providerToDeactivate,
                status: ServiceProviderStatus.INACTIVE,
                exitDate,
                exitReason
            });
            setProviderToDeactivate(null);
        }
    };
    
    const handleReactivateClick = (provider: ServiceProvider) => {
        updateServiceProvider({
            ...provider,
            status: ServiceProviderStatus.ACTIVE,
            joinDate: new Date().toISOString().split('T')[0], // Reset start date or keep history? Using new date for re-hire logic
            exitDate: undefined,
            exitReason: undefined
        });
    };

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('serviceProvidersTitle')}</h1>
                <Button onClick={() => handleOpenModal()}><Icon name="PlusCircle" className="w-5 h-5"/>{t('addProvider')}</Button>
            </div>
            
            <Card className="mb-6">
                <div className="flex items-center gap-4">
                     <span className="text-sm font-medium">{t('status')}:</span>
                     <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                         <button 
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === ServiceProviderStatus.ACTIVE ? 'bg-white dark:bg-gray-600 shadow-sm text-green-700 dark:text-green-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setStatusFilter(ServiceProviderStatus.ACTIVE)}
                        >
                            {t('status_ACTIVE')}
                        </button>
                        <button 
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === ServiceProviderStatus.INACTIVE ? 'bg-white dark:bg-gray-600 shadow-sm text-red-700 dark:text-red-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setStatusFilter(ServiceProviderStatus.INACTIVE)}
                        >
                            {t('status_INACTIVE')}
                        </button>
                        <button 
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setStatusFilter('ALL')}
                        >
                            {t('all')}
                        </button>
                     </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-3 w-20">{t('status')}</th>
                                <SortableHeader sortKey="name" label={t('name')} />
                                <SortableHeader sortKey="serviceType" label={t('serviceType')} />
                                <SortableHeader sortKey="contactPerson" label={t('contactPerson')} />
                                <SortableHeader sortKey="phone" label={t('phone')} />
                                <SortableHeader sortKey="joinDate" label={t('joinDate')} />
                                <th className="p-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProviders.map(provider => (
                                <tr key={provider.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                    <td className="p-3"><StatusBadge status={provider.status} /></td>
                                    <td className="p-3 font-semibold">{provider.name}</td>
                                    <td className="p-3">{provider.serviceType}</td>
                                    <td className="p-3">{provider.contactPerson || '-'}</td>
                                    <td className="p-3">{provider.phone}</td>
                                    <td className="p-3 text-xs">{provider.joinDate}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" onClick={() => handleOpenModal(provider)}><Icon name="Settings" className="w-4 h-4" />{t('edit')}</Button>
                                            {provider.status === ServiceProviderStatus.ACTIVE ? (
                                                <Button variant="danger" onClick={() => handleDeactivateClick(provider)} title={t('deactivateProvider')}>
                                                    <Icon name="LogOut" className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                 <Button variant="secondary" onClick={() => handleReactivateClick(provider)} title={t('reactivateProvider')}>
                                                    <Icon name="UserPlus" className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedProviders.length === 0 && (
                                <tr><td colSpan={7} className="p-6 text-center text-gray-500">{t('noProviders')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isFormModalOpen && (
                <ServiceProviderFormModal 
                    isOpen={isFormModalOpen} 
                    onClose={handleCloseModal} 
                    provider={editingProvider}
                    onSave={(data) => {
                        if (editingProvider) {
                            updateServiceProvider({ ...editingProvider, ...data });
                        } else {
                            addServiceProvider(data);
                        }
                        handleCloseModal();
                    }}
                />
            )}
            
            {isDeactivateModalOpen && providerToDeactivate && (
                <DeactivateProviderModal
                    isOpen={isDeactivateModalOpen}
                    onClose={() => setIsDeactivateModalOpen(false)}
                    provider={providerToDeactivate}
                    onConfirm={handleConfirmDeactivate}
                />
            )}

            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title={t('confirmDeleteTitle')} message={t('confirmDeleteProvider')} />}
        </div>
    );
};

export default ServiceProviders;