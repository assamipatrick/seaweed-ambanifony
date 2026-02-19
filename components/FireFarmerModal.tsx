
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useLocalization } from '../contexts/LocalizationContext';
import type { Farmer } from '../types';

interface FireFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer;
  onConfirm: (farmerId: string, exitDate: string, exitReason: string) => void;
}

const FireFarmerModal: React.FC<FireFarmerModalProps> = ({ isOpen, onClose, farmer, onConfirm }) => {
  const { t } = useLocalization();
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitReason, setExitReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!exitDate || !exitReason.trim()) {
        setError(t('validationRequired'));
        return;
    }
    onConfirm(farmer.id, exitDate, exitReason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('confirmFire')}
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleSubmit}>{t('fire')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
           {t('confirmFireMessage').replace('{name}', `${farmer.firstName} ${farmer.lastName}`)}
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
            placeholder="e.g. Resignation, Performance, Relocation..."
            required 
            error={error}
        />
      </div>
    </Modal>
  );
};

export default FireFarmerModal;
