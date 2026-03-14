import React from 'react';
import axios from 'axios';
import { 
  Server, 
  Settings, 
  Globe, 
  Cpu, 
  Lock,
  MessageSquare,
  Zap
} from 'lucide-react';

import API_BASE_URL from '../config';

const SystemIntegration = () => {
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ml/optimize`);
      alert(res.data.message);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 relative pb-10">
       <div className="hidden md:block absolute -top-12 right-0 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-40">
          Module 7: Admin System Dashboard
       </div>
      {/* API Configuration */}
      <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary/20 px-3 md:px-4 py-1.5 text-[7px] md:text-[8px] font-black tracking-widest text-primary uppercase">API Nexus</div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <Globe size={20} className="text-primary md:w-6 md:h-6" />
          <span>API Endpoints</span>
        </h3>
        
        <div className="space-y-4 md:space-y-6">
           <ApiConfigRow label="Risk Prediction API" endpoint="/api/predictions" method="GET" />
           <ApiConfigRow label="Satellite Metadata" endpoint="/api/satellite/metadata" method="GET" />
           <ApiConfigRow label="Early Warning Dispatch" endpoint="/api/alerts" method="POST" />
           <ApiConfigRow label="Model Simulation" endpoint="/api/simulation" method="GET" />
        </div>

        <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
           <h4 className="text-xs md:text-sm font-bold text-white mb-2 flex items-center space-x-2">
             <Lock size={14} className="text-warning" />
             <span>Security Protocol</span>
           </h4>
           <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">
             All endpoints are secured via JWT bearer tokens and rate-limited at 100 req/min for public keys.
           </p>
        </div>
      </div>

      {/* Model Parameters */}
      <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-8 shadow-xl">
        <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <Cpu size={20} className="text-emerald-400 md:w-6 md:h-6" />
          <span>ML Model Hyperparameters</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
           <ParamBox label="XGB Ensemble Size" value="500" />
           <ParamBox label="CNN Input Tensors" value="256x256" />
           <ParamBox label="LSTM Hidden Units" value="128" />
           <ParamBox label="Dropout Rate" value="0.3" />
        </div>

        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className={`w-full mt-6 md:mt-8 ${isOptimizing ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500'} text-white py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center space-x-2`}
        >
           {isOptimizing ? (
              <>
                <Cpu size={18} className="animate-spin" />
                <span>Scaling...</span>
              </>
           ) : (
              <span>Optimize Weights (AutoML)</span>
           )}
        </button>
      </div>

      {/* Communication Channels */}
      <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-8 shadow-xl">
        <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <MessageSquare size={20} className="text-indigo-400 md:w-6 md:h-6" />
          <span>Alert Channels</span>
        </h3>
        
        <div className="space-y-3 md:space-y-4">
           <ChannelToggle label="SMS Gateway (Twilio)" active status="Healthy" />
           <ChannelToggle label="Email Dispatch (SendGrid)" active status="Healthy" />
           <ChannelToggle label="Public API Webhooks" active={false} status="Maintenance" />
           <ChannelToggle label="Emergency Broadcast" active status="Operational" />
        </div>
      </div>

      {/* Hardware Status */}
      <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-8 shadow-xl">
        <h3 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <Server size={20} className="text-primary md:w-6 md:h-6" />
          <span>Cloud Infrastructure</span>
        </h3>
        
        <div className="space-y-3 md:space-y-4">
           <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-800/50 p-4 rounded-2xl gap-2">
              <div className="flex items-center space-x-3 md:space-x-4">
                 <Zap className="text-yellow-400 shrink-0" size={18} md:size={20} />
                 <div>
                    <div className="text-xs md:text-sm font-bold text-white">Compute Cluster A (AWS)</div>
                    <div className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-tighter">us-east-1 | 12 Nodes</div>
                 </div>
              </div>
              <div className="sm:text-right">
                 <div className="text-[10px] md:text-xs font-bold text-success">99.9% Uptime</div>
              </div>
           </div>
           
           <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-800/50 p-4 rounded-2xl gap-2">
              <div className="flex items-center space-x-3 md:space-x-4">
                 <Settings className="text-slate-400 shrink-0" size={18} md:size={20} />
                 <div>
                    <div className="text-xs md:text-sm font-bold text-white">PostgreSQL DB Cluster</div>
                    <div className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-tighter">Storage: 4.8 TB Used</div>
                 </div>
              </div>
              <div className="sm:text-right">
                 <div className="text-[10px] md:text-xs font-bold text-success uppercase">Synced</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

function ApiConfigRow({ label, endpoint, method }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between group gap-2">
       <div className="min-w-0">
          <div className="text-xs md:text-sm font-bold text-white">{label}</div>
          <div className="text-[10px] md:text-xs font-mono text-slate-500 group-hover:text-primary transition-colors cursor-pointer break-all">{endpoint}</div>
       </div>
       <span className={`self-start sm:self-center px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[8px] md:text-[9px] font-black tracking-widest ${method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-primary/20 text-primary'}`}>
          {method}
       </span>
    </div>
  );
}

function ParamBox({ label, value }) {
  return (
    <div className="bg-slate-800/50 p-3 md:p-4 rounded-2xl border border-slate-700/50">
       <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
       <div className="text-base md:text-lg font-black text-white">{value}</div>
    </div>
  );
}

function ChannelToggle({ label, active, status }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
       <div className="flex items-center space-x-3 md:space-x-4">
          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 ${active ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
          <span className={`text-xs md:text-sm font-medium ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
       </div>
       <span className={`text-[9px] md:text-[10px] font-bold ${status === 'Healthy' || status === 'Operational' ? 'text-success' : 'text-warning'} shrink-0 ml-2`}>
          {status}
       </span>
    </div>
  );
}

export default SystemIntegration;
