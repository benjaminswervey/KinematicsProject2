import Papa from 'papaparse';

// Direct CSV imports using Vite's raw loader from project root
import rawFEA3D from '../PARALLOGRAM_FEA_3D_sweep_normalized.csv?raw';
import rawOptAsym from '../PARALLOGRAM_OPTIMIZED_ASYMMETRIC_sweep_normalized.csv?raw';
import rawPRB from '../PARALLOGRAM_PRB_OPTIMIZED_sweep_normalized.csv?raw';

interface RawRow {
  Ay: string;
  Ax: string;
  B: string;
  ux: string;
  uy: string;
  phi: string;
}

const parseCSV = (csv: string) => {
  const parsed = Papa.parse<any>(csv, { 
    header: true, 
    skipEmptyLines: true,
    dynamicTyping: true 
  });
  
  // Normalize header names to lowercase for the app's internal logic
  // and filter for B=0
  return (parsed.data as any[])
    .filter(row => row.B === 0 || Number(row.B) === 0)
    .map(row => ({
      ay: Number(row.Ay),
      ax: Number(row.Ax),
      ux: Number(row.ux),
      uy: Number(row.uy),
      phi: Number(row.phi)
    }));
};

export const DATA_FEA3D = parseCSV(rawFEA3D);
export const DATA_OPT_ASYM = parseCSV(rawOptAsym);
export const DATA_PRB_OPT = parseCSV(rawPRB);
