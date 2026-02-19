
    const handleConfirmHarvest = () => {
        const isOther = harvestDetails.notes === 'Other';
        const harvestedWeightNum = parseFloat(harvestDetails.harvestedWeight);
        const cuttingsWeightNum = parseFloat(harvestDetails.cuttingsWeight) || 0;

        if (cycleToHarvest && harvestDetails.date && 
            (!isOther || customHarvestNote.trim()) && 
            harvestDetails.linesHarvested && 
            !isNaN(harvestedWeightNum) && harvestedWeightNum > 0 &&
            harvestDetails.cuttingsWeight !== '' && !isNaN(cuttingsWeightNum) && cuttingsWeightNum >= 0
        ) {
            const finalNote = isOther ? customHarvestNote : harvestDetails.notes;
            updateCultivationCycle({
                ...cycleToHarvest.cycle,
                status: ModuleStatus.HARVESTED,
                harvestDate: harvestDetails.date,
                processingNotes: finalNote,
                linesHarvested: Number(harvestDetails.linesHarvested),
                harvestedWeight: harvestedWeightNum,
                cuttingsTakenAtHarvestKg: cuttingsWeightNum,
                cuttingsIntendedUse: cuttingsWeightNum > 0 ? harvestDetails.cuttingsIntendedUse : undefined,
            });
            setIsHarvestConfirmOpen(false);
            setCycleToHarvest(null);
        }
    };

    const SortableHeader: React.FC<{ sortKey: string; label: string; className?: string }> = ({ sortKey, label, className = '' }) => (
        <th className={`p-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className={`group flex items-center gap-2 w-full whitespace-nowrap ${className.includes('text-right') ? 'justify-end' : ''}`}>
                {label} {getSortIcon(sortKey)}
            </button>
        </th>
    );
    
    const harvestedWeightNum = parseFloat(harvestDetails.harvestedWeight) || 0;
    const cuttingsWeightNum = parseFloat(harvestDetails.cuttingsWeight) || 0;
    const netWeight = harvestedWeightNum - cuttingsWeightNum;

    // Calculation for Harvest Modal UI Feedback
    const linesHarvestedInput = parseInt(harvestDetails.linesHarvested || '0', 10);
    const totalLinesPlanted = cycleToHarvest?.cycle.linesPlanted || cycleToHarvest?.module?.lines || 0;
    const isFullHarvest = cycleToHarvest && linesHarvestedInput >= totalLinesPlanted;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{pageTitle || t('cultivationCycleManagementTitle')}</h1>
                <div className="flex gap-2">
                     <Button variant="secondary" onClick={handleExportExcel}>
                        <Icon name="FileSpreadsheet" className="w-5 h-5 mr-2"/>{t('exportExcel')}
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}><Icon name="PlusCircle" className="w-5 h-5"/>{t('addCycle')}</Button>
                </div>
            </div>

            <Card className="mb-6" title={t('filtersTitle')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Select label={t('site')} value={filters.siteId} onChange={e => handleFilterChange('siteId', e.target.value)} disabled={!!initialFilters?.siteId}>
                        <option value="all">{t('allSites')}</option>
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <Select label={t('seaweedType')} value={filters.seaweedTypeId} onChange={e => handleFilterChange('seaweedTypeId', e.target.value)} disabled={!!initialFilters?.seaweedTypeId}>
                        <option value="all">{t('allSeaweedTypes')}</option>
                        {seaweedTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </Select>
                    <Button variant="secondary" onClick={clearFilters} className="h-[42px] w-full">{t('clearFilters')}</Button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-3 w-12"></th>
                                <th className="p-3 w-16 text-center">{t('alerts')}</th>
                                <SortableHeader sortKey="module.code" label={t('module')} />
                                <SortableHeader sortKey="farmer.firstName" label={t('farmer')} />
                                <SortableHeader sortKey="seaweedType.name" label={t('seaweedType')} />
                                <SortableHeader sortKey="plantingDate" label={t('plantingDate')} />
                                <SortableHeader sortKey="age" label={t('ageInDays')} className="text-right" />
                                <SortableHeader sortKey="harvestDate" label={t('harvestDate')} />
                                <SortableHeader sortKey="status" label={t('status')} />
                                <th className="p-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fullCycleInfo.map((fullInfo) => {
                                const { cycle, module, seaweedType, farmer, alertStatus, age } = fullInfo;
                                const isExpanded = expandedCycleId === cycle.id;
                                return (
                                <React.Fragment key={cycle.id}>
                                <tr
                                  ref={el => {
                                      if (el) {
                                          rowRefs.current.set(cycle.id, el);
                                      } else {
                                          rowRefs.current.delete(cycle.id);
                                      }
                                  }}
                                  className={`border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 ${cycle.id === highlightedId ? 'highlight-row' : ''}`}
                                >
                                    <td className="p-3 text-center">
                                        <Button
                                            variant="ghost"
                                            className="p-1 !rounded-full"
                                            onClick={() => setExpandedCycleId(isExpanded ? null : cycle.id)}
                                            aria-expanded={isExpanded}
                                            aria-controls={`details-${cycle.id}`}
                                        >
                                            <Icon name="ChevronRight" className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </Button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <AlertIndicator status={alertStatus} />
                                    </td>
                                    <td className="p-3 font-mono font-semibold whitespace-nowrap">{module?.code || t('unknown')}</td>
                                    <td className="p-3 whitespace-nowrap">{farmer ? `${farmer.firstName} ${farmer.lastName}` : t('unknown')}</td>
                                    <td className="p-3 whitespace-nowrap">{seaweedType?.name || t('unknown')}</td>
                                    <td className="p-3 whitespace-nowrap">{cycle.plantingDate}</td>
                                    <td className="p-3 text-right font-semibold">
                                        {age >= 50 ? (
                                            <Tooltip content={t('exactAge').replace('{days}', String(age))}>
                                                <span className="cursor-help border-b border-dotted">+50</span>
                                            </Tooltip>
                                        ) : (
                                            age
                                        )}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">{cycle.harvestDate || '-'}</td>
                                    <td className="p-3">
                                        <StatusBadge status={cycle.status} />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            { (cycle.status === ModuleStatus.PLANTED || cycle.status === ModuleStatus.GROWING) && (
                                                <Button variant="primary" onClick={() => handleHarvestClick(fullInfo)}>
                                                    <Icon name="Scissors" className="w-4 h-4" />{t('harvest')}
                                                </Button>
                                            )}
                                            <Button variant="ghost" onClick={() => handleHistoryClick(fullInfo)}>
                                                <Icon name="FileText" className="w-4 h-4" />{t('history')}
                                            </Button>
                                            <Button variant="ghost" onClick={() => handleOpenEditModal(cycle)}><Icon name="Settings" className="w-4 h-4" /></Button>
                                            <Button variant="danger" onClick={() => handleDeleteClick(cycle.id)}><Icon name="Trash2" className="w-4 h-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr id={`details-${cycle.id}`}>
                                        <td colSpan={10} className="p-0">
                                            <ExpandedCycleDetails info={fullInfo} prediction={predictions[cycle.id] || { isLoading: false, error: null, result: null }} onPredict={() => handlePredict(fullInfo)} />
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            {isAddModalOpen && <PlantingFormModal isOpen={isAddModalOpen} onClose={handleCloseModal} />}
            {isEditModalOpen && <EditCultivationCycleFormModal isOpen={isEditModalOpen} onClose={handleCloseModal} onSave={handleSave} cycle={editingCycle} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title={t('confirmDeleteTitle')} message={t('confirmDeleteCycle')} />}
            {isHistoryModalOpen && selectedCycleInfo && selectedCycleInfo.module && <CultivationCycleHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} cycle={selectedCycleInfo.cycle} module={selectedCycleInfo.module} />}
            
            {isHarvestConfirmOpen && cycleToHarvest && (
                <ConfirmationModal
                    isOpen={isHarvestConfirmOpen}
                    onClose={() => setIsHarvestConfirmOpen(false)}
                    onConfirm={handleConfirmHarvest}
                    title={`${t('confirmHarvestTitle')}: ${cycleToHarvest.module?.code}`}
                    message={
                        <div className="space-y-4 text-left">
                            <p>{t('confirmHarvestMessage')}</p>
                            <Input label={t('harvestDate')} type="date" value={harvestDetails.date} onChange={e => setHarvestDetails(p => ({...p, date: e.target.value}))} />
                            <Input label={t('harvestedWeightKg')} type="number" value={harvestDetails.harvestedWeight} onChange={e => setHarvestDetails(p => ({...p, harvestedWeight: e.target.value}))} />
                            <Input label={t('cuttingsWeightKg')} type="number" value={harvestDetails.cuttingsWeight} onChange={e => setHarvestDetails(p => ({...p, cuttingsWeight: e.target.value}))} />
                             {(parseFloat(harvestDetails.cuttingsWeight) || 0) > 0 && (
                                <Input
                                    label={t('cuttingsIntendedUse')}
                                    value={harvestDetails.cuttingsIntendedUse}
                                    onChange={e => setHarvestDetails(p => ({ ...p, cuttingsIntendedUse: e.target.value }))}
                                    placeholder={t('cuttingsIntendedUsePlaceholder')}
                                />
                            )}
                            <Input label={t('wetProduction')} type="text" value={`${netWeight.toFixed(2)} kg`} disabled />
                            
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('linesHarvested')}</label>
                                    <span className="text-xs text-gray-500">{t('linesPlanted')}: {totalLinesPlanted}</span>
                                </div>
                                <Input 
                                    type="number" 
                                    value={harvestDetails.linesHarvested} 
                                    onChange={e => setHarvestDetails(p => ({...p, linesHarvested: e.target.value}))} 
                                    containerClassName="mb-1"
                                />
                                {harvestDetails.linesHarvested && (
                                    <p className={`text-xs font-semibold ${isFullHarvest ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {isFullHarvest 
                                            ? `✓ Full Harvest: Module will be freed.` 
                                            : `⚠ Partial Harvest: Module remains assigned.`
                                        }
                                    </p>
                                )}
                            </div>

                            <Select label={t('harvestReason')} value={harvestDetails.notes} onChange={e => setHarvestDetails(p => ({...p, notes: e.target.value}))}>
                                <option value="Harvest for maturity">{t('harvestReason_maturity')}</option>
                                {incidentTypes.map(reason => <option key={reason.id} value={reason.name}>{reason.name}</option>)}
                                <option value="Other">{t('other')}</option>
                            </Select>
                            {harvestDetails.notes === 'Other' && (
                                <Input 
                                    label={t('other')}
                                    value={customHarvestNote}
                                    onChange={e => setCustomHarvestNote(e.target.value)}
                                    error={!customHarvestNote.trim() ? t('validationReasonRequired') : ''}
                                    placeholder={t('otherReasonPlaceholder')}
                                />
                            )}
                        </div>
                    }
                    confirmText={t('harvest')}
                    confirmDisabled={!harvestDetails.date || !harvestDetails.harvestedWeight || !harvestDetails.linesHarvested || !harvestDetails.cuttingsWeight || (harvestDetails.notes === 'Other' && !customHarvestNote.trim())}
                />
            )}
        </div>
    );
};
