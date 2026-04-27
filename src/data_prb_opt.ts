// Source: Parallogram_PRB_optimized
export const DATA_PRB_OPT_POINTS = [
  // Ax = -10 Sweep
  { ay: 0, ax: -10, ux: 0.0, uy: 0.0, phi: 0.0 },
  { ay: 0.5, ax: -10, ux: -0.0002276, uy: 0.0202431, phi: 0.0 },
  { ay: 1.0, ax: -10, ux: -0.0009092, uy: 0.0404454, phi: 0.0 },
  { ay: 2.0, ax: -10, ux: -0.0036133, uy: 0.0805668, phi: 0.0 },
  { ay: 5.0, ax: -10, ux: -0.0216131, uy: 0.1960524, phi: 0.0 },
  { ay: 10.0, ax: -10, ux: -0.0754157, uy: 0.3606394, phi: 0.0 },
  { ay: 20.0, ax: -10, ux: -0.2073812, uy: 0.5746992, phi: 0.0 },

  // Ax = 0 Sweep
  { ay: 5.0, ax: 0, ux: -0.0216131, uy: 0.1960524, phi: 0.0 },
  { ay: 10.0, ax: 0, ux: -0.0754157, uy: 0.3606394, phi: 0.0045026 }, // Some PRB variants include tiny theta
  { ay: 20.0, ax: 0, ux: -0.2142655, uy: 0.5678575, phi: 0.0141199 }
];
