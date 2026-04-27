import Papa from 'papaparse';

// Direct CSV imports using Vite's raw loader
import rawFEA3D from './Parallogram_FEA_3D.csv?raw';
import rawOptAsym from './Parallogram_optimized.csv?raw';
import rawPRB from './Parallogram_PRB_optimized.csv?raw';

interface RawRow {
  Ay: string;
  Ax: string;
  B: string;
  ux: string;
  uy: string;
  phi: string;
}

const parseCSV = (csv: string) => {
  const parsed = Papa.parse<RawRow>(csv, { 
    header: true, 
    skipEmptyLines: true,
    dynamicTyping: true 
  });
  
  // Normalize header names to lowercase for the app's internal logic
  return parsed.data.map(row => ({
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
