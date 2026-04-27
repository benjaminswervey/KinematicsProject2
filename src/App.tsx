/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
} from 'recharts';
import { RotateCcw, BarChart2 } from 'lucide-react';
import { cn } from './lib/utils';
import { ModelData, SimulationParams } from './types';
import { DATA_FEA3D, DATA_OPT_ASYM, DATA_PRB_OPT } from './data';

// Helper function to find nearest neighbor in data
const getInterpolatedValue = (data: any[], ay: number, ax: number) => {
  if (data.length === 0) return { ux: 0, uy: 0, phi: 0 };
  
  // Find record with exact or minimum distance in parameter space
  let best = data[0];
  let minDistance = Infinity;
  
  for (const row of data) {
    const d = Math.sqrt(
      Math.pow(row.ay - ay, 2) + 
      Math.pow(row.ax - ax, 2)
    );
    if (d < minDistance) {
      minDistance = d;
      best = row;
    }
    if (d === 0) break; // Perfect match
  }
  return best;
};

const INITIAL_MODELS: ModelData[] = [
  { model: 'FEA_3D', ux: 0, uy: 0, phi: 0, color: '#000000', visible: true, lineWidth: 3 },
  { model: 'Opt-As', ux: 0, uy: 0, phi: 0, color: '#2563EB', visible: true, dash: '7 3 2 3' },
  { model: 'PRB-X', ux: 0, uy: 0, phi: 0, color: '#EA580C', visible: true },
];

export default function App() {
  // Derive unique values from the comprehensive datasets for slider snapping
  const { availableAy, availableAx } = useMemo(() => {
    const all = [...DATA_FEA3D, ...DATA_OPT_ASYM, ...DATA_PRB_OPT];
    const ays = Array.from(new Set(all.map(d => d.ay))).sort((a, b) => a - b);
    const axs = Array.from(new Set(all.map(d => d.ax))).sort((a, b) => a - b);
    return { availableAy: ays, availableAx: axs };
  }, []);

  const [params, setParams] = useState<Omit<SimulationParams, 'w'>>({
    ay: 5.0,
    ax: 0.0,
  });

  const [models, setModels] = useState<ModelData[]>(INITIAL_MODELS);

  const toggleModel = (index: number) => {
    const newModels = [...models];
    newModels[index].visible = !newModels[index].visible;
    setModels(newModels);
  };

  const calculatedModels = useMemo(() => {
    const updated = models.map(m => {
      let res;
      if (m.model === 'FEA_3D') res = getInterpolatedValue(DATA_FEA3D, params.ay, params.ax);
      else if (m.model === 'Opt-As') res = getInterpolatedValue(DATA_OPT_ASYM, params.ay, params.ax);
      else res = getInterpolatedValue(DATA_PRB_OPT, params.ay, params.ax);
      
      // Scale phi from radians to degrees for the display table
      const phiDeg = res.phi * (180 / Math.PI);
      return { ...m, ux: res.ux, uy: res.uy, phi: phiDeg };
    });

    const fea3d = updated.find(m => m.model === 'FEA_3D')!;
    return updated.map(m => {
      if (m.model === 'FEA_3D') return m;
      return {
        ...m,
        exPercent: Math.abs(fea3d.ux) > 1e-6 ? ((m.ux - fea3d.ux) / Math.abs(fea3d.ux)) * 100 : 0,
        eyPercent: Math.abs(fea3d.uy) > 1e-6 ? ((m.uy - fea3d.uy) / Math.abs(fea3d.uy)) * 100 : 0,
        ephiPercent: Math.abs(fea3d.phi) > 1e-6 ? ((m.phi - fea3d.phi) / Math.abs(fea3d.phi)) * 100 : -100
      };
    });
  }, [params, models]);

  // Generate deformed shape lines for each model
  // Shape approximation: y(x) = w + (3uy-phi)x^2 + (-2uy+phi)x^3
  // Convert phi back to radians for plotting match
  const w = 0.3; // Normalized spacing
  const graphData = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => {
      const x = i / 20;
      const point: any = { x };
      calculatedModels.forEach(m => {
        if (!m.visible) return;
        const phiRad = m.phi * (Math.PI / 180);
        // Top beam
        const yt = w + (3 * m.uy - phiRad) * Math.pow(x, 2) + (-2 * m.uy + phiRad) * Math.pow(x, 3);
        // Bottom beam 
        const yb = -w + (3 * m.uy - phiRad) * Math.pow(x, 2) + (-2 * m.uy + phiRad) * Math.pow(x, 3);
        
        point[`${m.model}_top`] = yt;
        point[`${m.model}_bot`] = yb;
      });
      return point;
    });
  }, [calculatedModels]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: The Plot */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="border border-zinc-200 p-4 rounded bg-white shadow-sm h-[600px] relative">
            <h2 className="text-center font-medium text-lg mb-4 uppercase tracking-tighter">Normalized Deformed Shape Comparison</h2>
            <div className="w-full h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    domain={[0, 1.2]} 
                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]}
                    stroke="#71717a"
                    fontSize={12}
                  />
                  <YAxis 
                    type="number" 
                    domain={[-0.75, 1.25]} 
                    ticks={[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1.0, 1.25]}
                    stroke="#71717a"
                    fontSize={12}
                  />
                  {calculatedModels.map(m => m.visible && (
                    <React.Fragment key={m.model}>
                      <Line
                        dataKey={`${m.model}_top`}
                        stroke={m.color}
                        strokeWidth={m.lineWidth || 2}
                        strokeDasharray={m.dash}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        dataKey={`${m.model}_bot`}
                        stroke={m.color}
                        strokeWidth={m.lineWidth || 2}
                        strokeDasharray={m.dash}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </React.Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: Controls & Data */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-zinc-50 p-4 border border-zinc-200 rounded text-[11px] font-mono leading-relaxed shadow-inner">
            <h3 className="font-bold border-b border-zinc-200 mb-2 uppercase tracking-wider">Legend & Data Notes</h3>
            <ul className="space-y-0.5 opacity-80 mb-4">
              <li>- Focus: FEA 3D against Optimized architectures</li>
              <li>- Values limited to discrete CSV simulation sweep points</li>
              <li>- Coordinates normalized by beam length L</li>
            </ul>

            <div className="grid grid-cols-1 gap-1">
              {models.map((m, idx) => (
                <label key={m.model} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-100 p-1 rounded transition-colors group">
                  <input 
                    type="checkbox" 
                    checked={m.visible} 
                    onChange={() => toggleModel(idx)}
                    className="w-4 h-4 accent-zinc-800"
                  />
                  <div className="w-4 h-0.5" style={{ backgroundColor: m.color }}></div>
                  <span className="group-hover:translate-x-1 transition-transform">{m.model}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200 overflow-hidden rounded shadow-md bg-white">
            <div className="bg-zinc-800 text-white p-2 text-[10px] font-bold border-b border-zinc-700 flex justify-between uppercase">
              <span>Flexure Comparison Result</span>
              <span className="text-zinc-400">Ref: FEA 3D Sweep</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px]">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200">
                    <th className="p-2 border-r border-zinc-200">Model</th>
                    <th className="p-2 border-r border-zinc-200">ux</th>
                    <th className="p-2 border-r border-zinc-200">uy</th>
                    <th className="p-2 border-r border-zinc-200">phi(deg)</th>
                    <th className="p-2 border-r border-zinc-200">ex%</th>
                    <th className="p-2 border-r border-zinc-200">ey%</th>
                    <th className="p-2">ephi%</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedModels.map((m) => (
                    <tr key={m.model} className="border-b border-zinc-100 hover:bg-zinc-50 group">
                      <td className="p-2 border-r border-zinc-200 font-bold bg-zinc-50/50">
                        {m.model}
                      </td>
                      <td className={cn("p-2 border-r border-zinc-200", m.ux < 0 ? "text-red-700" : "text-blue-700")}>{m.ux.toFixed(6)}</td>
                      <td className="p-2 border-r border-zinc-200 text-blue-700">+{m.uy.toFixed(6)}</td>
                      <td className="p-2 border-r border-zinc-200 text-blue-700">+{m.phi.toFixed(6)}</td>
                      <td className="p-2 border-r border-zinc-200 text-zinc-500 bg-zinc-50/30">
                        {m.exPercent !== undefined ? `${m.exPercent > 0 ? '+' : ''}${m.exPercent.toFixed(2)}` : '---'}
                      </td>
                      <td className="p-2 border-r border-zinc-200 text-zinc-500 bg-zinc-50/30">
                        {m.eyPercent !== undefined ? `${m.eyPercent > 0 ? '+' : ''}${m.eyPercent.toFixed(2)}` : '---'}
                      </td>
                      <td className="p-2 text-zinc-500 bg-zinc-50/30">
                        {m.ephiPercent !== undefined ? `${m.ephiPercent > 0 ? '+' : ''}${m.ephiPercent.toFixed(2)}` : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6 bg-zinc-50 p-6 border border-zinc-200 rounded shadow-sm">
            {[
              { label: 'Ay', key: 'ay', color: 'bg-zinc-900', values: availableAy },
              { label: 'Ax', key: 'ax', color: 'bg-cyan-500', values: availableAx }
            ].map((s) => {
              const currentValue = (params as any)[s.key];
              const currentIndex = s.values.indexOf(currentValue);
              
              return (
                <div key={s.label} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 flex flex-col">
                    <span className="text-xs font-black uppercase text-zinc-700">{s.label}</span>
                  </div>
                  <div className="col-span-7 h-5 bg-zinc-200 rounded-full relative overflow-hidden ring-1 ring-zinc-300">
                    <div 
                      className={cn("absolute inset-y-0 left-0 transition-all", s.color)}
                      style={{ width: `${s.values.length > 1 ? (currentIndex / (s.values.length - 1)) * 100 : 0}%` }}
                    />
                    <input 
                      type="range" 
                      min={0} 
                      max={s.values.length > 1 ? s.values.length - 1 : 0} 
                      step={1}
                      value={currentIndex >= 0 ? currentIndex : 0}
                      onChange={(e) => {
                        const val = s.values[parseInt(e.target.value)];
                        setParams({ ...params, [s.key]: val });
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="bg-white p-1 flex justify-between px-2 text-xs font-mono rounded border border-zinc-300 shadow-sm">
                      <span className="font-bold">{currentValue.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setParams({ ay: 5, ax: 0 })}
            className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 py-3 rounded text-[11px] font-bold border border-zinc-200 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={14} /> RESET PARAMETERS
          </button>
          
          <p className="text-[9px] text-zinc-400 font-mono text-center uppercase tracking-widest">Snaps to existing CSV scan points</p>
        </div>
      </div>
    </div>
  );
}
