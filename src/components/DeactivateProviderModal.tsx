import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useLocalization } from '../contexts/LocalizationContext';
import type { ServiceProvider } from '../types';

interface DeactivateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider;
  onConfirm: (providerId: string, exitDate: string, exitReason: string) => void;
}

const DeactivateProviderModal: React.FC<DeactivateProviderModalProps> = ({ isOpen, onClose, provider, onConfirm }) => {
  const { t } = useLocalization();
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitReason, setExitReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // FIX: Add validation for exit reason
    if (!exitDate || !exitReason.trim()) {
        setError(t('validationRequired'));
        return;
    }
    onConfirm(provider.id, exitDate, exitReason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('confirmDeactivate')}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleSubmit}>{t('deactivateProvider')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
           {t('confirmDeactivateMessage').replace('{name}', `${provider.name}`)}
        </p>
        <Input 
            label={t('exitDate')} 
            type="date" 
            value={exitDate} 
            onChange={e => setExitDate(e.target.value)} 
            required 
        />
        <Input 
            label={t('exitReason')} 
            value={exitReason} 
            onChange={e => setExitReason(e.target.value)} 
            placeholder="e.g. Fin de contrat, Performance..."
            required 
            error={error}
        />
      </div>
    </Modal>
  );
};

export default DeactivateProviderModal;
