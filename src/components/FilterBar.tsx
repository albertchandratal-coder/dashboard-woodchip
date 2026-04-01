import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Filter, RotateCcw, Printer, Plus, Calendar } from 'lucide-react';

export function FilterBar({ onAddData, year, setYear, month, setMonth, startDate, setStartDate, endDate, setEndDate, availableYears = [], availableMonths = [], onReset, recordCount = 0 }: any) {
  const handlePrintAll = async () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) {
      window.print();
    } else {
      const canvas = await html2canvas(document.body, { scale: 1 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('dashboard.pdf');
    }
  };

  return (
    <div className="bg-[#151C2C] border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-lg print-hide">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... (rest of the component) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" /> TAHUN:
          </label>
          <select 
            value={year} onChange={(e) => setYear(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-200 w-full"
          >
            <option>Semua Tahun</option>
            {availableYears.map((y: string) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" /> BULAN:
          </label>
          <select 
            value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-200 w-full"
          >
            <option>Semua Bulan</option>
            {availableMonths.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" /> DARI:
          </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-[#1e293b] border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-400" /> SAMPAI:
          </label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-[#1e293b] border border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-400 w-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-center print-hide">
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-bold tracking-wider transition-colors w-full">
          <Filter size={16} /> FILTER
        </button>
        <button onClick={onReset} className="flex items-center justify-center gap-2 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-md text-sm font-bold tracking-wider transition-colors w-full">
          <RotateCcw size={16} /> RESET
        </button>
        <button onClick={handlePrintAll} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md text-sm font-bold tracking-wider transition-colors w-full">
          <Printer size={16} /> CETAK SEMUA
        </button>
        <button onClick={onAddData} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md text-sm font-bold tracking-wider transition-colors w-full">
          <Plus size={16} /> TAMBAH DATA
        </button>
      </div>
      
      <div className="text-center mt-2 border-t border-slate-800 pt-3">
        <p className="text-xs text-blue-400 italic">Semua Data (Semua Tahun) — {recordCount} record</p>
      </div>
    </div>
  );
}
