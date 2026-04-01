import { DeliveryData } from '../types';

const APPSCRIPT_URL = (import.meta.env.VITE_APPSCRIPT_URL || '').trim();

if (APPSCRIPT_URL && APPSCRIPT_URL.includes('/edit')) {
  console.error('VITE_APPSCRIPT_URL seems to be an editor URL. It must be a deployment URL ending in /exec.');
}

/**
 * WOODCHIP API SERVICE
 * 
 * Handles fetching and saving data to Google Sheets via Apps Script.
 * If VITE_APPSCRIPT_URL is not set, it will return an empty array.
 */

export async function fetchData(): Promise<DeliveryData[]> {
  if (!APPSCRIPT_URL) {
    console.warn("VITE_APPSCRIPT_URL is not set. Please check your AI Studio Secrets (Settings > Secrets).");
    return [];
  }

  // Check for common URL mistakes
  if (APPSCRIPT_URL.includes('/edit')) {
    const errorMsg = 'URL SALAH: Anda memasukkan URL "Editor". Gunakan URL dari menu "Deploy > New Deployment" yang berakhiran /exec.';
    throw new Error(errorMsg);
  }
  
  if (APPSCRIPT_URL.includes('googleusercontent.com')) {
    const errorMsg = 'URL SALAH: Anda memasukkan URL "Redirect". Gunakan URL asli dari menu "Deploy" yang berakhiran /exec.';
    throw new Error(errorMsg);
  }
  
  try {
    // Use URL object to handle query parameters safely
    const url = new URL(APPSCRIPT_URL);
    url.searchParams.set('action', 'read');
    
    console.log('Fetching data from:', url.toString());
    
    // The most reliable way to fetch from GAS is a "simple request"
    // No custom headers, no special cache modes.
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if AppScript returned an error object
    if (data.status === 'error') {
      throw new Error(`AppScript Error: ${data.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching data from AppScript:', error);
    
    // If it's a TypeError: Failed to fetch, it's likely CORS or a wrong URL
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const msg = 'Gagal memuat data (Failed to fetch).\n\nSOLUSI PALING AMPUH:\n1. Gunakan jendela INCOGNITO (Private) - Seringkali error ini karena Anda login ke banyak akun Google.\n2. Pastikan URL di Secrets berakhiran /exec.\n3. Di Apps Script: Deploy > Manage Deployments > Pastikan "Who has access" adalah "Anyone".';
      throw new Error(msg);
    }
    
    // Re-throw to allow App.tsx to handle it with a toast
    throw error;
  }
}

export async function saveData(data: DeliveryData | DeliveryData[]): Promise<boolean> {
  if (!APPSCRIPT_URL) {
    console.warn("VITE_APPSCRIPT_URL is not set. Data will not be saved permanently.");
    return false;
  }
  
  try {
    const url = new URL(APPSCRIPT_URL);
    url.searchParams.set('action', 'write');
    
    // Apps Script doPost requires a specific fetch configuration
    await fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(data),
      mode: 'no-cors', // AppScript redirect often causes CORS issues, no-cors is a common workaround for simple writes
    });
    
    // With no-cors, we can't check response.ok, but the data is usually sent
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

export async function fetchMasterData() {
  if (!APPSCRIPT_URL) return { supir: [], mesin: [], kontraktor: [], teamGiling: [] };
  const url = new URL(APPSCRIPT_URL);
  url.searchParams.set('action', 'getMasterData');
  const response = await fetch(url.toString());
  return response.json();
}
