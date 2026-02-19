
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocalization } from '../contexts/LocalizationContext';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../utils/formatters';
import type { CuttingOperation, CultivationCycle } from '../types';
import { ModuleStatus } from '../types';

interface PlantingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationToEdit?: CuttingOperation | null;
}

const PlantingFormModal: React.FC<PlantingFormModalProps> = ({ isOpen, onClose, operationToEdit }) => {
  const { t } = useLocalization();
  const { sites, getFarmersBySite, modules, seaweedTypes, employees, serviceProviders, startCultivationFromCuttings, updateCuttingOperation, cultivationCycles } = useData();
  const { settings } = useSettings();

  const getInitialState = useCallback(() => {
    if (operationToEdit) {
        const cycle = cultivationCycles.find(c => c.cuttingOperationId === operationToEdit.id);
        const module = modules.find(m => m.id === operationToEdit.moduleCuts[0]?.moduleId);
        return {
          serviceProviderId: operationToEdit.serviceProviderId,
          siteId: operationToEdit.siteId,
          date: operationToEdit.date,
          plantingDate: cycle?.plantingDate || operationToEdit.date,
          lines: String(operationToEdit.moduleCuts[0]?.linesCut || ''),
          initialWeight: String(cycle?.initialWeight || ''),
          seaweedTypeId: operationToEdit.seaweedTypeId,
          pricePerLine: String(operationToEdit.unitPrice),
          beneficiaryFarmerId: operationToEdit.beneficiaryFarmerId || module?.farmerId || '',
          zoneId: module?.zoneId || '',
          moduleId: module?.id || '',
        };
    }
    const today = new Date().toISOString().split('T')[0];
    return {
      serviceProviderId: serviceProviders[0]?.id || '',
      siteId: sites[0]?.id || '',
      date: today,
      plantingDate: today,
      lines: '',
      initialWeight: '',
      seaweedTypeId: seaweedTypes[0]?.id || '',
      pricePerLine: '',
      beneficiaryFarmerId: '',
      zoneId: sites.find(s => s.id === (sites[0]?.id || ''))?.zones[0]?.id || '',
      moduleId: '',
    };
  }, [operationToEdit, sites, serviceProviders, seaweedTypes, cultivationCycles, modules]);
  
  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if(isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen, getInitialState]);

  const filteredZones = useMemo(() => sites.find(s => s.id === formData.siteId)?.zones || [], [sites, formData.siteId]);
  const filteredFarmers = useMemo(() => getFarmersBySite(formData.siteId), [getFarmersBySite, formData.siteId]);
  
  const availableModules = useMemo(() => {
    return modules.filter(m => {
        if (m.siteId !== formData.siteId) return false;
        if (formData.zoneId && m.zoneId !== formData.zoneId) return false;

        const history = m.statusHistory || [];
        const latestStatus = history.length > 0 ? history[history.length - 1].status : 'FREE';
        // When editing, the currently assigned module should also be in the list
        if(operationToEdit && m.id === operationToEdit.moduleCuts[0]?.moduleId) return true;
        
        return latestStatus === 'FREE';
    });
  }, [modules, formData.siteId, formData.zoneId, operationToEdit]);

  const cuttingsValue = useMemo(() => {
    const lines = parseFloat(formData.lines);
    const price = parseFloat(formData.pricePerLine);
    if (!isNaN(lines) && !isNaN(price)) {
      return lines * price;
    }
    return 0;
  }, [formData.lines, formData.pricePerLine]);

  const handleSiteChange = (siteId: string) => {
    const newSite = sites.find(s => s.id === siteId);
    setFormData(prev => ({
      ...prev,
      siteId,
      zoneId: newSite?.zones[0]?.id || '',
      beneficiaryFarmerId: '',
      moduleId: ''
    }));
  };

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.serviceProviderId) newErrors.serviceProviderId = t('validationRequired');
    if (!formData.siteId) newErrors.siteId = t('validationRequired');
    if (!formData.date) newErrors.date = t('validationRequired');
    if (!formData.plantingDate) newErrors.plantingDate = t('validationRequired');
    if (new Date(formData.plantingDate) < new Date(formData.date)) {
        newErrors.plantingDate = t('validationPlantingDateAfterOperation');
    }
    if (!formData.lines || parseFloat(formData.lines) <= 0) newErrors.lines = t('validationPositiveNumber');
    if (!formData.initialWeight || parseFloat(formData.initialWeight) <= 0) newErrors.initialWeight = t('validationPositiveNumber');
    if (!formData.seaweedTypeId) newErrors.seaweedTypeId = t('validationRequired');
    if (!formData.pricePerLine || parseFloat(formData.pricePerLine) < 0) newErrors.pricePerLine = t('validationNonNegative');
    if (!formData.beneficiaryFarmerId) newErrors.beneficiaryFarmerId = t('validationRequired');
    if (!formData.zoneId) newErrors.zoneId = t('validationRequired');
    if (!formData.moduleId) newErrors.moduleId = t('validationRequired');
    return newErrors;
  }, [formData, t]);

  useEffect(() => {
    setErrors(validate());
  }, [formData, validate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const moduleToPlant = modules.find(m => m.id === formData.moduleId);
    
    if (operationToEdit) {
        const updatedOpData = {
            date: formData.date,
            siteId: formData.siteId,
            serviceProviderId: formData.serviceProviderId,
            moduleCuts: [{ moduleId: formData.moduleId, linesCut: parseFloat(formData.lines) }],
            unitPrice: parseFloat(formData.pricePerLine),
            totalAmount: cuttingsValue,
            notes: t('notes_plantingOperationForModule').replace('{code}', moduleToPlant?.code || ''),
            seaweedTypeId: formData.seaweedTypeId,
            beneficiaryFarmerId: formData.beneficiaryFarmerId,
        };
        const updatedOperation = { ...operationToEdit, ...updatedOpData };
        const moduleWeights = { [formData.moduleId]: parseFloat(formData.initialWeight) };
        updateCuttingOperation(updatedOperation, moduleWeights, formData.plantingDate);

    } else {
        const cuttingData = {
            date: formData.date,
            siteId: formData.siteId,
            serviceProviderId: formData.serviceProviderId,
            moduleCuts: [{ moduleId: formData.moduleId, linesCut: parseFloat(formData.lines) }],
            unitPrice: parseFloat(formData.pricePerLine),
            totalAmount: cuttingsValue,
            isPaid: false,
            notes: t('notes_plantingOperationForModule').replace('{code}', moduleToPlant?.code || ''),
            seaweedTypeId: formData.seaweedTypeId,
        };
        const cycleData = {
            moduleId: formData.moduleId,
            seaweedTypeId: formData.seaweedTypeId,
            plantingDate: formData.plantingDate,
            status: ModuleStatus.PLANTED,
            initialWeight: parseFloat(formData.initialWeight),
            linesPlanted: parseFloat(formData.lines)
        };
        startCultivationFromCuttings(cuttingData, cycleData, formData.beneficiaryFarmerId);
    }
    onClose();
  };

  const isFormInvalid = Object.keys(errors).length > 0;

  return (
        <Modal isOpen={isOpen} onClose={onClose} title={operationToEdit ? t('editCuttingOperation') : t('newPlanting')} widthClass="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Operation details */}
                    <Select label={t('serviceProvider')} value={formData.serviceProviderId} onChange={e => setFormData(p => ({...p, serviceProviderId: e.target.value}))} error={errors.serviceProviderId} required>
                        <option value="">{t('selectProvider')}</option>
                        {serviceProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                    <Input label={t('dateOperation')} type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} error={errors.date} required />
                    <Input label={t('pricePerLine')} type="number" step="any" value={formData.pricePerLine} onChange={e => setFormData(p => ({...p, pricePerLine: e.target.value}))} error={errors.pricePerLine} required />
                </div>
                
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">{t('detailsModule')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select label={t('site')} value={formData.siteId} onChange={e => handleSiteChange(e.target.value)} error={errors.siteId} required>
                            <option value="">{t('selectSite')}</option>
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Select label={t('zonePlantation')} value={formData.zoneId} onChange={e => setFormData(p => ({...p, zoneId: e.target.value}))} disabled={!formData.siteId} error={errors.zoneId} required>
                            <option value="">{t('selectZone')}</option>
                            {filteredZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </Select>
                        <Select label={t('numModule')} value={formData.moduleId} onChange={e => setFormData(p => ({...p, moduleId: e.target.value}))} disabled={!formData.zoneId} error={errors.moduleId} required>
                            <option value="">{t('selectAModule')}</option>
                            {availableModules.map(m => <option key={m.id} value={m.id}>{m.code}</option>)}
                        </Select>
                        <Select label={t('seaweedType')} value={formData.seaweedTypeId} onChange={e => setFormData(p => ({...p, seaweedTypeId: e.target.value}))} error={errors.seaweedTypeId} required>
                            <option value="">{t('selectType')}</option>
                            {seaweedTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                        </Select>
                        <Input label={t('nombreLignesCoupees')} type="number" value={formData.lines} onChange={e => setFormData(p => ({...p, lines: e.target.value}))} error={errors.lines} required />
                        <Input label={t('poidsInitialLignes')} type="number" step="any" value={formData.initialWeight} onChange={e => setFormData(p => ({...p, initialWeight: e.target.value}))} error={errors.initialWeight} required />
                        <Select label={t('fermierBeneficiaire')} value={formData.beneficiaryFarmerId} onChange={e => setFormData(p => ({...p, beneficiaryFarmerId: e.target.value}))} disabled={!formData.siteId} error={errors.beneficiaryFarmerId} required>
                            <option value="">{t('selectFarmer')}</option>
                            {filteredFarmers.map(f => <option key={f.id} value={f.id}>{`${f.firstName} ${f.lastName}`}</option>)}
                        </Select>
                        <Input label={t('plantingDate')} type="date" value={formData.plantingDate} onChange={e => setFormData(p => ({...p, plantingDate: e.target.value}))} error={errors.plantingDate} required />
                    </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold text-lg text-right">
                    {t('valeurBouturage')}: {formatCurrency(cuttingsValue, settings.localization)}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={isFormInvalid}>{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PlantingFormModal;
