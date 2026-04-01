import React, { useState, useMemo, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { SummaryCards } from './components/SummaryCards';

import { Tables } from './components/Tables';
import { DataEntryModal } from './components/DataEntryModal';
import { DeliveryData } from './types';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { fetchData, saveData } from './services/api';

import { Toaster, toast } from 'sonner';

import { MESIN_OPTIONS, TEAM_GILING_OPTIONS, KONTRAKTOR_OPTIONS, SUPIR_PLAT_MAPPING } from './constants';

export default function App() {
  const [data, setData] = useState<DeliveryData[]>([]);
  const [sessionHistory, setSessionHistory] = useState<DeliveryData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Master Data
  const [supirPlat, setSupirPlat] = useState(SUPIR_PLAT_MAPPING);
  const [mesinOptions, setMesinOptions] = useState(MESIN_OPTIONS);
  const [teamGilingOptions, setTeamGilingOptions] = useState(TEAM_GILING_OPTIONS);
  const [kontraktorOptions, setKontraktorOptions] = useState(KONTRAKTOR_OPTIONS);

  // Fetch data from AppScript on load
  useEffect(() => {
    const loadData = async () => {
      if (!import.meta.env.VITE_APPSCRIPT_URL) {
        setIsLoading(false);
        setData([]);
        toast.info('VITE_APPSCRIPT_URL belum disetel.', {
          description: 'Buka menu Settings > Secrets untuk menyetel URL AppScript.',
          duration: 10000,
        });
        return;
      }

      setIsLoading(true);
      try {
        const remoteData = await fetchData();
        if (remoteData && remoteData.length > 0) {
          setData(remoteData);
          toast.success('Data berhasil dimuat dari Google Sheet!');
        } else {
          setData([]);
          if (import.meta.env.VITE_APPSCRIPT_URL) {
            toast.info('Google Sheet kosong.');
          }
        }
      } catch (error: any) {
        console.error('Failed to load data:', error);
        setData([]);
        const errorMessage = error.message || 'Gagal memuat data dari Google Sheet.';
        toast.error(errorMessage, {
          duration: 10000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filters state
  const [year, setYear] = useState('Semua Tahun');
  const [month, setMonth] = useState('Semua Bulan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dynamic filter options based on available data
  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    
    data.forEach(item => {
      const date = parseISO(item.tanggal);
      if (isValid(date)) {
        years.add(date.getFullYear().toString());
        months.add(format(date, 'MMMM', { locale: id }));
      }
    });

    // Sort years descending, months in calendar order
    const sortedYears = Array.from(years).sort((a, b) => Number(b) - Number(a));
    const monthOrder = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const sortedMonths = monthOrder;

    return { availableYears: sortedYears, availableMonths: sortedMonths };
  }, [data]);

  // Filter logic...
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const date = parseISO(item.tanggal);
      if (!isValid(date)) {
        console.log('DEBUG: Invalid date:', item.tanggal);
        return false;
      }
      
      const itemYear = date.getFullYear().toString();
      const itemMonth = format(date, 'MMMM', { locale: id });
      
      const yearMatch = year === 'Semua Tahun' || itemYear === year;
      const monthMatch = month === 'Semua Bulan' || itemMonth === month;
      
      // Date range match
      const startMatch = !startDate || item.tanggal >= startDate;
      const endMatch = !endDate || item.tanggal <= endDate;
      
      const match = yearMatch && monthMatch && startMatch && endMatch;
      if (!match) {
        // console.log('DEBUG: Item filtered out:', item.tanggal, itemYear, itemMonth, year, month);
      }
      return match;
    });
  }, [data, year, month, startDate, endDate]);

  const handleReset = () => {
    setYear('Semua Tahun');
    setMonth('Semua Bulan');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-4 md:p-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Screen Header */}
        <header className="text-center py-5 border border-slate-800 bg-[#151C2C] rounded-xl shadow-lg print-hide">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400 tracking-wider">
            WOODCHIP MONITORING PERIODE 2025 - 2026 - 2027 PT.TABL - PT.TIPB
          </h1>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Data | Update: {new Date().toLocaleString('id-ID')}
          </p>
        </header>

        {/* Print Header */}
        <div className="hidden print:block print-header-container">
          <div className="print-header-top">
            <h1 className="text-xl font-bold">DASHBOARD LAPORAN PENGIRIMAN WOODCHIP — TAHUN {year === 'Semua Tahun' ? '2025-2027' : year} | BULAN {month === 'Semua Bulan' ? 'SEMUA' : month.toUpperCase()}</h1>
            <p className="text-sm mt-1">Dicetak: {new Date().toLocaleString('id-ID')}</p>
          </div>
          <div className="print-header-bottom">
            <h2 className="text-lg font-bold">WOODCHIP MONITORING TAHUN {year === 'Semua Tahun' ? '2025-2027' : year} PT.TABL - PT.TIPB</h2>
            <p className="text-xs mt-1">• Live Data • Updated: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>

        <FilterBar 
          onAddData={() => setIsModalOpen(true)} 
          year={year} setYear={setYear}
          month={month} setMonth={setMonth}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          availableYears={availableYears}
          availableMonths={availableMonths}
          onReset={handleReset}
          recordCount={filteredData.length}
        />

        <SummaryCards data={filteredData} />
        
        <Tables data={filteredData} year={year} month={month} />
      </div>

      {isModalOpen && (
        <DataEntryModal 
          onClose={() => setIsModalOpen(false)} 
          data={data}
          sessionHistory={sessionHistory}
          setSessionHistory={setSessionHistory}
          onClearHistory={() => setSessionHistory([])}
          supirPlat={supirPlat} setSupirPlat={setSupirPlat}
          mesinOptions={mesinOptions} setMesinOptions={setMesinOptions}
          teamGilingOptions={teamGilingOptions} setTeamGilingOptions={setTeamGilingOptions}
          kontraktorOptions={kontraktorOptions} setKontraktorOptions={setKontraktorOptions}
          onSave={async (newData) => {
            // Optimistic update
            const updatedData = Array.isArray(newData) ? [...data, ...newData] : [...data, newData];
            setData(updatedData);
            
            // Add to session history
            const newHistory = Array.isArray(newData) ? newData : [newData];
            setSessionHistory(prev => [...newHistory, ...prev]);
            
            // Save to AppScript
            const success = await saveData(newData);
            if (success) {
              // toast.success is already handled in DataEntryModal for single/batch
            } else {
              toast.error('Gagal menyimpan data ke Google Sheet.');
            }
            
            setIsModalOpen(false);
          }} 
        />
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-[#151C2C] p-8 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 font-bold tracking-widest animate-pulse">MEMUAT DATA...</p>
          </div>
        </div>
      )}
    </div>
  );
}
