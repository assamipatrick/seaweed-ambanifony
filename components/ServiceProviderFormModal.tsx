import React, { useState, useEffect, useCallback } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useLocalization } from '../contexts/LocalizationContext';
import type { ServiceProvider } from '../types';
// FIX: Import ServiceProviderStatus enum for type safety.
import { ServiceProviderStatus } from '../types';

interface ServiceProviderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: ServiceProvider | null;
    onSave: (data: Omit<ServiceProvider, 'id'>) => void;
}

const ServiceProviderFormModal: React.FC<ServiceProviderFormModalProps> = ({ isOpen, onClose, provider, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: '', 
        serviceType: '', 
        contactPerson: '', 
        phone: '', 
        email: '', 
        address: '',
        // FIX: Initialize joinDate to ensure it's part of the form state.
        joinDate: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (provider) {
            setFormData({
                name: provider.name,
                serviceType: provider.serviceType,
                contactPerson: provider.contactPerson || '',
                phone: provider.phone,
                email: provider.email || '',
                address: provider.address || '',
                joinDate: provider.joinDate || new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData({ name: '', serviceType: '', contactPerson: '', phone: '', email: '', address: '', joinDate: new Date().toISOString().split('T')[0] });
        }
    }, [provider, isOpen]);

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = t('validationRequired');
        if (!formData.serviceType.trim()) newErrors.serviceType = t('validationRequired');
        if (!formData.phone.trim()) newErrors.phone = t('validationRequired');
        if (!formData.joinDate) newErrors.joinDate = t('validationRequired');
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validationEmail');
        return newErrors;
    }, [formData, t]);
    
    useEffect(() => { setErrors(validate()) }, [formData, validate]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(p => ({ ...p, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        // FIX: Construct a complete object with all required fields for the onSave function.
        onSave({
            ...formData,
            status: provider?.status || ServiceProviderStatus.ACTIVE,
            contactPerson: formData.contactPerson || undefined,
            email: formData.email || undefined,
            address: formData.address || undefined,
        });
    };

    const isFormInvalid = Object.keys(errors).length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={provider ? t('editProvider') : t('addProvider')}
            widthClass="max-w-3xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={handleSubmit} disabled={isFormInvalid}>{t('save')}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('name')} value={formData.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} required autoFocus />
                <Input label={t('serviceType')} value={formData.serviceType} onChange={e => handleChange('serviceType', e.target.value)} error={errors.serviceType} required />
                <Input label={`${t('contactPerson')} (${t('optional')})`} value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} />
                <Input label={t('phone')} value={formData.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} required />
                <Input label={`${t('email')} (${t('optional')})`} type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} />
                <Input label={t('hireDate')} type="date" value={formData.joinDate} onChange={e => handleChange('joinDate', e.target.value)} error={errors.joinDate} required />
                <Input containerClassName="md:col-span-2" label={`${t('address')} (${t('optional')})`} value={formData.address} onChange={e => handleChange('address', e.target.value)} />
            </form>
        </Modal>
    );
};

export default ServiceProviderFormModal;
