import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Play, CheckCircle, ChevronDown, Download, AlertTriangle } from 'lucide-react';

const mockTimeSeriesData = [
  { time: '12:00', flood: 65, landslide: 10, cyclone: 5 },
  { time: '16:00', flood: 68, landslide: 12, cyclone: 5 },
  { time: '20:00', flood: 72, landslide: 15, cyclone: 5 },
  { time: '00:00', flood: 78, landslide: 17, cyclone: 6 },
  { time: '04:00', flood: 85, landslide: 22, cyclone: 8 },
  { time: '08:00', flood: 80, landslide: 20, cyclone: 6 },
  { time: '12:00', flood: 72, landslide: 15, cyclone: 5 },
];

const mockHistoryData = [
  { date: '2023', score: 45 },
  { date: '2024', score: 62 },
  { date: '2025', score: 85 },
];

import API_BASE_URL from '../config';

const RiskAnalysis = ({ locationData }) => {
  const [tab, setTab] = useState('forecast');
  const [isSimulating, setIsSimulating] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [aiInsight, setAiInsight] = useState({ insight: 'Syncing with AI cluster...', status: 'pending' });

  useEffect(() => {
    if (locationData?.location) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/history/${locationData.location}`);
          setHistoryData(res.data);
        } catch (error) {
          console.error("Error fetching history:", error);
        } finally {
          setLoadingHistory(false);
        }
      };

      const fetchAiInsight = async () => {
        setAiInsight({ insight: 'Analyzing satellite telemetry...', status: 'pending' });
        try {
          const res = await axios.get(`${API_BASE_URL}/api/ai/analyze/${locationData.location}`);
          setAiInsight(res.data);
        } catch (error) {
          console.error("AI Insight failed:", error);
          setAiInsight({ insight: 'AI Link Offline.', status: 'error' });
        }
      };

      fetchHistory();
      fetchAiInsight();
    }
  }, [locationData?.location]);

  const runSimulationAsync = async () => {
    if (!locationData?.location) return;
    setIsSimulating(true);
    try {
      await axios.get(`${API_BASE_URL}/api/simulation?location=${locationData.location}`);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportData = () => {
    if (!historyData || historyData.length === 0) return;
    
    const headers = ["Time", "Flood Risk (%)", "Landslide Risk (%)", "Cyclone Risk (%)"];
    const records = historyData.map(row => [
      row.time,
      row.flood.toFixed(1),
      row.landslide.toFixed(1),
      row.cyclone.toFixed(1)
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + records.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${location}_risk_trajectory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!locationData) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500">
        <div>
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a region on the map to view detailed risk analysis.</p>
        </div>
      </div>
    );
  }

  const { location, flood_risk = 0, landslide_risk = 0, cyclone_risk = 0 } = locationData;
  const maxRisk = Math.max(flood_risk, landslide_risk, cyclone_risk);
  const overallRisk = maxRisk > 75 ? 'Critical' : maxRisk > 50 ? 'Warning' : 'Stable';
  const riskColor = maxRisk > 75 ? 'text-danger' : maxRisk > 50 ? 'text-warning' : 'text-success';

  return (
    <div className="flex flex-col h-full bg-surface/90 backdrop-blur text-slate-200">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20">
        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Module 3: AI Prediction Output</div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black tracking-tight text-white">{location} Analysis</h2>
          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-surface border border-slate-700 ${riskColor}`}>
            {overallRisk}
          </span>
        </div>
      </div>

      <div className="flex items-center border-b border-slate-700/50 px-2 overflow-x-auto">
        <TabButton active={tab === 'forecast'} onClick={() => setTab('forecast')} label="24h Forecast" />
        <TabButton active={tab === 'models'} onClick={() => setTab('models')} label="ML Models" />
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} label="History" />
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* ML Forecast Tab */}
        {tab === 'forecast' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Risk Trajectory</h3>
                <button 
                  onClick={handleExportData}
                  className="text-xs flex items-center space-x-1 text-primary hover:text-indigo-400 transition-colors"
                >
                  <Download size={14} /> <span>Export Data</span>
                </button>
              </div>
              
              <div className="h-48 w-full bg-slate-800/20 rounded-xl p-3 border border-slate-700/50 relative">
                {loadingHistory ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10 rounded-xl">
                      <div className="flex flex-col items-center space-y-2">
                         <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Syncing Live Data...</span>
                      </div>
                   </div>
                ) : null}

                {/* AI Insight Overlay/Box */}
                <div className="absolute bottom-4 left-4 right-4 z-[5] bg-slate-900/60 backdrop-blur-xl border border-white/5 p-3 rounded-xl shadow-2xl">
                   <div className="flex items-center space-x-2 mb-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${aiInsight.status === 'live' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`}></div>
                      <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">AI Cluster Analysis</span>
                   </div>
                   <p className="text-[11px] leading-relaxed text-slate-100 font-medium italic">
                      "{aiInsight.insight}"
                   </p>
                </div>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                  <AreaChart data={historyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="flood" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFlood)" strokeWidth={2} />
                    <Area type="monotone" dataKey="landslide" stroke="#f59e0b" fillOpacity={0.1} fill="#f59e0b" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-parameters */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/50 pb-2">Environmental Data (Live)</h3>
              
              <ParameterRow label="Soil Moisture" value="68%" trend="up" severity="high" />
              <ParameterRow label="Local Rainfall (24h)" value="124mm" trend="up" severity="high" />
              <ParameterRow label="River Distance" value="1.2 km" trend="neutral" severity="medium" />
              <ParameterRow label="Vegetation Cover" value="45%" trend="down" severity="low" />
            </div>

            <button 
              onClick={runSimulationAsync}
              disabled={isSimulating}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all shadow-lg ${isSimulating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-primary/20'}`}
            >
              {isSimulating ? (
                 <div className="flex items-center space-x-2">
                   <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
                   <span>Running ML Simulation...</span>
                 </div>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>Run Deep Learning Simulation</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Models Info Tab */}
        {tab === 'models' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <ModelCard 
               name="XGBoost Ensemble" 
               type="Flood Prediction"
               accuracy={94.2}
               features={['Rainfall', 'Elevation', 'River Dist', 'Soil Moisture']}
               status="Active"
             />
             <ModelCard 
               name="Random Forest Classifier" 
               type="Landslide Risk"
               accuracy={89.5}
               features={['Slope', 'Land Cover', 'Rainfall Anomaly']}
               status="Active"
             />
             <ModelCard 
               name="CNN-LSTM Network" 
               type="Cyclone Path Analysis"
               accuracy={91.0}
               features={['Satellite IR', 'Wind Vector', 'Sea Surface Temp']}
               status="Standby"
             />
          </div>
        )}

        {/* History Info Tab */}
        {tab === 'history' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Past 24h Risk Replay</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4">Historical disaster records and risk trajectory replays for {location} processed by the data engineering module.</p>
             
             <div className="h-64 w-full bg-slate-800/20 rounded-xl p-3 border border-slate-700/50 relative">
               {loadingHistory ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10 rounded-xl">
                     <div className="flex flex-col items-center space-y-2">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Fetching Archives...</span>
                     </div>
                  </div>
               ) : null}
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                 <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                     itemStyle={{ color: '#f8fafc' }}
                   />
                   <Area type="step" dataKey="flood" name="Flood History" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={2} />
                   <Area type="step" dataKey="landslide" name="Landslide History" stroke="#f59e0b" fillOpacity={0.1} fill="#f59e0b" strokeWidth={2} />
                   <Area type="step" dataKey="cyclone" name="Cyclone History" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorHistory)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
        active 
          ? 'text-primary border-primary' 
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function ParameterRow({ label, value, trend, severity }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30 px-2 rounded transition-colors cursor-default">
      <span className="text-slate-300 text-sm">{label}</span>
      <div className="flex items-center space-x-3">
        <span className="font-mono font-medium text-slate-200">{value}</span>
        {severity === 'high' && <AlertTriangle size={14} className="text-danger" />}
        {severity === 'low' && <CheckCircle size={14} className="text-success" />}
        {severity === 'medium' && <span className="w-3.5 h-3.5 rounded-full bg-warning/20 border border-warning flex items-center justify-center"></span>}
      </div>
    </div>
  );
}

function ModelCard({ name, type, accuracy, features, status }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 transition-all hover:bg-slate-800/60">
       <div className="flex items-start justify-between mb-3">
         <div>
           <h4 className="font-bold text-slate-200">{name}</h4>
           <div className="text-xs text-slate-400">{type}</div>
         </div>
         <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
           status === 'Active' ? 'text-success border-success/30 bg-success/10' : 'text-slate-400 border-slate-600 bg-slate-800'
         }`}>
           {status}
         </span>
       </div>
       <div className="flex justify-between items-end">
         <div className="space-y-1">
           <div className="text-[10px] text-slate-500 uppercase tracking-wide">Key Features</div>
           <div className="flex flex-wrap gap-1">
             {features.map((f, i) => <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>)}
           </div>
         </div>
         <div className="text-right ml-2">
           <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Accuracy</div>
           <div className="font-mono text-lg font-bold text-primary">{accuracy}%</div>
         </div>
       </div>
    </div>
  );
}

export default RiskAnalysis;
