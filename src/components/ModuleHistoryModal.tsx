
import React from 'react';
import Modal from './ui/Modal';
import StatusBadge from './ui/StatusBadge';
import { useLocalization } from '../contexts/LocalizationContext';
import type { ModuleStatusHistory } from '../types';
import Icon from './ui/Icon';

interface ModuleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ModuleStatusHistory[];
  moduleCode: string;
}

const ModuleHistoryModal: React.FC<ModuleHistoryModalProps> = ({ isOpen, onClose, history, moduleCode }) => {
    const { t, language } = useLocalization();

    // Sort history descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('moduleStatusHistoryTitle')}: ${moduleCode}`}
            widthClass="max-w-2xl"
        >
            {sortedHistory.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto pr-4 pl-2">
                    <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3">                  
                        {sortedHistory.map((item, index) => {
                            const date = new Date(item.date);
                            const dateStr = date.toLocaleDateString(language, { dateStyle: 'long' });
                            const timeStr = date.toLocaleTimeString(language, { timeStyle: 'short' });

                            return (
                                <li key={index} className="mb-8 ml-6">            
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full -left-4 ring-4 ring-white dark:ring-gray-800">
                                        <Icon name="Activity" className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                    </span>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                            <StatusBadge status={item.status} />
                                            <time className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 flex items-center gap-1">
                                                <Icon name="Calendar" className="w-3 h-3" />
                                                {dateStr} <span className="mx-1">•</span> {timeStr}
                                            </time>
                                        </div>
                                        
                                        {item.notes ? (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700/50">
                                                {item.notes}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">{t('none')}</p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                    <Icon name="FileText" className="w-12 h-12 mb-3 opacity-20" />
                    <p>{t('noHistory')}</p>
                </div>
            )}
        </Modal>
    );
};

export default ModuleHistoryModal;
