import React, { useMemo } from 'react';
import { DeliveryData } from '../types';
import { formatNumber } from '../lib/utils';

export function SummaryCards({ data }: { data: DeliveryData[] }) {
  const stats = useMemo(() => {
    const totalNetto = data.reduce((sum, item) => sum + item.netto, 0);
    const totalTrip = data.length;
    const uniqueDays = new Set(data.map(item => item.tanggal)).size;
    const avgTrip = totalTrip > 0 ? totalNetto / totalTrip : 0;
    const activeDrivers = new Set(data.map(item => item.namaSupir));

    return {
      totalNetto,
      totalTrip,
      uniqueDays,
      avgTrip,
      activeDriversCount: activeDrivers.size,
      activeDriversList: Array.from(activeDrivers).join(', ')
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 print:grid-cols-2 gap-4">
      <div className="print:col-span-2">
        <Card 
          title="TOTAL NETTO" 
          value={`${formatNumber(stats.totalNetto)} Kg`} 
          sub={`↳ = ${(stats.totalNetto / 1000).toFixed(1)} Ton • ${(stats.totalNetto / 1000).toFixed(3)} Ribu Ton`} 
          color="blue"
        />
      </div>
      <Card 
        title="TOTAL TRIP" 
        value={`${formatNumber(stats.totalTrip)} Trip`} 
        sub={`↳ Rata-rata ${(stats.totalTrip / (stats.uniqueDays || 1)).toFixed(1)} trip per hari kerja`} 
        color="green"
      />
      <Card 
        title="HARI KERJA" 
        value={`${stats.uniqueDays} Hari`} 
        sub={`↳ Dari ${stats.uniqueDays} bulan aktif beroperasi`} 
        color="yellow"
      />
      <Card 
        title="AVG / TRIP" 
        value={`${formatNumber(Math.round(stats.avgTrip))} Kg`} 
        sub="↳ Rata-rata netto per pengiriman" 
        color="purple"
      />
      <Card 
        title="SUPIR AKTIF" 
        value={`${stats.activeDriversCount} Orang`} 
        sub={`↳ ${stats.activeDriversList}`} 
        color="pink"
      />
    </div>
  );
}

function Card({ title, value, sub, color }: { title: string, value: string, sub: string, color: 'blue' | 'green' | 'yellow' | 'purple' | 'pink' }) {
  const colorStyles = {
    blue: {
      border: 'border-y-blue-500',
      shadow: 'shadow-[0_-5px_15px_-5px_rgba(59,130,246,0.3),0_5px_15px_-5px_rgba(59,130,246,0.3)]',
      title: 'text-blue-400',
      value: 'text-blue-400',
      sub: 'text-blue-400/80'
    },
    green: {
      border: 'border-y-green-500',
      shadow: 'shadow-[0_-5px_15px_-5px_rgba(34,197,94,0.3),0_5px_15px_-5px_rgba(34,197,94,0.3)]',
      title: 'text-green-500',
      value: 'text-green-500',
      sub: 'text-green-500/80'
    },
    yellow: {
      border: 'border-y-yellow-500',
      shadow: 'shadow-[0_-5px_15px_-5px_rgba(234,179,8,0.3),0_5px_15px_-5px_rgba(234,179,8,0.3)]',
      title: 'text-yellow-500',
      value: 'text-yellow-500',
      sub: 'text-yellow-500/80'
    },
    purple: {
      border: 'border-y-purple-500',
      shadow: 'shadow-[0_-5px_15px_-5px_rgba(168,85,247,0.3),0_5px_15px_-5px_rgba(168,85,247,0.3)]',
      title: 'text-purple-400',
      value: 'text-purple-400',
      sub: 'text-purple-400/80'
    },
    pink: {
      border: 'border-y-pink-500',
      shadow: 'shadow-[0_-5px_15px_-5px_rgba(236,72,153,0.3),0_5px_15px_-5px_rgba(236,72,153,0.3)]',
      title: 'text-pink-400',
      value: 'text-pink-400',
      sub: 'text-pink-400/80'
    }
  };

  const style = colorStyles[color];

  return (
    <div className={`bg-[#151C2C] border-y-2 ${style.border} ${style.shadow} rounded-xl p-5 flex flex-col items-center justify-center text-center overflow-hidden print-summary-card`}>
      <h3 className={`text-sm font-bold tracking-widest mb-3 ${style.title} print-summary-title`}>{title}</h3>
      <div className={`text-3xl lg:text-4xl font-bold mb-3 tracking-tight ${style.value} print-summary-value`}>{value}</div>
      <p className={`text-sm font-medium line-clamp-2 ${style.sub} print-summary-sub`}>{sub}</p>
    </div>
  );
}
