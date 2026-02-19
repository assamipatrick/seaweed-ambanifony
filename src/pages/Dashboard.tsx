
import React, { useMemo, useRef, useEffect, useState } from 'react';
// FIX: Import useNavigate to handle navigation from buttons.
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import Select from '../components/ui/Select';
import { useLocalization } from '../contexts/LocalizationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import { ModuleStatus, IncidentStatus } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import { dmsToDd, calculateSGR } from '../utils/converters';
import { formatNumber } from '../utils/formatters';
import Button from '../components/ui/Button';

declare const L: any; // Using Leaflet from a global script tag in index.html
declare const Chart: any;
declare const Recharts: any;


// Chart Components
const ProductionTrendChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { cultivationCycles } = useData();
    const { settings } = useSettings();
    const { t, language } = useLocalization();

    const chartData = useMemo(() => {
        const labels: string[] = [];
        const data: number[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(d.toLocaleDateString(language, { month: 'short', year: '2-digit'}));
            data.push(0);
        }

        cultivationCycles.forEach(cycle => {
            if (cycle.harvestDate && cycle.harvestedWeight) {
                const harvestDate = new Date(cycle.harvestDate);
                const diffMonths = (now.getFullYear() - harvestDate.getFullYear()) * 12 + (now.getMonth() - harvestDate.getMonth());
                if (diffMonths >= 0 && diffMonths < 6) {
                    const netWeight = (cycle.harvestedWeight || 0) - (cycle.cuttingsTakenAtHarvestKg || 0);
                    data[5 - diffMonths] += netWeight;
                }
            }
        });
        
        return { labels, data };
    }, [cultivationCycles, language]);

    useEffect(() => {
        if (!chartRef.current) return;
        const isDarkMode = settings.theme.className.includes('dark');
        const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx && (window as any).Chart) {
             chartInstance.current = new (window as any).Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: t('netHarvestedWeightKg'), // Updated label
                        data: chartData.data,
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        tension: 0.3,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    }
                }
            });
        }
    }, [chartData, settings.theme, t]);

    return <div className="w-full h-64"><canvas ref={chartRef}></canvas></div>;
};

const AverageSGRChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { cultivationCycles, seaweedTypes } = useData();
    const { settings } = useSettings();
    const { t } = useLocalization();

    const chartData = useMemo(() => {
        const data: Record<string, { sgrSum: number, count: number }> = {};
        
        cultivationCycles.forEach(c => {
            if (c.harvestDate && c.harvestedWeight && c.initialWeight && c.plantingDate) {
                const duration = (new Date(c.harvestDate).getTime() - new Date(c.plantingDate).getTime()) / (1000 * 60 * 60 * 24);
                // SGR uses GROSS weight (c.harvestedWeight)
                const sgr = calculateSGR(c.initialWeight, c.harvestedWeight, duration);
                
                if (sgr !== null) {
                    if (!data[c.seaweedTypeId]) {
                        data[c.seaweedTypeId] = { sgrSum: 0, count: 0 };
                    }
                    data[c.seaweedTypeId].sgrSum += sgr;
                    data[c.seaweedTypeId].count++;
                }
            }
        });

        const typeMap = new Map(seaweedTypes.map(st => [st.id, st.name]));
        return Object.entries(data).map(([typeId, { sgrSum, count }]) => ({
            label: typeMap.get(typeId) || t('unknown'),
            avgSGR: sgrSum / count,
        }));
    }, [cultivationCycles, seaweedTypes, t]);

    useEffect(() => {
        if (!chartRef.current) return;
        const isDarkMode = settings.theme.className.includes('dark');
        const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx && (window as any).Chart) {
             chartInstance.current = new (window as any).Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.map(d => d.label),
                    datasets: [{
                        label: t('growthRate') + ' (%)',
                        data: chartData.map(d => d.avgSGR),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            title: { display: true, text: '% / day', color: textColor },
                            ticks: { color: textColor }, 
                            grid: { color: gridColor } 
                        },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    }
                }
            });
        }
    }, [chartData, settings.theme, t]);

    return <div className="w-full h-64"><canvas ref={chartRef}></canvas></div>;
};

const PerformanceCorrelationChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { cultivationCycles, periodicTests, sites, modules } = useData();
    const { settings } = useSettings();
    const { t, language } = useLocalization();
    const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

    const chartData = useMemo(() => {
        // Generate last 6 months labels
        const labels: string[] = [];
        const now = new Date();
        const buckets: Record<string, { 
            sgrSum: number, sgrCount: number, 
            tempSum: number, tempCount: number,
            salinitySum: number, salinityCount: number,
            rainSum: number, rainCount: number
        }> = {};

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            labels.push(d.toLocaleDateString(language, { month: 'short', year: '2-digit'}));
            buckets[key] = { sgrSum: 0, sgrCount: 0, tempSum: 0, tempCount: 0, salinitySum: 0, salinityCount: 0, rainSum: 0, rainCount: 0 };
        }

        // Process Cycles for Growth Rate
        cultivationCycles.forEach(cycle => {
            if (cycle.harvestDate && cycle.harvestedWeight && cycle.initialWeight && cycle.plantingDate) {
                // Filter by site if selected
                if (selectedSiteId !== 'all') {
                    const module = modules.find(m => m.id === cycle.moduleId);
                    if (module?.siteId !== selectedSiteId) return;
                }

                const harvestDate = new Date(cycle.harvestDate);
                const key = `${harvestDate.getFullYear()}-${harvestDate.getMonth()}`;
                
                if (buckets[key]) {
                    const duration = (harvestDate.getTime() - new Date(cycle.plantingDate).getTime()) / (1000 * 60 * 60 * 24);
                    const sgr = calculateSGR(cycle.initialWeight, cycle.harvestedWeight, duration);
                    if (sgr !== null) {
                        buckets[key].sgrSum += sgr;
                        buckets[key].sgrCount++;
                    }
                }
            }
        });

        // Process Periodic Tests for Weather
        periodicTests.forEach(test => {
            if (test.date) {
                 if (selectedSiteId !== 'all' && test.siteId !== selectedSiteId) return;

                 const testDate = new Date(test.date);
                 const key = `${testDate.getFullYear()}-${testDate.getMonth()}`;

                 if (buckets[key]) {
                     if (test.temperature) {
                         buckets[key].tempSum += test.temperature;
                         buckets[key].tempCount++;
                     }
                     if (test.salinity) {
                         buckets[key].salinitySum += test.salinity;
                         buckets[key].salinityCount++;
                     }
                     if (test.precipitation) {
                         buckets[key].rainSum += test.precipitation;
                         buckets[key].rainCount++;
                     }
                 }
            }
        });

        const sgrData = Object.values(buckets).map(b => b.sgrCount > 0 ? (b.sgrSum / b.sgrCount) : null);
        const tempData = Object.values(buckets).map(b => b.tempCount > 0 ? (b.tempSum / b.tempCount) : null);
        const salinityData = Object.values(buckets).map(b => b.salinityCount > 0 ? (b.salinitySum / b.salinityCount) : null);
        
        return { labels, sgrData, tempData, salinityData };

    }, [cultivationCycles, periodicTests, modules, selectedSiteId, language]);

    useEffect(() => {
        if (!chartRef.current) return;
        const isDarkMode = settings.theme.className.includes('dark');
        const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx && (window as any).Chart) {
             chartInstance.current = new (window as any).Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [
                        {
                            label: t('growthRate') + ' (%)',
                            data: chartData.sgrData,
                            backgroundColor: 'rgba(16, 185, 129, 0.5)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 1,
                            yAxisID: 'y',
                            order: 2
                        },
                        {
                            label: t('temperature') + ' (°C)',
                            data: chartData.tempData,
                            borderColor: 'rgba(239, 68, 68, 1)',
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            type: 'line',
                            tension: 0.3,
                            yAxisID: 'y1',
                            order: 1
                        },
                        {
                            label: t('salinity') + ' (‰)',
                            data: chartData.salinityData,
                            borderColor: 'rgba(59, 130, 246, 1)',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            type: 'line',
                            borderDash: [5, 5],
                            tension: 0.3,
                            yAxisID: 'y1',
                            order: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'SGR (%)', color: textColor },
                            ticks: { color: textColor },
                            grid: { color: gridColor }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Temp / Salinity', color: textColor },
                            ticks: { color: textColor },
                            grid: { drawOnChartArea: false }
                        },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    },
                     plugins: { 
                        legend: { labels: { color: textColor } }
                    },
                }
            });
        }
    }, [chartData, settings.theme, t]);

    return (
        <div className="flex flex-col h-full">
            <div className="mb-2 w-48 self-end">
                <Select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} containerClassName="mb-0">
                    <option value="all">{t('allSites')}</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
            </div>
            <div className="flex-grow w-full h-64">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};


const SitePerformanceMap: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const { sites, modules, cultivationCycles } = useData();
    const { t } = useLocalization();

    const siteProduction = useMemo(() => {
        const productionMap = new Map<string, number>();
        cultivationCycles.forEach(cycle => {
            if (cycle.harvestedWeight) {
                const module = modules.find(m => m.id === cycle.moduleId);
                if (module) {
                    const netWeight = (cycle.harvestedWeight || 0) - (cycle.cuttingsTakenAtHarvestKg || 0);
                    productionMap.set(module.siteId, (productionMap.get(module.siteId) || 0) + netWeight);
                }
            }
        });
        return productionMap;
    }, [cultivationCycles, modules]);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                center: [-18.76, 46.86],
                zoom: 6,
                zoomControl: false,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;
        if (!map) return;

        // Invalidate size to ensure map renders correctly within the new dimensions
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // Clear old markers
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        const maxProduction = Math.max(...(Array.from(siteProduction.values()) as number[]), 1);

        sites.forEach(site => {
            if (site.location) {
                try {
                    const [latStr, lonStr] = site.location.split(',');
                    const lat = dmsToDd(latStr.trim());
                    const lon = dmsToDd(lonStr.trim());
                    const production = siteProduction.get(site.id) || 0;
                    const radius = 5 + (production / maxProduction) * 20;

                    L.circleMarker([lat, lon], {
                        radius,
                        fillColor: '#2563eb',
                        color: '#1d4ed8',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.6
                    }).addTo(map)
                    .bindPopup(`<b>${site.name}</b><br>${t('netProduction')}: ${production.toFixed(0)} kg`);
                } catch (e) {
                    console.error("Failed to parse site location", site.location);
                }
            }
        });

    }, [sites, siteProduction, t]);

    return <div ref={mapContainerRef} className="w-full h-full min-h-[600px] rounded-lg z-0" />;
};

const FarmerSegmentationChart: React.FC = () => {
    const { farmers, cultivationCycles, modules } = useData();
    const { t } = useLocalization();

    const farmerData = useMemo(() => {
        const dataByFarmer: Record<string, { yield: number, cycles: number }> = {};
        cultivationCycles.forEach(cycle => {
            if (cycle.harvestedWeight) {
                const module = modules.find(m => m.id === cycle.moduleId);
                if (module?.farmerId) {
                    if (!dataByFarmer[module.farmerId]) {
                        dataByFarmer[module.farmerId] = { yield: 0, cycles: 0 };
                    }
                    const netWeight = (cycle.harvestedWeight || 0) - (cycle.cuttingsTakenAtHarvestKg || 0);
                    dataByFarmer[module.farmerId].yield += netWeight;
                    dataByFarmer[module.farmerId].cycles++;
                }
            }
        });

        return Object.entries(dataByFarmer).map(([farmerId, data]) => {
            const farmer = farmers.find(f => f.id === farmerId);
            return {
                name: farmer ? `${farmer.firstName} ${farmer.lastName}` : t('unknown'),
                yield: data.yield,
                cycles: data.cycles,
            };
        });
    }, [farmers, cultivationCycles, modules, t]);

    if (farmerData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">{t('noDataForReport')}</div>;
    }

    const Recharts = (window as any).Recharts;
    if (!Recharts) {
        return <div className="flex items-center justify-center h-full text-gray-500">Loading chart library...</div>;
    }
    const { ResponsiveContainer, BubbleChart, XAxis, YAxis, ZAxis, Tooltip: RechartsTooltip, CartesianGrid, Legend, Bubble } = Recharts;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs z-50">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
                    <p className="text-gray-600 dark:text-gray-300">
                        {t('totalYield')}: <span className="font-semibold">{data.yield.toFixed(1)} kg</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        {t('numberOfCyclesAxis')}: <span className="font-semibold">{data.cycles}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BubbleChart data={farmerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="yield" name={t('totalYieldKgAxis')} type="number" />
                    <YAxis dataKey="cycles" name={t('numberOfCyclesAxis')} type="number" />
                    <ZAxis dataKey="yield" range={[10, 100]} name={t('totalYield')} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Bubble name={`${t('totalYield')} (${t('netWeight')})`} dataKey="yield" fill="#8884d8" />
                </BubbleChart>
            </ResponsiveContainer>
        </div>
    );
};

const SeaweedYieldChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { cultivationCycles, seaweedTypes } = useData();
    const { settings } = useSettings();
    const { t } = useLocalization();

    const chartData = useMemo(() => {
        const data: Record<string, { yield: number, count: number }> = {};
        cultivationCycles.forEach(c => {
            if (c.harvestedWeight) {
                if (!data[c.seaweedTypeId]) {
                    data[c.seaweedTypeId] = { yield: 0, count: 0 };
                }
                const netWeight = (c.harvestedWeight || 0) - (c.cuttingsTakenAtHarvestKg || 0);
                data[c.seaweedTypeId].yield += netWeight;
                data[c.seaweedTypeId].count++;
            }
        });
        const typeMap = new Map(seaweedTypes.map(st => [st.id, st.name]));
        return Object.entries(data).map(([typeId, { yield: totalYield, count }]) => ({
            label: typeMap.get(typeId) || t('unknown'),
            avgYield: totalYield / count,
        }));
    }, [cultivationCycles, seaweedTypes, t]);

     useEffect(() => {
        if (!chartRef.current) return;
        const isDarkMode = settings.theme.className.includes('dark');
        const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx && (window as any).Chart) {
             chartInstance.current = new (window as any).Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.map(d => d.label),
                    datasets: [{
                        label: t('averageYieldKg'),
                        data: chartData.map(d => d.avgYield),
                        backgroundColor: 'rgba(139, 92, 246, 0.6)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { ticks: { color: textColor }, grid: { color: gridColor } },
                        x: { ticks: { color: textColor }, grid: { color: gridColor } }
                    }
                }
            });
        }
    }, [chartData, settings.theme, t]);

    return <div className="w-full h-64"><canvas ref={chartRef}></canvas></div>;
};

const RecentIncidentsList: React.FC = () => {
    const { t } = useLocalization();
    const { incidents, incidentTypes } = useData();
    const navigate = useNavigate();

    const recentIncidents = useMemo(() => 
        [...incidents].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [incidents]);
  
    const incidentTypeMap = useMemo(() => new Map(incidentTypes.map(it => [it.id, it.name])), [incidentTypes]);

    return (
        <div className="space-y-3 h-full overflow-y-auto">
            {recentIncidents.map(incident => (
                <div key={incident.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50 cursor-pointer" onClick={() => navigate('/monitoring/incidents')}>
                    <Icon name="AlertTriangle" className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{incidentTypeMap.get(incident.type) || incident.type}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{incident.date}</p>
                    </div>
                    <StatusBadge status={incident.status} />
                </div>
            ))}
            {recentIncidents.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{t('noIncidents')}</p>
                </div>
            )}
        </div>
    );
};

const WeatherWidget: React.FC = () => {
    const { t } = useLocalization();
    const { sites } = useData();
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Weather Code to Icon & Description Mapping (WMO Code)
    const getWeatherInfo = (code: number) => {
        if (code === 0) return { icon: 'Sun', desc: 'Clear sky' };
        if (code === 1) return { icon: 'Sun', desc: 'Mainly clear' };
        if (code === 2) return { icon: 'Cloud', desc: 'Partly cloudy' };
        if (code === 3) return { icon: 'Cloud', desc: 'Overcast' };
        if (code >= 45 && code <= 48) return { icon: 'Cloud', desc: 'Fog' };
        if (code >= 51 && code <= 67) return { icon: 'CloudRain', desc: 'Drizzle/Rain' };
        if (code >= 71 && code <= 77) return { icon: 'CloudRain', desc: 'Snow' }; // Unlikely for seaweed farms but standard WMO
        if (code >= 80 && code <= 82) return { icon: 'CloudRain', desc: 'Rain showers' };
        if (code >= 95) return { icon: 'AlertTriangle', desc: 'Thunderstorm' };
        return { icon: 'Sun', desc: 'Unknown' }; // Fallback
    };

    useEffect(() => {
        const fetchWeather = async () => {
            // Find a site with valid coordinates to use as the reference location
            const site = sites.find(s => s.location && s.location.includes(','));
            if (!site) return; // No valid site to check weather for

            try {
                setLoading(true);
                const [latStr, lonStr] = site.location.split(',');
                // Convert DMS to DD if necessary, or parse DD directly
                let lat: number, lon: number;
                try {
                     lat = dmsToDd(latStr.trim());
                     lon = dmsToDd(lonStr.trim());
                } catch (e) {
                    console.warn("Invalid coordinate format for weather", site.location);
                    return;
                }

                // Fetch current weather
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=kmh`);
                const data = await response.json();
                
                if (data.current) {
                    setWeather(data.current);
                }
            } catch (err) {
                console.error("Weather fetch failed", err);
                setError("Failed to load weather");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [sites]); // Re-run if sites change

    if (loading) {
         return (
            <div className="flex justify-center items-center h-full text-gray-500">
                <Icon name="Activity" className="w-6 h-6 animate-spin mr-2" />
                {t('loading')}...
            </div>
        );
    }

    if (!weather) {
        // Fallback or empty state if no sites or error
        return (
             <div className="flex justify-center items-center h-full text-gray-500 italic">
                {error || "No location data available"}
            </div>
        );
    }

    const { icon, desc } = getWeatherInfo(weather.weather_code);

    return (
        <div className="flex justify-between items-center h-full px-4">
            <div className="flex items-center">
                <Icon name={icon} className="w-12 h-12 text-yellow-500 dark:text-yellow-400 mr-4" />
                <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{weather.temperature_2m}°C</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
            </div>
             <div className="text-right space-y-1">
                <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-300">
                    <Icon name="Wind" className="w-4 h-4 mr-1" />
                    {weather.wind_speed_10m} km/h
                </div>
                <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-300">
                     <Icon name="Droplet" className="w-4 h-4 mr-1" />
                     {weather.relative_humidity_2m}%
                </div>
            </div>
        </div>
    )
}

const TopFarmersWidget: React.FC = () => {
    const { t } = useLocalization();
    const { settings } = useSettings();
    const { cultivationCycles, modules, farmers } = useData();
    const navigate = useNavigate();

    const topFarmers = useMemo(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const stats: Record<string, { weight: number; active: number; siteId: string }> = {};

        // 1. Calculate harvested weights in last 6 months
        cultivationCycles.forEach(c => {
            const module = modules.find(m => m.id === c.moduleId);
            if (module && module.farmerId) {
                if (!stats[module.farmerId]) {
                    // Try to get siteId from farmer object first, fallback to module
                    const farmer = farmers.find(f => f.id === module.farmerId);
                    stats[module.farmerId] = { weight: 0, active: 0, siteId: farmer?.siteId || module.siteId };
                }

                if (c.harvestDate && new Date(c.harvestDate) > sixMonthsAgo) {
                    const netWeight = (c.harvestedWeight || 0) - (c.cuttingsTakenAtHarvestKg || 0);
                    stats[module.farmerId].weight += netWeight;
                }
                
                if (c.status === 'PLANTED' || c.status === 'GROWING') {
                    stats[module.farmerId].active += 1;
                }
            }
        });

        // 2. Sort and get top 5
        const sorted = Object.entries(stats)
            .sort(([, a], [, b]) => b.weight - a.weight)
            .slice(0, 5);

        // 3. Map to display data
        return sorted.map(([id, data]) => {
            const farmer = farmers.find(f => f.id === id);
            // Re-lookup site name to be sure
            const siteName = farmer ? (useData().sites.find(s => s.id === farmer.siteId)?.name) : 'Unknown';
            
            return {
                id,
                name: farmer ? `${farmer.firstName} ${farmer.lastName}` : t('unknown'),
                siteName: siteName || t('unknown'),
                weight: data.weight,
                activeCycles: data.active
            };
        });
    }, [cultivationCycles, modules, farmers, t]);

    return (
        <div className="h-full flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b dark:border-gray-700 text-gray-500">
                            <th className="py-2 pl-2">#</th>
                            <th className="py-2">{t('farmer')}</th>
                            <th className="py-2">{t('site')}</th>
                            <th className="py-2 text-center">{t('activeCycles')}</th>
                            <th className="py-2 text-right">{t('totalYield')} (6m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topFarmers.map((farmer, index) => (
                            <tr key={farmer.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="py-3 pl-2 text-gray-400 font-mono">{index + 1}</td>
                                <td className="py-3 font-semibold text-gray-900 dark:text-white">{farmer.name}</td>
                                <td className="py-3 text-gray-600 dark:text-gray-300">{farmer.siteName}</td>
                                <td className="py-3 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-bold">
                                        {farmer.activeCycles}
                                    </span>
                                </td>
                                <td className="py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                                    {formatNumber(farmer.weight, settings.localization)} kg
                                </td>
                            </tr>
                        ))}
                        {topFarmers.length === 0 && (
                             <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                                    {t('noDataForReport')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             <div className="mt-auto pt-4 text-right">
                <Button variant="ghost" onClick={() => navigate('/farmers')} className="text-xs">
                    {t('viewDetails')} <Icon name="ChevronRight" className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    );
};

const SiteStatisticsWidget: React.FC = () => {
    const { sites, cultivationCycles, modules, incidents, seaweedTypes } = useData();
    const { t, settings } = useLocalization();
    const [selectedSiteId, setSelectedSiteId] = useState<string>(sites.length > 0 ? sites[0].id : '');

    // Recalculate stats when site or data changes
    const stats = useMemo(() => {
        if (!selectedSiteId) return null;

        const now = new Date();
        // 30 days ago
        const lastMonth = new Date();
        lastMonth.setDate(now.getDate() - 30);
        
        // 90 days ago for SGR
        const sgrWindow = new Date();
        sgrWindow.setDate(now.getDate() - 90);

        // Filter modules for this site
        const siteModuleIds = new Set(modules.filter(m => m.siteId === selectedSiteId).map(m => m.id));

        // KPI 1: Total Harvested Weight (Last 30 Days)
        const recentHarvests = cultivationCycles.filter(c => 
            siteModuleIds.has(c.moduleId) &&
            c.harvestDate && 
            new Date(c.harvestDate) >= lastMonth
        );
        const totalHarvestWeight = recentHarvests.reduce((sum, c) => sum + ((c.harvestedWeight || 0) - (c.cuttingsTakenAtHarvestKg || 0)), 0);

        // KPI 2: Active Incidents
        const activeIncidents = incidents.filter(i => 
            i.siteId === selectedSiteId &&
            (i.status === 'OPEN' || i.status === 'IN_PROGRESS')
        ).length;

        // KPI 3: Avg SGR (Last 90 days for significance)
        const cyclesForSGR = cultivationCycles.filter(c => 
            siteModuleIds.has(c.moduleId) &&
            c.harvestDate &&
            new Date(c.harvestDate) >= sgrWindow &&
            c.initialWeight > 0 && c.harvestedWeight && c.harvestedWeight > 0 && c.plantingDate
        );

        let totalSGR = 0;
        let sgrCount = 0;

        cyclesForSGR.forEach(c => {
             const duration = (new Date(c.harvestDate!).getTime() - new Date(c.plantingDate).getTime()) / (1000 * 3600 * 24);
             if (duration > 0) {
                 // Using Gross weight for biological growth rate usually
                 const sgr = calculateSGR(c.initialWeight, c.harvestedWeight!, duration);
                 if (sgr !== null) {
                     totalSGR += sgr;
                     sgrCount++;
                 }
             }
        });
        const avgSGR = sgrCount > 0 ? totalSGR / sgrCount : 0;

        return { totalHarvestWeight, activeIncidents, avgSGR };
    }, [selectedSiteId, sites, cultivationCycles, modules, incidents]);

    return (
        <div className="flex flex-col h-full">
             <div className="mb-4">
                <Select 
                    value={selectedSiteId} 
                    onChange={(e) => setSelectedSiteId(e.target.value)} 
                    containerClassName="mb-0"
                >
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
            </div>
            
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">{t('harvestLast30Days')}</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(stats.totalHarvestWeight, settings.localization)} kg</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 text-center">
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wider mb-1">{t('avgSGR')}</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.avgSGR.toFixed(2)}%</p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 text-center">
                        <p className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider mb-1">{t('activeIncidents')}</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.activeIncidents}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    {t('noDataForReport')}
                </div>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
  const { t } = useLocalization();
  // FIX: Initialize navigate
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'director' | 'field'>('director');
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{t('analyticalDashboard')}</h1>
          <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'director' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setViewMode('director')}
              >
                  Director
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'field' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setViewMode('field')}
              >
                  Field
              </button>
          </div>
      </div>
      
      {viewMode === 'director' ? (
          <div className="flex-grow grid grid-cols-12 gap-6 animate-fade-in">
            {/* Site Stats Widget - New Component */}
            <Card className="col-span-12" title={t('siteStatistics')}>
                <SiteStatisticsWidget />
            </Card>

            <Card className="col-span-12 lg:col-span-8" title={t('performanceCorrelation')}>
                <PerformanceCorrelationChart />
            </Card>

            <Card className="col-span-12 md:col-span-6 lg:col-span-4" title={t('productionTrend')}>
                <ProductionTrendChart />
            </Card>
            
            <Card className="col-span-12 md:col-span-6 lg:col-span-4" title={t('growthRate')}>
                <AverageSGRChart />
            </Card>
            
             <Card className="col-span-12 md:col-span-6 lg:col-span-4" title={t('yieldBySeaweedType')}>
                <SeaweedYieldChart />
            </Card>

             <Card className="col-span-12 md:col-span-6 lg:col-span-4" title={t('farmerSegmentation')}>
                <FarmerSegmentationChart />
            </Card>
            
            {/* Top Farmers Widget */}
            <Card className="col-span-12 lg:col-span-6" title={t('topFarmersTitle')}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 -mt-2">{t('topFarmersSubtitle')}</p>
                <TopFarmersWidget />
            </Card>

            <Card className="col-span-12 lg:col-span-6" title={t('sitePerformance')}>
                <SitePerformanceMap />
            </Card>
          </div>
      ) : (
          <div className="flex-grow grid grid-cols-12 gap-6 animate-fade-in">
             <Card className="col-span-12 lg:col-span-8 row-span-2 p-0 overflow-hidden" title={t('farmMapTitle')}>
                 {/* Reusing SitePerformanceMap but logically it could be a more interactive one */}
                 <SitePerformanceMap />
             </Card>
             
             <Card className="col-span-12 lg:col-span-4 h-48" title="Current Weather">
                 <WeatherWidget />
             </Card>

             <Card className="col-span-12 lg:col-span-4 flex-grow flex flex-col" title={t('recentIncidents')}>
                <RecentIncidentsList />
             </Card>
             
             <Card className="col-span-12" title="Quick Actions">
                 <div className="flex gap-4">
                    {/* FIX: Navigate to incident reporting page on click */}
                    <Button 
                        className="flex-1 py-8 flex-col gap-2" 
                        onClick={() => navigate('/monitoring/incidents')}
                    >
                        <Icon name="PlusCircle" className="w-8 h-8" />
                        {t('reportIncident')}
                    </Button>
                    {/* FIX: Navigate to harvest processing page on click */}
                    <Button 
                        className="flex-1 py-8 flex-col gap-2" 
                        variant="secondary"
                        onClick={() => navigate('/harvesting')}
                    >
                         <Icon name="Scissors" className="w-8 h-8" />
                         {t('harvest')}
                    </Button>
                 </div>
             </Card>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
