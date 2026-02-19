
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useLocalization } from '../contexts/LocalizationContext';
import type { CultivationCycle } from '../types';

interface EditCuttingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cycle: CultivationCycle) => void;
  cycle: CultivationCycle;
}

const EditCuttingRecordModal: React.FC<EditCuttingRecordModalProps> = ({ isOpen, onClose, onSave, cycle }) => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    quantity: '',
    intendedUse: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && cycle) {
      setFormData({
        quantity: String(cycle.cuttingsTakenAtHarvestKg || ''),
        intendedUse: cycle.cuttingsIntendedUse || '',
      });
      setError('');
    }
  }, [isOpen, cycle]);

  const validate = useCallback(() => {
    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty < 0) {
      setError(t('validationNonNegative'));
      return false;
    }
    setError('');
    return true;
  }, [formData.quantity, t]);

  useEffect(() => {
      if (isOpen) {
          validate();
      }
  }, [formData.quantity, isOpen, validate])

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...cycle,
        cuttingsTakenAtHarvestKg: parseFloat(formData.quantity) || 0,
        cuttingsIntendedUse: formData.intendedUse.trim() || undefined,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editCuttingsRecord')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={!!error}>{t('saveChanges')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('cuttingsQuantityKg')}
          type="number"
          step="0.01"
          value={formData.quantity}
          onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))}
          error={error}
          required
        />
        <Input
          label={t('cuttingsIntendedUse')}
          value={formData.intendedUse}
          onChange={e => setFormData(p => ({ ...p, intendedUse: e.target.value }))}
          placeholder={t('cuttingsIntendedUsePlaceholder')}
        />
      </div>
    </Modal>
  );
};

export default EditCuttingRecordModal;
