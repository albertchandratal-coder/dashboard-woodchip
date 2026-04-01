import React, { useState, useMemo } from 'react';
import { DeliveryData } from '../types';
import { X, Save, RotateCcw, Zap, Plus, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber } from '../lib/utils';

export function DataEntryModal({ 
  onClose, 
  onSave, 
  onClearHistory,
  data, 
  sessionHistory,
  setSessionHistory,
  supirPlat, setSupirPlat,
  mesinOptions, setMesinOptions,
  teamGilingOptions, setTeamGilingOptions,
  kontraktorOptions, setKontraktorOptions
}: { 
  onClose: () => void, 
  onSave: (data: DeliveryData | DeliveryData[]) => void, 
  onClearHistory: () => void,
  data: DeliveryData[],
  sessionHistory: DeliveryData[],
  setSessionHistory: React.Dispatch<React.SetStateAction<DeliveryData[]>>,
  supirPlat: Record<string, string>, setSupirPlat: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  mesinOptions: string[], setMesinOptions: React.Dispatch<React.SetStateAction<string[]>>,
  teamGilingOptions: string[], setTeamGilingOptions: React.Dispatch<React.SetStateAction<string[]>>,
  kontraktorOptions: string[], setKontraktorOptions: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [activeTab, setActiveTab] = useState('tunggal');
  
  // Single Entry State
  const [formData, setFormData] = useState<Partial<DeliveryData>>({
    tanggal: new Date().toISOString().split('T')[0],
    namaSupir: '',
    platMobil: '',
    bruto: 0,
    tara: 0,
    mesin: '',
    jumlahTeam: '',
    teamGiling: '',
    kontraktor: ''
  });

  // Batch Entry State
  const [batchData, setBatchData] = useState<Partial<DeliveryData>[]>([
    { id: '1', tanggal: new Date().toISOString().split('T')[0], namaSupir: '', platMobil: '', bruto: 0, tara: 0, mesin: '', jumlahTeam: '', teamGiling: '', kontraktor: '' }
  ]);

  const netto = (formData.bruto || 0) - (formData.tara || 0);

  const addSupir = () => {
    const nama = prompt('Masukkan Nama Supir Baru:');
    const plat = prompt('Masukkan Plat Mobil:');
    if (nama && plat) {
      setSupirPlat(prev => ({ ...prev, [nama]: plat }));
    }
  };

  const deleteSupir = (nama: string) => {
    if (confirm(`Hapus supir ${nama}?`)) {
      setSupirPlat(prev => {
        const next = { ...prev };
        delete next[nama];
        return next;
      });
    }
  };

  const addMesin = () => {
    const mesin = prompt('Masukkan Nama Mesin Baru:');
    if (mesin) setMesinOptions(prev => [...prev, mesin]);
  };

  const deleteMesin = (mesin: string) => {
    if (confirm(`Hapus mesin ${mesin}?`)) {
      setMesinOptions(prev => prev.filter(m => m !== mesin));
    }
  };

  const addTeamGiling = () => {
    const team = prompt('Masukkan Nama Team Giling Baru:');
    if (team) setTeamGilingOptions(prev => [...prev, team]);
  };

  const deleteTeamGiling = (team: string) => {
    if (confirm(`Hapus team giling ${team}?`)) {
      setTeamGilingOptions(prev => prev.filter(t => t !== team));
    }
  };

  const addKontraktor = () => {
    const kontraktor = prompt('Masukkan Nama Kontraktor Baru:');
    if (kontraktor) setKontraktorOptions(prev => [...prev, kontraktor]);
  };

  const deleteKontraktor = (kontraktor: string) => {
    if (confirm(`Hapus kontraktor ${kontraktor}?`)) {
      setKontraktorOptions(prev => prev.filter(k => k !== kontraktor));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'tunggal') {
      const newRecord: DeliveryData = {
        id: Date.now().toString(),
        tanggal: formData.tanggal!,
        namaSupir: formData.namaSupir!,
        platMobil: formData.platMobil!,
        bruto: Number(formData.bruto),
        tara: Number(formData.tara),
        netto: (Number(formData.bruto) || 0) - (Number(formData.tara) || 0),
        mesin: formData.mesin!,
        jumlahTeam: String(formData.jumlahTeam || '').includes('Orang') ? String(formData.jumlahTeam) : `${formData.jumlahTeam} Orang`,
        teamGiling: formData.teamGiling!,
        kontraktor: formData.kontraktor!
      };
      onSave(newRecord);
      toast.success('Data pengiriman berhasil disimpan!');
    } else if (activeTab === 'batch') {
      const validBatch = batchData.filter(item => item.namaSupir && item.bruto && item.tara);
      if (validBatch.length === 0) {
        toast.error('Mohon isi minimal satu data yang lengkap!');
        return;
      }
      const newRecords: DeliveryData[] = validBatch.map((item, idx) => ({
        id: (Date.now() + idx).toString(),
        tanggal: item.tanggal!,
        namaSupir: item.namaSupir!,
        platMobil: item.platMobil!,
        bruto: Number(item.bruto),
        tara: Number(item.tara),
        netto: (Number(item.bruto) || 0) - (Number(item.tara) || 0),
        mesin: item.mesin!,
        jumlahTeam: String(item.jumlahTeam || '').includes('Orang') ? String(item.jumlahTeam) : `${item.jumlahTeam} Orang`,
        teamGiling: item.teamGiling!,
        kontraktor: item.kontraktor!
      }));
      onSave(newRecords);
      toast.success(`${newRecords.length} data pengiriman berhasil disimpan!`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: any = value;
    if (name === 'bruto' || name === 'tara') {
      updatedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: updatedValue };
      if (name === 'namaSupir') {
        newData.platMobil = supirPlat[value as string] || '';
      }
      return newData;
    });
  };

  const handleBatchChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: any = value;
    if (name === 'bruto' || name === 'tara') {
      updatedValue = value === '' ? 0 : Number(value);
    }

    const newBatch = [...batchData];
    newBatch[index] = { ...newBatch[index], [name]: updatedValue };
    
    if (name === 'namaSupir') {
      newBatch[index].platMobil = supirPlat[value as string] || '';
    }
    
    setBatchData(newBatch);
  };

  const addBatchRow = () => {
    setBatchData([...batchData, { 
      id: Date.now().toString(), 
      tanggal: new Date().toISOString().split('T')[0], 
      namaSupir: '', 
      platMobil: '', 
      bruto: 0, 
      tara: 0, 
      mesin: '', 
      jumlahTeam: '', 
      teamGiling: '', 
      kontraktor: '' 
    }]);
  };

  const removeBatchRow = (index: number) => {
    if (batchData.length > 1) {
      setBatchData(batchData.filter((_, i) => i !== index));
    }
  };

  const handleReset = () => {
    if (activeTab === 'tunggal') {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        namaSupir: '',
        platMobil: '',
        bruto: 0,
        tara: 0,
        mesin: '',
        jumlahTeam: '',
        teamGiling: '',
        kontraktor: ''
      });
    } else if (activeTab === 'batch') {
      setBatchData([{ id: Date.now().toString(), tanggal: new Date().toISOString().split('T')[0], namaSupir: '', platMobil: '', bruto: 0, tara: 0, mesin: '', jumlahTeam: '', teamGiling: '', kontraktor: '' }]);
    } else if (activeTab === 'riwayat') {
      if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat data?')) {
        onClearHistory();
        toast.success('Riwayat data berhasil dihapus.');
      }
    }
  };

  const recentHistory = useMemo(() => {
    return [...sessionHistory].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10);
  }, [sessionHistory]);

  return (
    <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#151C2C] border border-slate-700 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl my-auto max-h-[90vh]">
        
        <div className="text-center py-6 border-b border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-blue-400 tracking-wide flex items-center justify-center gap-2">
            <Zap className="text-yellow-400" size={20} fill="currentColor" /> 
            Input Data Pengiriman 
            <Zap className="text-yellow-400" size={20} fill="currentColor" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">Data otomatis masuk ke sheet bulan yang sesuai</p>
        </div>

        <div className="flex border-b border-slate-800 shrink-0">
          <button 
            className={`flex-1 py-3 text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'tunggal' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setActiveTab('tunggal')}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div> INPUT TUNGGAL
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'batch' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setActiveTab('batch')}
          >
            <div className="w-3 h-3 bg-slate-500 rounded-sm"></div> INPUT BATCH
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'riwayat' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setActiveTab('riwayat')}
          >
            <div className="w-3 h-3 bg-slate-500 rounded-sm"></div> RIWAYAT
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'tunggal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Tanggal <span className="text-red-500">*</span></label>
                <input type="date" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Nama Supir <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select name="namaSupir" required value={formData.namaSupir} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors">
                    <option value="">-- Pilih Supir --</option>
                    {Object.keys(supirPlat).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addSupir} className="bg-slate-800 text-slate-300 px-3 rounded-md hover:bg-slate-700">+</button>
                  {formData.namaSupir && <button type="button" onClick={() => deleteSupir(formData.namaSupir!)} className="bg-red-900/30 text-red-400 px-3 rounded-md hover:bg-red-900/50">x</button>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Plat Mobil (Otomatis)</label>
                <input type="text" readOnly value={formData.platMobil} className="w-full bg-[#0B1120]/50 border border-slate-800 rounded-md px-3 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed" placeholder="Pilih Supir dulu" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Mesin <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select name="mesin" required value={formData.mesin} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors">
                    <option value="">-- Pilih Mesin --</option>
                    {mesinOptions.map(mesin => (
                      <option key={mesin} value={mesin}>{mesin}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addMesin} className="bg-slate-800 text-slate-300 px-3 rounded-md hover:bg-slate-700">+</button>
                  {formData.mesin && <button type="button" onClick={() => deleteMesin(formData.mesin!)} className="bg-red-900/30 text-red-400 px-3 rounded-md hover:bg-red-900/50">x</button>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Bruto (Kg) <span className="text-red-500">*</span></label>
                <input type="number" name="bruto" required value={formData.bruto || ''} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors" placeholder="Contoh: 9500" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Tara (Kg) <span className="text-red-500">*</span></label>
                <input type="number" name="tara" required value={formData.tara || ''} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors" placeholder="Contoh: 4150" />
              </div>

              <div className="md:col-span-2">
                <div className="border border-green-500/30 bg-green-500/5 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1 uppercase">Netto (Hasil Perhitungan)</p>
                  <p className="text-3xl font-bold text-green-400">{netto > 0 ? netto : 0} Kg</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Jumlah Team (Orang) <span className="text-red-500">*</span></label>
                <input type="number" name="jumlahTeam" required value={formData.jumlahTeam || ''} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors" placeholder="Contoh: 3" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Team Giling <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select name="teamGiling" required value={formData.teamGiling} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors">
                    <option value="">-- Pilih Team --</option>
                    {teamGilingOptions.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addTeamGiling} className="bg-slate-800 text-slate-300 px-3 rounded-md hover:bg-slate-700">+</button>
                  {formData.teamGiling && <button type="button" onClick={() => deleteTeamGiling(formData.teamGiling!)} className="bg-red-900/30 text-red-400 px-3 rounded-md hover:bg-red-900/50">x</button>}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Kontraktor <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select name="kontraktor" required value={formData.kontraktor} onChange={handleChange} className="w-full bg-[#0B1120] border border-slate-700 rounded-md px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors">
                    <option value="">-- Pilih Kontraktor --</option>
                    {kontraktorOptions.map(kontraktor => (
                      <option key={kontraktor} value={kontraktor}>{kontraktor}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addKontraktor} className="bg-slate-800 text-slate-300 px-3 rounded-md hover:bg-slate-700">+</button>
                  {formData.kontraktor && <button type="button" onClick={() => deleteKontraktor(formData.kontraktor!)} className="bg-red-900/30 text-red-400 px-3 rounded-md hover:bg-red-900/50">x</button>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-700 rounded-lg shadow-inner bg-[#0B1120]">
                <table className="w-full text-xs text-left min-w-[1000px]">
                  <thead className="bg-[#1E293B] text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="p-4 font-semibold">TANGGAL</th>
                      <th className="p-4 font-semibold">SUPIR</th>
                      <th className="p-4 font-semibold">BRUTO</th>
                      <th className="p-4 font-semibold">TARA</th>
                      <th className="p-4 font-semibold">NETTO</th>
                      <th className="p-4 font-semibold">MESIN</th>
                      <th className="p-4 font-semibold">TIM</th>
                      <th className="p-4 font-semibold">GILING</th>
                      <th className="p-4 font-semibold">KONTRAKTOR</th>
                      <th className="p-4 font-semibold text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {batchData.map((row, index) => (
                      <tr key={index} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="p-3">
                          <input type="date" name="tanggal" value={row.tanggal} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500" />
                        </td>
                        <td className="p-3">
                          <select name="namaSupir" value={row.namaSupir} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500">
                            <option value="">Supir</option>
                            {Object.keys(supirPlat).map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input type="number" name="bruto" value={row.bruto || ''} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500" placeholder="Bruto" />
                        </td>
                        <td className="p-3">
                          <input type="number" name="tara" value={row.tara || ''} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500" placeholder="Tara" />
                        </td>
                        <td className="p-3 font-bold text-green-400">
                          {(row.bruto || 0) - (row.tara || 0)}
                        </td>
                        <td className="p-3">
                          <select name="mesin" value={row.mesin} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500">
                            <option value="">Mesin</option>
                            {mesinOptions.map(mesin => (
                              <option key={mesin} value={mesin}>{mesin}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input type="number" name="jumlahTeam" value={row.jumlahTeam || ''} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500" placeholder="Tim" />
                        </td>
                        <td className="p-3">
                          <select name="teamGiling" value={row.teamGiling} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500">
                            <option value="">Giling</option>
                            {teamGilingOptions.map(team => (
                              <option key={team} value={team}>{team}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <select name="kontraktor" value={row.kontraktor} onChange={(e) => handleBatchChange(index, e)} className="w-full bg-[#151C2C] border border-slate-700 rounded px-2 py-1.5 text-slate-300 outline-none focus:border-blue-500">
                            <option value="">Kontr.</option>
                            {kontraktorOptions.map(kontraktor => (
                              <option key={kontraktor} value={kontraktor}>{kontraktor}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => removeBatchRow(index)} className="text-red-500 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addBatchRow} className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-blue-400 hover:border-blue-400 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                <Plus size={16} /> TAMBAH BARIS DATA
              </button>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <History size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider">10 Data Terakhir</h3>
              </div>
              <div className="space-y-2">
                {recentHistory.map((item) => (
                  <div key={item.id} className="bg-[#0B1120] border border-slate-800 rounded-lg p-3 flex items-center justify-between hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Tgl</p>
                        <p className="text-xs text-slate-300">{item.tanggal.split('-').reverse().slice(0, 2).join('/')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-400">{item.namaSupir}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{item.platMobil}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-400">{formatNumber(item.netto)} Kg</p>
                      <p className="text-[10px] text-slate-500 uppercase">{item.mesin} | {item.teamGiling}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-6 flex flex-wrap gap-3 border-t border-slate-800 mt-6 shrink-0">
            <button type="button" onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 bg-transparent hover:bg-slate-800 text-slate-400 px-4 py-3 rounded-md text-xs font-bold tracking-wider transition-colors">
              <RotateCcw size={14} /> RESET
            </button>
            {activeTab !== 'riwayat' && (
              <button type="submit" className="flex-[2] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-xs font-bold tracking-wider transition-colors shadow-lg shadow-green-900/20">
                <Save size={14} /> SIMPAN DATA {activeTab === 'batch' ? 'BATCH' : ''}
              </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-red-400 px-4 py-3 rounded-md text-xs font-bold tracking-wider transition-colors">
              <X size={14} /> KEMBALI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
