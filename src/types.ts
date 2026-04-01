export interface DeliveryData {
  id: string;
  tanggal: string; // ISO date string YYYY-MM-DD
  namaSupir: string;
  platMobil: string;
  bruto: number;
  tara: number;
  netto: number;
  mesin: string;
  jumlahTeam: string;
  teamGiling: string;
  kontraktor: string;
}
