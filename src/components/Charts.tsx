import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DeliveryData } from '../types';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BlockCard } from './Tables';

const COLORS = [
  '#60a5fa', // Blue
  '#4ade80', // Green
  '#fbbf24', // Yellow/Orange
  '#c084fc', // Purple
  '#f87171', // Red
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#38bdf8', // Light Blue
  '#818cf8', // Indigo
  '#2dd4bf', // Teal
  '#fb7185', // Rose
];

export function Charts({ data }: { data: DeliveryData[] }) {
  const barData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      // Format as "MEI 2025"
      const date = parseISO(item.tanggal);
      const month = format(date, 'MMMM', { locale: id }).toUpperCase();
      const year = format(date, 'yyyy');
      const name = `${month} ${year}`;
      
      if (!acc[name]) acc[name] = { name, netto: 0, date };
      acc[name].netto += item.netto;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).sort((a, b) => a.date - b.date);
  }, [data]);

  const pieData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.namaSupir]) acc[item.namaSupir] = { name: item.namaSupir, value: 0 };
      acc[item.namaSupir].value += item.netto;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className="charts-container grid grid-cols-1 gap-6">
      <div className="w-full min-w-0">
        <BlockCard title="Netto Per Bulan" icon={<TrendingUp size={16} className="text-blue-400" />}>
          <div className="p-4 h-[400px] overflow-visible print-chart-container">
            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
              <BarChart 
                data={barData} 
                margin={{ top: 40, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#1e293b" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#f1f5f9" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={false}
                  height={10}
                />
                <YAxis 
                  stroke="#f1f5f9" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} 
                  width={50}
                />
                <Tooltip 
                  cursor={false}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: number) => [value.toLocaleString('id-ID'), 'Netto']}
                />
                <Bar 
                  dataKey="netto" 
                  radius={[4, 4, 0, 0]} 
                  barSize={60}
                >
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.netto < 500000 ? '#ef4444' : '#1e3a8a'} 
                      stroke={entry.netto < 500000 ? '#f87171' : '#3b82f6'}
                      strokeWidth={1}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BlockCard>
      </div>

      <div className="w-full min-w-0">
        <BlockCard title="Distribusi Supir" icon={<PieChartIcon size={16} className="text-orange-400" />}>
          <div className="p-4 h-[400px] flex flex-col overflow-hidden print-chart-container">
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000000', 
                      borderColor: '#1e293b', 
                      borderRadius: '4px',
                      color: '#ffffff',
                      fontSize: '12px',
                      padding: '4px 8px'
                    }}
                    itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    formatter={(value: number) => [value.toLocaleString('id-ID'), '']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ bottom: 32, fontSize: '13px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BlockCard>
      </div>
    </div>
  );
}
