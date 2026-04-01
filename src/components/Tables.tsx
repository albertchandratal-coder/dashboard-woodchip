import React, { useState, useMemo, useRef } from 'react';
import { DeliveryData } from '../types';
import { formatNumber, cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Minus, Plus, Printer, FileText, User, Settings, Maximize2, Minimize2, TrendingUp, Users, Building, BarChart3, Trophy } from 'lucide-react';

export function Tables({ data, year, month }: { data: DeliveryData[], year: string, month: string }) {
  // Process data for tables
  const rekapBulanData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const date = parseISO(item.tanggal);
      const monthName = format(date, 'MMMM yyyy', { locale: id });
      const sortKey = format(date, 'yyyy-MM');
      
      if (!acc[sortKey]) acc[sortKey] = { name: monthName, sortKey, trip: 0, days: new Set(), netto: 0 };
      acc[sortKey].trip += 1;
      acc[sortKey].days.add(item.tanggal);
      acc[sortKey].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    
    return Object.values(grouped)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(m => ({
        ...m,
        daysCount: m.days.size,
        ton: m.netto / 1000,
        avg: m.netto / m.trip,
        percent: totalNetto ? (m.netto / totalNetto) * 100 : 0
      }));
  }, [data]);

  const supirData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.namaSupir]) acc[item.namaSupir] = { name: item.namaSupir, plat: item.platMobil, trip: 0, netto: 0 };
      acc[item.namaSupir].trip += 1;
      acc[item.namaSupir].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    return Object.values(grouped).map(s => ({ ...s, avg: s.netto / s.trip, percent: totalNetto ? (s.netto / totalNetto) * 100 : 0 })).sort((a, b) => b.netto - a.netto);
  }, [data]);

  const mesinData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.mesin]) acc[item.mesin] = { name: item.mesin, trip: 0, netto: 0 };
      acc[item.mesin].trip += 1;
      acc[item.mesin].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    return Object.values(grouped).map(m => ({ ...m, avg: m.netto / m.trip, percent: totalNetto ? (m.netto / totalNetto) * 100 : 0 })).sort((a, b) => b.netto - a.netto);
  }, [data]);

  const teamGilingData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!item.teamGiling) return acc; // Skip items with missing teamGiling
      
      const key = item.teamGiling;
      if (!acc[key]) acc[key] = { name: key, trip: 0, netto: 0 };
      acc[key].trip += 1;
      acc[key].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    return Object.values(grouped).map(t => ({ ...t, avg: t.netto / t.trip, percent: totalNetto ? (t.netto / totalNetto) * 100 : 0 })).sort((a, b) => b.netto - a.netto);
  }, [data]);

  const kontraktorData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.kontraktor]) acc[item.kontraktor] = { name: item.kontraktor, trip: 0, netto: 0 };
      acc[item.kontraktor].trip += 1;
      acc[item.kontraktor].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    return Object.values(grouped).map(k => ({ ...k, percent: totalNetto ? (k.netto / totalNetto) * 100 : 0 })).sort((a, b) => b.netto - a.netto);
  }, [data]);

  const supirBulanData = useMemo(() => {
    const supirs = Array.from(new Set(data.map(item => item.namaSupir)));
    
    // Generate chronological months from May 2025 to now
    const allMonths = [];
    let start = new Date(2025, 4, 1); // May 2025
    let end = new Date();
    while (start <= end) {
      allMonths.push(new Date(start));
      start.setMonth(start.getMonth() + 1);
    }
    
    const months = allMonths.map(d => format(d, "MMMM", { locale: id }).toUpperCase());
    
    const rows = supirs.map(supir => {
      const row: any = { name: supir, total: 0 };
      allMonths.forEach(d => {
        const monthName = format(d, "MMMM", { locale: id }).toUpperCase();
        const netto = data.filter(item => 
          item.namaSupir === supir && 
          format(parseISO(item.tanggal), "MMMM", { locale: id }).toUpperCase() === monthName &&
          format(parseISO(item.tanggal), "yyyy") === format(d, "yyyy")
        ).reduce((sum, item) => sum + item.netto, 0);
        row[monthName] = netto;
        row.total += netto;
      });
      return row;
    }).sort((a, b) => b.total - a.total);
    
    return { rows, months };
  }, [data]);

  const top10Days = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.tanggal]) acc[item.tanggal] = { tanggal: item.tanggal, trip: 0, netto: 0, supirs: new Set() };
      acc[item.tanggal].trip += 1;
      acc[item.tanggal].netto += item.netto;
      acc[item.tanggal].supirs.add(item.namaSupir);
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped)
      .sort((a, b) => b.netto - a.netto)
      .slice(0, 10)
      .map(d => ({
        ...d,
        ton: d.netto / 1000,
        mainSupir: Array.from(d.supirs).join(', ')
      }));
  }, [data]);

  const rekapBulanTotals = useMemo(() => {
    return rekapBulanData.reduce((acc, m) => ({
      trip: acc.trip + m.trip,
      daysCount: acc.daysCount + m.daysCount,
      netto: acc.netto + m.netto,
      ton: acc.ton + m.ton
    }), { trip: 0, daysCount: 0, netto: 0, ton: 0 });
  }, [rekapBulanData]);

  const supirTotals = useMemo(() => {
    return supirData.reduce((acc, s) => ({
      trip: acc.trip + s.trip,
      netto: acc.netto + s.netto
    }), { trip: 0, netto: 0 });
  }, [supirData]);

  const top10Totals = useMemo(() => {
    return top10Days.reduce((acc, d) => ({
      trip: acc.trip + d.trip,
      netto: acc.netto + d.netto,
      ton: acc.ton + d.ton
    }), { trip: 0, netto: 0, ton: 0 });
  }, [top10Days]);

  const mesinTotals = useMemo(() => {
    return mesinData.reduce((acc, m) => ({
      trip: acc.trip + m.trip,
      netto: acc.netto + m.netto
    }), { trip: 0, netto: 0 });
  }, [mesinData]);

  const teamGilingTotals = useMemo(() => {
    return teamGilingData.reduce((acc, t) => ({
      trip: acc.trip + t.trip,
      netto: acc.netto + t.netto
    }), { trip: 0, netto: 0 });
  }, [teamGilingData]);

  const kontraktorTotals = useMemo(() => {
    return kontraktorData.reduce((acc, k) => ({
      trip: acc.trip + k.trip,
      netto: acc.netto + k.netto
    }), { trip: 0, netto: 0 });
  }, [kontraktorData]);

  const supirBulanTotals = useMemo(() => {
    const totals: any = { name: 'TOTAL', total: 0 };
    supirBulanData.months.forEach(m => totals[m] = 0);
    
    supirBulanData.rows.forEach(row => {
      totals.total += row.total;
      supirBulanData.months.forEach(m => totals[m] += row[m]);
    });
    return totals;
  }, [supirBulanData]);

  const groupedByDate = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    const groups: Record<string, DeliveryData[]> = {};
    sorted.forEach(item => {
      if (!groups[item.tanggal]) groups[item.tanggal] = [];
      groups[item.tanggal].push(item);
    });
    return groups;
  }, [data]);

  const uniqueDays = Object.keys(groupedByDate).length;
  const recordCount = data.length;
  const detailSubtitle = `(${recordCount} record, ${uniqueDays} hari)`;

  const showDetail = year !== 'Semua Tahun' || month !== 'Semua Bulan';

  const detailRows: React.ReactNode[] = [];
  let globalIndex = 1;
  
  let grandTotalBruto = 0;
  let grandTotalTara = 0;
  let grandTotalNetto = 0;
  let grandTotalTrip = 0;

  Object.keys(groupedByDate).forEach((date) => {
    const items = groupedByDate[date];
    let dailyBruto = 0;
    let dailyTara = 0;
    let dailyNetto = 0;
    
    items.forEach((row) => {
      dailyBruto += row.bruto;
      dailyTara += row.tara;
      dailyNetto += row.netto;
      
      grandTotalBruto += row.bruto;
      grandTotalTara += row.tara;
      grandTotalNetto += row.netto;
      grandTotalTrip += 1;

      detailRows.push(
        <tr key={row.id} className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/50">
          <td className="py-2.5 px-2 text-slate-400 text-center">{globalIndex++}</td>
          <td className="py-2.5 px-2 text-slate-300 text-center">{format(parseISO(row.tanggal), 'dd/MM/yyyy')}</td>
          <td className="py-2.5 px-2 font-medium text-green-500 text-center">{row.namaSupir}</td>
          <td className="py-2.5 px-2 text-blue-400 text-center">{row.platMobil}</td>
          <td className="py-2.5 px-2 text-slate-300 text-center">{formatNumber(row.bruto)}</td>
          <td className="py-2.5 px-2 text-slate-300 text-center">{formatNumber(row.tara)}</td>
          <td className="py-2.5 px-2 font-bold text-blue-400 text-center">{formatNumber(row.netto)}</td>
          <td className="py-2.5 px-2 text-yellow-500 text-center">{row.mesin}</td>
          <td className="py-2.5 px-2 text-slate-300 text-center">{String(row.jumlahTeam || '').replace(' Orang', '')}</td>
          <td className="py-2.5 px-2 text-purple-400 text-center">{row.teamGiling}</td>
          <td className="py-2.5 px-2 text-slate-400 text-center">{row.kontraktor}</td>
        </tr>
      );
    });

    detailRows.push(
      <tr key={`subtotal-${date}`} className="bg-[#1e293b] print-subtotal">
        <td colSpan={4} className="py-3 px-4 font-bold text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 print-hide"></div>
            <span className="text-white print:text-black">SUBTOTAL</span> <span className="text-orange-400 print:text-black">{format(parseISO(date), 'dd/MM/yyyy')}</span> <span className="text-white print:text-black">({items.length} TRIP)</span>
          </div>
        </td>
        <td colSpan={2}></td>
        <td className="py-3 px-2 text-center font-bold text-orange-400 print:text-black">{formatNumber(dailyNetto)}</td>
        <td colSpan={4}></td>
      </tr>
    );
  });

  // Grand Total Row
  detailRows.push(
    <tr key="grand-total" className="bg-[#0f172a] border-t-2 border-slate-600 print-grandtotal">
      <td colSpan={2} className="py-4 px-4 font-bold text-blue-400 text-center tracking-wider text-[14px]">
        GRAND TOTAL
      </td>
      <td className="py-4 px-2 text-center font-bold text-white text-[14px]">{grandTotalTrip} trip</td>
      <td className="py-4 px-2 text-center font-bold text-white text-[14px]">{uniqueDays} hari</td>
      <td className="py-4 px-2 text-center font-bold text-white text-[14px]">{formatNumber(grandTotalBruto)}</td>
      <td className="py-4 px-2 text-center font-bold text-white text-[14px]">{formatNumber(grandTotalTara)}</td>
      <td className="py-4 px-2 text-center font-bold text-white text-[14px]">
        {formatNumber(grandTotalNetto)} <span className="text-green-400 ml-1">({(grandTotalNetto / 1000).toFixed(2)} Ton)</span>
      </td>
      <td colSpan={4}></td>
    </tr>
  );

  return (
    <div className="grid grid-cols-1 gap-6 print:gap-4">
        <BlockCard title="REKAP PER BULAN" icon={<TrendingUp size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">BULAN</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-center">HARI</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">TON</th>
                  <th className="py-3 px-4 font-semibold text-right">AVG/TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">PROGRESS (TARGET 1000 TON)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rekapBulanData.map((m, index) => (
                  <tr key={`${m.name}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300 capitalize">{m.name}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{m.trip}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{m.daysCount}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(m.netto)}</td>
                    <td className="py-3 px-4 text-right text-green-400">{m.ton.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatNumber(Math.round(m.avg))}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              (m.ton / 1000) * 100 < 50 ? 'bg-red-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${Math.min((m.ton / 1000) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] w-12 ${(m.ton / 1000) * 100 < 50 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          {(m.ton / 1000 * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{rekapBulanTotals.trip}</td>
                  <td className="py-3 px-4 text-center">{rekapBulanTotals.daysCount}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(rekapBulanTotals.netto)}</td>
                  <td className="py-3 px-4 text-right">{rekapBulanTotals.ton.toFixed(2)}</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
        <BlockCard title="REKAP PER SUPIR" icon={<User size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">NAMA SUPIR</th>
                  <th className="py-3 px-4 font-semibold">PLAT</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">AVG/TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {supirData.map((s) => (
                  <tr key={s.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300">{s.name}</td>
                    <td className="py-3 px-4 text-slate-500">{s.plat}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{s.trip}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(s.netto)}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatNumber(Math.round(s.avg))}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{s.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4" colSpan={2}>TOTAL</td>
                  <td className="py-3 px-4 text-center">{supirTotals.trip}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(supirTotals.netto)}</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>

        <BlockCard title="TOP 10 HARI TERBANYAK" icon={<Trophy size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TANGGAL</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">TON</th>
                  <th className="py-3 px-4 font-semibold">SUPIR TERLIBAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {top10Days.map((d) => (
                  <tr key={d.tanggal} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300">{format(parseISO(d.tanggal), 'dd/MM/yyyy')}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{d.trip}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(d.netto)}</td>
                    <td className="py-3 px-4 text-right text-green-400">{d.ton.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{d.mainSupir}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{top10Totals.trip}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(top10Totals.netto)}</td>
                  <td className="py-3 px-4 text-right">{top10Totals.ton.toFixed(2)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
        <BlockCard title="REKAP PER MESIN" icon={<Settings size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">MESIN</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mesinData.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300">{m.name}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{m.trip}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(m.netto)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{m.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{mesinTotals.trip}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(mesinTotals.netto)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>

        <BlockCard title="REKAP TEAM GILING" icon={<Users size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">TEAM</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teamGilingData.map((t) => (
                  <tr key={t.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300">{t.name}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{t.trip}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(t.netto)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{t.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{teamGilingTotals.trip}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(teamGilingTotals.netto)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>

        <BlockCard title="REKAP KONTRAKTOR" icon={<Building size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                <tr>
                  <th className="py-3 px-4 font-semibold">KONTRAKTOR</th>
                  <th className="py-3 px-4 font-semibold text-center">TRIP</th>
                  <th className="py-3 px-4 font-semibold text-right">NETTO (KG)</th>
                  <th className="py-3 px-4 font-semibold text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {kontraktorData.map((k) => (
                  <tr key={k.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300">{k.name}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{k.trip}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(k.netto)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{k.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
                <tr>
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-center">{kontraktorTotals.trip}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(kontraktorTotals.netto)}</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BlockCard>
      </div>

      <BlockCard title="REKAP SUPIR PER BULAN" icon={<BarChart3 size={14} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
              <tr>
                <th className="py-3 px-4 font-semibold">NAMA SUPIR</th>
                {supirBulanData.months.map((m, index) => (
                  <th key={`${m}-${index}`} className="py-3 px-4 font-semibold text-right">{m.toUpperCase()}</th>
                ))}
                <th className="py-3 px-4 font-semibold text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {supirBulanData.rows.map((row) => (
                <tr key={row.name} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-300">{row.name}</td>
                  {supirBulanData.months.map((m, index) => (
                    <td key={`${row.name}-${m}-${index}`} className="py-3 px-4 text-right text-slate-400">{formatNumber(row[m])}</td>
                  ))}
                  <td className="py-3 px-4 text-right font-bold text-blue-400">{formatNumber(row.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#0B1120] border-t-2 border-slate-700 font-bold hidden print:table-footer-group">
              <tr>
                <td className="py-3 px-4">TOTAL</td>
                {supirBulanData.months.map(m => <td key={m} className="py-3 px-4 text-right">{formatNumber(supirBulanTotals[m])}</td>)}
                <td className="py-3 px-4 text-right">{formatNumber(supirBulanTotals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </BlockCard>
      
      {showDetail && (
        <div className="print:col-span-1">
          <BlockCard title="DETAIL DATA" subtitle={`Tahun ${year} | ${month} ${detailSubtitle}`} icon={<FileText size={14} />}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                <thead className="text-slate-500 border-b border-slate-800 bg-[#0B1120]">
                  <tr>
                    <th className="py-3 px-2 font-semibold text-center">NO</th>
                    <th className="py-3 px-2 font-semibold text-center">TANGGAL</th>
                    <th className="py-3 px-2 font-semibold text-center">SUPIR</th>
                    <th className="py-3 px-2 font-semibold text-center">PLAT</th>
                    <th className="py-3 px-2 font-semibold text-center">BRUTO</th>
                    <th className="py-3 px-2 font-semibold text-center">TARA</th>
                    <th className="py-3 px-2 font-semibold text-center">NETTO</th>
                    <th className="py-3 px-2 font-semibold text-center">MESIN</th>
                    <th className="py-3 px-2 font-semibold text-center">TEAM</th>
                    <th className="py-3 px-2 font-semibold text-center">TEAM GILING</th>
                    <th className="py-3 px-2 font-semibold text-center">KONTRAKTOR</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.length > 0 ? detailRows : (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </BlockCard>
        </div>
      )}
    </div>
  );
}

export function BlockCard({ title, subtitle, icon, children }: { title: string, subtitle?: string, icon: React.ReactNode, children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (cardRef.current) {
      document.body.classList.add('printing-section');
      cardRef.current.classList.add('print-only-section');
      
      // Increased delay to ensure charts and styles are fully rendered
      setTimeout(() => {
        window.print();
        document.body.classList.remove('printing-section');
        if (cardRef.current) {
          cardRef.current.classList.remove('print-only-section');
        }
      }, 500);
    }
  };

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm print-hide" onClick={() => setIsFullscreen(false)}></div>
      )}
      <div 
        ref={cardRef}
        className={cn(
          "bg-[#151C2C] glow-card rounded-xl flex flex-col shadow-lg transition-all duration-300 print-card",
          isFullscreen ? "fixed inset-4 md:inset-10 z-50 overflow-hidden" : "h-full overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#151C2C] print-card-header">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors print-hide"
            >
              {isExpanded ? <Minus size={12} /> : <Plus size={12} />}
            </button>
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <span className="text-slate-400 print-hide">{icon}</span>
              {title} {subtitle && <span className="text-slate-500 font-normal tracking-normal normal-case print:text-black">— {subtitle}</span>}
            </h3>
          </div>
          <div className="flex items-center gap-2 print-hide">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-[10px] bg-[#1e293b] hover:bg-slate-700 text-slate-300 px-2 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 transition-colors font-medium"
              title={isFullscreen ? "Perkecil" : "Perbesar"}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
            <button 
              onClick={handlePrint}
              className="text-[10px] bg-[#1e293b] hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Printer size={12} /> Cetak
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
