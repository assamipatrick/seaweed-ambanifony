
import React, { useMemo, FC, useState, useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import Button from './ui/Button';
import Icon from './ui/Icon';
import PrintPage from './printable/PrintPage';
import { numberToWords } from '../utils/numberToWords';
import { COUNTRIES } from '../../constants';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

export interface SheetRow {
    beneficiaryName: string;
    [key: string]: any;
}

export interface SheetColumn {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    format?: 'currency' | 'number';
    width?: string;
}

export interface SheetData {
    title: string;
    periodName: string;
    headerInfo: { label: string; value: string | undefined }[];
    columns: SheetColumn[];
    rows: SheetRow[];
    totalLabel: string;
    totalValue: number;
    totalValueInWords: string;
    denominations: any[];
    beneficiaryTypeLabel: string;
    status?: string;
}

interface PrintablePaymentSheetProps {
    data: SheetData;
    autoDownload?: boolean;
}

// Common style for thin borders to fix PDF thickness issues
const THIN_BORDER_STYLE = { borderWidth: '0.5px', borderColor: 'black', borderStyle: 'solid' };

const InfoField: FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
    <div className="text-[10px] text-black mb-1">
        <div className="flex items-baseline">
            <span className="w-auto mr-2 whitespace-nowrap font-medium">{label}</span>
            <div className="flex-grow font-bold truncate pl-1 border-b border-black border-dotted leading-tight">{children || <>&nbsp;</>}</div>
        </div>
    </div>
);


const FarmerDeliveryPage: FC<{
    rows: SheetRow[];
    periodName: string;
    pageIndex: number;
    totalPages: number;
    data: SheetData;
    isLastMainPage: boolean;
}> = ({ rows, periodName, pageIndex, totalPages, data, isLastMainPage }) => {
    const { settings } = useSettings();
    const { t } = useLocalization();

    const countryName = useMemo(() => {
        return COUNTRIES.find(c => c.code === settings.localization.country)?.name || settings.localization.country;
    }, [settings.localization.country]);

    const isDry = data.columns.some(c => c.key === 'dryPrice');
    const siteName = data.headerInfo.find(i => i.label === t('site'))?.value;
    const seaweedType = data.headerInfo.find(i => i.label === t('seaweedType'))?.value;
    const date = data.headerInfo.find(i => i.label === t('date'))?.value;

    return (
        <PrintPage landscape>
            <div className="h-full flex flex-col text-[9px] text-black bg-white font-sans">
                <header className="mb-2">
                    <div className="grid grid-cols-4 items-start">
                        <div className="col-span-1">
                            {settings.company.logoUrl && <img src={settings.company.logoUrl} alt="Company Logo" className="h-12 w-auto object-contain" />}
                        </div>
                        <div className="col-span-2 text-center">
                            <h1 className="font-bold text-sm uppercase mb-0.5">{settings.company.name}</h1>
                            <div className="text-[8px] leading-none space-y-0 text-gray-700 flex flex-wrap justify-center gap-x-2">
                                <span>{t('capital')}: {formatCurrency(settings.company.capital, settings.localization)}</span>
                                <span>{t('address')}: {settings.company.address}</span>
                                <span>{t('nif')}: {settings.company.nif}</span>
                                <span>{t('stat')}: {settings.company.stat}</span>
                                <span>{t('rc')}: {settings.company.rc}</span>
                                <span>{t('phone')}: {settings.company.phone}</span>
                                <span>{t('email')}: {settings.company.email}</span>
                                <span>{t('country')}: {countryName}</span>
                            </div>
                        </div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="text-center mt-1 mb-2">
                        <h2 className="text-sm font-bold uppercase underline decoration-2">{data.title}</h2>
                    </div>
                </header>

                 <div className="grid grid-cols-3 gap-x-4 mb-2">
                    <div className="space-y-0.5">
                        <InfoField label={`${t('exploitationSite')}:`}>{siteName}</InfoField>
                        <InfoField label={`${t('dateLabel')} du paiement:`}>{date}</InfoField>
                        <InfoField label={`${t('totalPaymentAmount')}:`}>{formatCurrency(data.totalValue, settings.localization)}</InfoField>
                        <InfoField label={`(${t('totalAmountInWords')})`}></InfoField>
                    </div>
                    <div className="space-y-0.5">
                        <InfoField label={`${t('seaweedType')}:`}>{seaweedType}</InfoField>
                        <InfoField label={`${t('checkNumber')}:`}></InfoField>
                        <InfoField label={`${t('pricePerKg')}:`}>{isDry ? formatCurrency((rows[0] as any)?.dryPrice || 0, settings.localization) : formatCurrency((rows[0] as any)?.wetPrice || 0, settings.localization)}</InfoField>
                    </div>
                    <div className="space-y-0.5">
                        <InfoField label={`${t('deliveryPeriod')}:`}>{periodName}</InfoField>
                        <InfoField label={`${t('checkAmount')}:`}></InfoField>
                    </div>
                </div>

                <table className="w-full border-collapse text-[8px] text-black leading-tight">
                    <thead className="font-bold bg-gray-100">
                        <tr>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Trans. Date</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Farmer</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Weight</th>
                            {isDry && <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Bags</th>}
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Value</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Credits</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Net Payable</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Responsible Signature</th>
                            <th className="px-1 py-1" style={THIN_BORDER_STYLE}>Signature</th>
                        </tr>
                    </thead>
                     <tbody>
                        {rows.map((row: any, index: number) => (
                            <tr key={index}>
                                <td className="px-1 py-0.5 text-center whitespace-nowrap align-middle" style={THIN_BORDER_STYLE}>{date}</td>
                                <td className="px-1 py-0.5 truncate max-w-[150px] align-middle" style={THIN_BORDER_STYLE}>{row.beneficiaryName}</td>
                                <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{formatNumber(row.netWeightKg ?? row.totalWeightKg, settings.localization)}</td>
                                {isDry && <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{row.totalBags}</td>}
                                <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(row.baseAmount, settings.localization)}</td>
                                <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(row.deduction, settings.localization)}</td>
                                <td className="px-1 py-0.5 text-right font-bold align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(row.netAmount, settings.localization)}</td>
                                <td className="px-1 py-0.5 h-6 align-middle" style={THIN_BORDER_STYLE}></td>
                                <td className="px-1 py-0.5 align-middle" style={THIN_BORDER_STYLE}></td>
                            </tr>
                        ))}
                    </tbody>
                     {isLastMainPage && (
                        <tfoot className="font-bold bg-gray-50">
                            <tr>
                                <td colSpan={isDry ? 5 : 4} className="px-1 py-1 text-right uppercase align-middle" style={THIN_BORDER_STYLE}>{t('totalToPay')}</td>
                                <td className="px-1 py-1 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(data.totalValue, settings.localization)}</td>
                                <td colSpan={3} className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
                 <div className="mt-2 mb-4 text-[9px]">
                     <span>({t('totalAmountInWords')}): <strong>{data.totalValueInWords}</strong></span>
                </div>

                <div className="flex-grow"></div>

                <div className="flex justify-around items-end pt-4 pb-2 text-center text-[10px]">
                    <div>
                        <p className="font-bold mb-8"><u>{t('theAccountant')}</u></p>
                    </div>
                    <div>
                        <p className="font-bold mb-8"><u>{t('theResponsible')}</u></p>
                    </div>
                </div>

                <footer className="w-full border-t border-black pt-1 mt-auto flex flex-col items-center text-center">
                    <p className="text-[7px] text-gray-600">{settings.company.name} - {settings.company.address}</p>
                    <p className="text-[7px] font-bold mt-0.5">Page {pageIndex + 1}/{totalPages}</p>
                </footer>
            </div>
        </PrintPage>
    );
};

const ServiceProviderPage: FC<any> = ({ rows, periodName, pageIndex, totalPages, data, isLastMainPage }) => {
    const { settings } = useSettings();
    const { t } = useLocalization();

    const countryName = useMemo(() => COUNTRIES.find(c => c.code === settings.localization.country)?.name || settings.localization.country, [settings.localization.country]);
    const siteName = data.headerInfo.find((i: any) => i.label === t('site'))?.value;
    const seaweedType = data.headerInfo.find((i: any) => i.label === t('seaweedType'))?.value;
    const paymentDate = data.headerInfo.find((i: any) => i.label === t('paymentDate'))?.value;
    
    // Calculate page specific or global totals. 
    // Here we use data.totalValue for the global money total, but calculate line counts.
    const totalLines = useMemo(() => data.rows.reduce((sum: number, row: any) => sum + (row.totalLines || 0), 0), [data.rows]);

    return (
        <PrintPage landscape>
            <div className="h-full flex flex-col text-[9px] text-black bg-white font-sans">
                 <header className="mb-2">
                    <div className="grid grid-cols-4 items-start">
                        <div className="col-span-1">
                            {settings.company.logoUrl && <img src={settings.company.logoUrl} alt="Company Logo" className="h-12 w-auto object-contain" />
                        </div>
                        <div className="col-span-2 text-center">
                            <h1 className="font-bold text-sm uppercase mb-0.5">{settings.company.name}</h1>
                            <div className="text-[8px] leading-none space-y-0 text-gray-700 flex flex-wrap justify-center gap-x-2">
                                <span>{t('capital')}: {formatCurrency(settings.company.capital, settings.localization)}</span>
                                <span>{t('address')}: {settings.company.address}</span>
                                <span>{t('nif')}: {settings.company.nif}</span>
                                <span>{t('stat')}: {settings.company.stat}</span>
                                <span>{t('rc')}: {settings.company.rc}</span>
                                <span>{t('phone')}: {settings.company.phone}</span>
                                <span>{t('email')}: {settings.company.email}</span>
                                <span>{t('country')}: {countryName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-1 mb-2">
                        <h2 className="text-sm font-bold uppercase underline decoration-2">{data.title}</h2>
                    </div>
                </header>
                 <div className="grid grid-cols-4 gap-x-4 mb-2">
                    <InfoField label={`${t('exploitationSite')}:`}>{siteName}</InfoField>
                    <InfoField label={`${t('seaweedType')}:`}>{seaweedType}</InfoField>
                    <InfoField label={`${t('deliveryPeriod')}:`}>{periodName}</InfoField>
                    <InfoField label={`${t('paymentDate')}:`}>{paymentDate}</InfoField>
                </div>
                
                <div>
                    <table className="w-full border-collapse text-[8px] text-black leading-tight">
                        <thead className="font-bold bg-gray-100">
                            <tr>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>{t('serviceDate')}</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Provider</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Number of Lines</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Unit Price</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Amount to Pay</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Responsible Signature</th>
                                <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row: any, index: number) => (
                                <tr key={index}>
                                    <td className="px-1 py-0.5 text-center whitespace-nowrap align-middle" style={THIN_BORDER_STYLE}>{row.date}</td>
                                    <td className="px-1 py-0.5 truncate max-w-[150px] align-middle" style={THIN_BORDER_STYLE}>{row.beneficiaryName}</td>
                                    <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{row.totalLines}</td>
                                    <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>
                                        {row.averageUnitPrice !== null ? formatCurrency(row.averageUnitPrice, settings.localization) : t('various')}
                                    </td>
                                    <td className="px-1 py-0.5 text-right font-bold align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(row.netAmount, settings.localization)}</td>
                                    <td className="px-1 py-0.5 h-6 align-middle" style={THIN_BORDER_STYLE}></td>
                                    <td className="px-1 py-0.5 align-middle" style={THIN_BORDER_STYLE}></td>
                                </tr>
                            ))}
                        </tbody>
                        {isLastMainPage && (
                           <tfoot className="font-bold bg-gray-50">
                               <tr>
                                  <td colSpan={2} className="px-1 py-1 text-right uppercase align-middle" style={THIN_BORDER_STYLE}>{t('total')}</td>
                                  <td className="px-1 py-1 text-right align-middle" style={THIN_BORDER_STYLE}>{totalLines}</td>
                                  <td className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}></td>
                                  <td className="px-1 py-1 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(data.totalValue, settings.localization)}</td>
                                  <td colSpan={2} className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}></td>
                              </tr>
                           </tfoot>
                        )}
                    </table>
                     <div className="mt-2 mb-4 text-[9px]">
                         <span>({t('totalAmountInWords')}): <strong>{data.totalValueInWords}</strong></span>
                    </div>
                </div>

                <div className="flex-grow"></div>

                <div className="flex justify-around items-end pt-4 pb-2 text-center text-[10px]">
                    <div>
                        <p className="font-bold mb-8"><u>{t('theAccountant')}</u></p>
                    </div>
                    <div>
                        <p className="font-bold mb-8"><u>{t('theResponsible')}</u></p>
                    </div>
                </div>

                <footer className="w-full border-t border-black pt-1 mt-auto flex flex-col items-center text-center">
                    <p className="text-[7px] text-gray-600">{settings.company.name} - {settings.company.address}</p>
                    <p className="text-[7px] font-bold mt-0.5">Page {pageIndex + 1}/{totalPages}</p>
                </footer>
            </div>
        </PrintPage>
    );
};

const DenominationPage: FC<{
    beneficiaryRows: any[];
    pageIndex: number;
    totalPages: number;
    isLastPage: boolean;
    summaryData: any[];
    denominations: any[];
    data: SheetData;
    periodName: string;
}> = ({ beneficiaryRows, pageIndex, totalPages, isLastPage, summaryData, denominations, data, periodName }) => {
    const { settings } = useSettings();
    const { t } = useLocalization();

    const countryName = useMemo(() => COUNTRIES.find(c => c.code === settings.localization.country)?.name || settings.localization.country, [settings.localization.country]);
    const siteName = data.headerInfo.find(i => i.label === t('site'))?.value;
    const seaweedType = data.headerInfo.find(i => i.label === t('seaweedType'))?.value;
    const date = data.headerInfo.find(i => i.label === t('date'))?.value;

    return (
        <PrintPage landscape>
            <div className="h-full flex flex-col text-[9px] text-black bg-white font-sans">
                <header className="mb-2">
                     <div className="grid grid-cols-4 items-start">
                        <div className="col-span-1">
                            {settings.company.logoUrl && <img src={settings.company.logoUrl} alt="Company Logo" className="h-12 w-auto object-contain" />
                        </div>
                        <div className="col-span-2 text-center">
                            <h1 className="font-bold text-sm uppercase mb-0.5">{settings.company.name}</h1>
                            <div className="text-[8px] leading-none space-y-0 text-gray-700 flex flex-wrap justify-center gap-x-2">
                                <span>{t('capital')}: {formatCurrency(settings.company.capital, settings.localization)}</span>
                                <span>{t('address')}: {settings.company.address}</span>
                                <span>{t('nif')}: {settings.company.nif}</span>
                                <span>{t('stat')}: {settings.company.stat}</span>
                                <span>{t('rc')}: {settings.company.rc}</span>
                                <span>{t('phone')}: {settings.company.phone}</span>
                                <span>{t('email')}: {settings.company.email}</span>
                                <span>{t('country')}: {countryName}</span>
                            </div>
                        </div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="text-center mt-1 mb-2">
                        <h2 className="text-sm font-bold uppercase underline decoration-2">{t('denominationBreakdown')}</h2>
                    </div>
                </header>

                 <div className="grid grid-cols-3 gap-x-4 mb-2">
                    <InfoField label={`${t('exploitationSite')}:`}>{siteName}</InfoField>
                    <InfoField label={`${t('seaweedType')}:`}>{seaweedType}</InfoField>
                    <InfoField label={`${t('deliveryPeriod')}:`}>{periodName}</InfoField>
                    <InfoField label={`${t('dateLabel')} du paiement:`}>{date}</InfoField>
                </div>

                <h3 className="font-bold text-[10px] my-1">{t('breakdownByBeneficiary')}</h3>
                <table className="w-full border-collapse text-[8px] text-black leading-tight">
                    <thead className="font-bold bg-gray-100">
                        <tr>
                            <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Beneficiary</th>
                            <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Net Payable</th>
                            {denominations.map(d => (
                                <th key={d.id} className="p-1 font-normal whitespace-nowrap align-middle" style={{ fontSize: '8px', ...THIN_BORDER_STYLE }}>
                                    {formatCurrency(d.value, settings.localization)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {beneficiaryRows.map((row, index) => (
                            <tr key={index}>
                                <td className="px-1 py-0.5 truncate max-w-[120px] align-middle" style={THIN_BORDER_STYLE}>{row.beneficiaryName}</td>
                                <td className="px-1 py-0.5 text-right font-bold align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(row.netAmount, settings.localization)}</td>
                                {denominations.map(d => (
                                    <td key={d.id} className="px-1 py-0.5 text-center align-middle" style={THIN_BORDER_STYLE}>{row.breakdown[d.value] || ''}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {isLastPage && (
                    <>
                        <h3 className="font-bold text-[10px] my-1 mt-4">{t('summaryTable')}</h3>
                        <table className="w-1/3 border-collapse text-[8px] text-black leading-tight">
                             <thead className="font-bold bg-gray-100">
                                <tr>
                                    <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Denomination</th>
                                    <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Quantity</th>
                                    <th className="px-1 py-1 align-middle" style={THIN_BORDER_STYLE}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map(item => (
                                    <tr key={item.value}>
                                        <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(item.value, settings.localization)}</td>
                                        <td className="px-1 py-0.5 text-center align-middle" style={THIN_BORDER_STYLE}>{item.count}</td>
                                        <td className="px-1 py-0.5 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(item.total, settings.localization)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="font-bold bg-gray-50">
                                <tr>
                                    <td colSpan={2} className="px-1 py-1 text-right align-middle" style={THIN_BORDER_STYLE}>{t('total')}</td>
                                    <td className="px-1 py-1 text-right align-middle" style={THIN_BORDER_STYLE}>{formatCurrency(data.totalValue, settings.localization)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                )}

                <div className="flex-grow"></div>
                
                 <div className="flex justify-around items-end pt-4 pb-2 text-center text-[10px]">
                    <div>
                        <p className="font-bold mb-8"><u>{t('theAccountant')}</u></p>
                    </div>
                    <div>
                        <p className="font-bold mb-8"><u>{t('theResponsible')}</u></p>
                    </div>
                </div>

                <footer className="w-full border-t border-black pt-1 mt-4 flex flex-col items-center text-center">
                    <p className="text-[7px] text-gray-600">{settings.company.name} - {settings.company.address}</p>
                    <p className="text-[7px] font-bold mt-0.5">Page {pageIndex + 1}/{totalPages}</p>
                </footer>
            </div>
        </PrintPage>
    );
};


const PrintablePaymentSheet: React.FC<PrintablePaymentSheetProps> = ({ data, autoDownload }) => {
    const { t } = useLocalization();
    const { settings } = useSettings();
    const [isDownloading, setIsDownloading] = useState(false);
    const downloadStarted = useRef(false);

    const ROWS_PER_MAIN_PAGE = 30;
    const ROWS_PER_BREAKDOWN_PAGE = 25;

    const mainPageRenderer = useMemo(() => {
        switch(data.beneficiaryTypeLabel) {
            case t('farmer'): return FarmerDeliveryPage;
            case t('provider'): return ServiceProviderPage;
            default: return FarmerDeliveryPage; // Fallback for employee payroll, etc.
        }
    }, [data.beneficiaryTypeLabel, t]);

    const pagedMainRows = useMemo(() => {
        if (data.rows.length === 0) return [[]];
        const chunks: SheetRow[][] = [];
        for (let i = 0; i < data.rows.length; i += ROWS_PER_MAIN_PAGE) {
            chunks.push(data.rows.slice(i, i + ROWS_PER_MAIN_PAGE));
        }
        return chunks;
    }, [data.rows]);

    const totalMainPages = pagedMainRows.length;

    const denominations = useMemo(() => [...settings.localization.denominations].sort((a, b) => b.value - a.value), [settings.localization.denominations]);

    const breakdownByBeneficiary = useMemo(() => {
        return data.rows.map(row => {
            let remainingAmount = row.netAmount;
            const breakdown: Record<string, number> = {};
            denominations.forEach(denom => {
                const count = Math.floor(remainingAmount / denom.value);
                if (count > 0) {
                    breakdown[denom.value] = count;
                    remainingAmount -= count * denom.value;
                    remainingAmount = parseFloat(remainingAmount.toFixed(settings.localization.monetaryDecimals));
                }
            });
            return {
                beneficiaryName: row.beneficiaryName,
                netAmount: row.netAmount,
                breakdown,
            };
        });
    }, [data.rows, denominations, settings.localization.monetaryDecimals]);

    const summaryData = useMemo(() => {
        const summaryMap = new Map<number, { count: number; total: number }>();
        denominations.forEach(denom => summaryMap.set(denom.value, { count: 0, total: 0 }));

        breakdownByBeneficiary.forEach(beneficiary => {
            for (const [denomValue, count] of Object.entries(beneficiary.breakdown)) {
                const value = parseFloat(denomValue);
                const current = summaryMap.get(value);
                if (current) {
                    current.count += count as number;
                    current.total += (count as number) * value;
                }
            }
        });

        return Array.from(summaryMap.entries())
            .map(([value, data]) => ({ value, ...data }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.value - a.value);
    }, [breakdownByBeneficiary, denominations]);

    const pagedBreakdownRows = useMemo(() => {
        if (breakdownByBeneficiary.length === 0) return [[]];
        const chunks: any[][] = [];
        for (let i = 0; i < breakdownByBeneficiary.length; i += ROWS_PER_BREAKDOWN_PAGE) {
            chunks.push(breakdownByBeneficiary.slice(i, i + ROWS_PER_BREAKDOWN_PAGE));
        }
        return chunks;
    }, [breakdownByBeneficiary]);

    const totalBreakdownPages = pagedBreakdownRows.length;

    const handlePrint = () => { window.print(); };

    const handleDownloadPdf = useCallback(async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        document.body.classList.add('generating-pdf');
        try {
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;
            const printableArea = document.getElementById('printable-area');
            if (!printableArea) throw new Error('Printable area not found');

            const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4', compress: true });
            
            // Metadata
            pdf.setProperties({
                title: data.title,
                subject: 'Payment Sheet',
                author: settings.company.name,
                creator: 'AlgaManage'
            });

            const pages = printableArea.getElementsByClassName('print-page');

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i] as HTMLElement, { 
                    scale: 4, // Higher scale for crisp text
                    useCORS: true,
                    // Force landscape width to prevent mobile layout capture (desktop view)
                    windowWidth: 1920,
                    backgroundColor: '#ffffff' 
                });
                const imgData = canvas.toDataURL('image/png');
                
                if (i > 0) pdf.addPage();
                
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }
            
            pdf.save(`PaymentSheet-${data.title.replace(/ /g, '_')}-${data.periodName.replace(/ /g, '_')}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(t('pdfGenerationError'));
        } finally {
            document.body.classList.remove('generating-pdf');
            setIsDownloading(false);
        }
    }, [isDownloading, data.title, data.periodName, t, settings.company.name]);
    
    useEffect(() => {
        if (autoDownload && !downloadStarted.current) {
            downloadStarted.current = true;
            setTimeout(() => {
                handleDownloadPdf();
            }, 500);
        }
    }, [autoDownload, handleDownloadPdf]);
    
    const MainPageComponent = mainPageRenderer;

    return (
        <div>
            <div className="flex justify-end mb-4 no-print gap-2">
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    <Icon name={isDownloading ? 'Activity' : 'Download'} className={`w-5 h-5 ${isDownloading ? 'animate-spin' : ''}`} />
                    {isDownloading ? t('downloading') : t('downloadPdf')}
                </Button>
                <Button onClick={handlePrint}><Icon name="Printer" className="w-5 h-5" />{t('print')}</Button>
            </div>
            <div id="printable-area" className="text-black font-sans text-sm bg-gray-200 p-4 sm:p-8">
                 {pagedMainRows.map((pageRows, pageIndex) => (
                    <MainPageComponent
                        key={`main-page-${pageIndex}`}
                        rows={pageRows}
                        periodName={data.periodName}
                        pageIndex={pageIndex}
                        totalPages={totalMainPages + totalBreakdownPages}
                        data={data}
                        isLastMainPage={pageIndex === totalMainPages - 1}
                    />
                ))}
                {pagedBreakdownRows.map((pageRows, pageIndex) => (
                    <DenominationPage
                        key={`breakdown-page-${pageIndex}`}
                        beneficiaryRows={pageRows}
                        pageIndex={totalMainPages + pageIndex}
                        totalPages={totalMainPages + totalBreakdownPages}
                        isLastPage={pageIndex === totalBreakdownPages - 1}
                        summaryData={summaryData}
                        denominations={denominations}
                        data={data}
                        periodName={data.periodName}
                    />
                ))}
            </div>
        </div>
    );
};

export default PrintablePaymentSheet;
