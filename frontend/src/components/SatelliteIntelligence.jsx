import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Database, 
  Satellite, 
  Layers, 
  Cpu, 
  Maximize2,
  Download,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Tooltip, Rectangle, useMap } from 'react-leaflet';

import API_BASE_URL from '../config';

const SatelliteIntelligence = ({ selectedLocation }) => {
  const [metadata, setMetadata] = useState([]);
  const [stats, setStats] = useState({ data_ingested: "0.0 TB", satellites_online: 0, map_layers: 24, ml_inference: "0.0ms" });
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/satellite/ingest`);
      alert(res.data.message);
      fetchMetadata();
    } catch (error) {
      console.error("Ingestion failed:", error);
    } finally {
      setIsIngesting(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [metaRes, statsRes] = await Promise.all([
         axios.get(`${API_BASE_URL}/api/satellite/metadata`),
         axios.get(`${API_BASE_URL}/api/satellite/stats`)
      ]);
      setMetadata(metaRes.data);
      setStats(statsRes.data.stats);
      setPipeline(statsRes.data.pipeline);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching satellite data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleExportSatelliteReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      location: selectedLocation?.location || "Global View",
      coordinates: selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null,
      satellite_stats: stats,
      active_pipeline: pipeline,
      inventory: metadata
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `satellite_intel_report_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.removeChild(downloadAnchorNode);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Stats Cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<Database size={18} className="text-blue-400" />} label="Data Ingested" value={stats.data_ingested} sub="Daily Average" />
        <StatCard icon={<Satellite size={18} className="text-indigo-400" />} label="Satellites Online" value={stats.satellites_online} sub="ESA, NASA, ISRO" />
        <StatCard icon={<Layers size={18} className="text-amber-400" />} label="Map Layers" value={stats.map_layers} sub="SAR, Optical, DEM" />
        <StatCard icon={<Cpu size={18} className="text-emerald-400" />} label="ML Inference" value={stats.ml_inference} sub="AI Latency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Feed View */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-surface border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 bg-slate-900/80 backdrop-blur px-2 md:px-3 py-1 rounded-full border border-slate-700 text-[8px] md:text-xs font-mono text-emerald-400 flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="truncate max-w-[120px] md:max-w-none">MOD-1: Ingestion | Sentinel-2</span>
              </div>
              
              <div className="aspect-video md:aspect-[21/9] bg-slate-800 flex items-center justify-center relative overflow-hidden z-0">
                 <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-900/80 to-transparent z-[500] pointer-events-none"></div>
                 <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent z-[500] pointer-events-none"></div>
                 
                 {selectedLocation ? (
                    <MapContainer 
                      center={[selectedLocation.lat, selectedLocation.lng]} 
                      zoom={14} 
                      className="h-full w-full z-10"
                      zoomControl={false}
                      attributionControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      doubleClickZoom={false}
                    >
                       <SatelliteChangeView center={[selectedLocation.lat, selectedLocation.lng]} zoom={14} />
                       <TileLayer
                          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                       />
                       <Rectangle bounds={[
                          [selectedLocation.lat - 0.015, selectedLocation.lng - 0.025],
                          [selectedLocation.lat + 0.015, selectedLocation.lng + 0.025]
                       ]} pathOptions={{ color: selectedLocation.severity === 'red' ? '#ef4444' : selectedLocation.severity === 'yellow' ? '#f59e0b' : '#3b82f6', weight: 2, fillOpacity: 0.1, dashArray: '4, 4' }}>
                           <Tooltip permanent direction="top" className="bg-slate-900/80 text-white border-none shadow-2xl p-1 text-[8px] md:text-[10px] font-bold">
                                Analysis Area
                           </Tooltip>
                       </Rectangle>
                    </MapContainer>
                 ) : (
                    <Satellite size={48} md:size={64} className="text-slate-700 opacity-20" />
                 )}

                 {selectedLocation && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[600] pointer-events-none w-32 md:w-48 h-20 md:h-32 border border-white/20 bg-slate-900/50 backdrop-blur-md rounded-xl flex flex-col items-center justify-center shadow-2xl animate-in fade-in zoom-in duration-500 text-center px-2">
                       <span className={`text-[8px] md:text-[11px] font-black uppercase mb-1 drop-shadow-lg ${selectedLocation.severity === 'red' ? 'text-danger' : selectedLocation.severity === 'yellow' ? 'text-warning' : 'text-primary'}`}>
                          {selectedLocation.severity === 'red' ? 'Critical Risk' : selectedLocation.severity === 'yellow' ? 'Moderate Risk' : 'Secure Region'}
                       </span>
                       <span className="text-[7px] md:text-[9px] font-mono text-white/90">
                          CONF: {Math.max(selectedLocation.flood_risk || 0, selectedLocation.landslide_risk || 0, selectedLocation.cyclone_risk || 0).toFixed(1)}%
                       </span>
                    </div>
                 )}

                 <div className="absolute inset-0 pointer-events-none overflow-hidden z-[500]">
                    <div className="w-full h-[1px] md:h-[2px] bg-primary/30 absolute shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan"></div>
                 </div>
              </div>

              <div className="p-3 md:p-4 bg-slate-800/50 flex items-center justify-between border-t border-white/10 relative z-10">
                 <div className="flex items-center space-x-2 md:space-x-4">
                    <button className="p-1.5 md:p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300">
                       <Maximize2 size={16} md:size={20} />
                    </button>
                    <button 
                      onClick={handleExportSatelliteReport}
                      className="p-1.5 md:p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
                    >
                       <Download size={16} md:size={20} />
                    </button>
                 </div>
                 <div className="text-[8px] md:text-xs font-mono text-emerald-400 font-bold tracking-widest bg-emerald-400/10 px-2 md:px-3 py-1 md:py-1.5 rounded-md border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] truncate max-w-[150px] md:max-w-none">
                    {selectedLocation ? `COORD: ${selectedLocation.lat.toFixed(3)}, ${selectedLocation.lng.toFixed(3)}` : 'NO TARGET LOCK'}
                 </div>
              </div>
           </div>

           <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 px-2 md:px-3 py-1 text-[7px] md:text-[8px] font-bold text-primary uppercase">Module 2: Preprocessing</div>
              <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center space-x-2">
                 <RefreshCw size={18} md:size={20} className="text-primary" />
                 <span>Pipeline Status</span>
              </h3>
              <div className="space-y-3 md:space-y-4">
                 {pipeline.length > 0 ? pipeline.map((step, i) => (
                    <PipelineStep key={i} label={step.label} status={step.status} time={step.time} active={step.active} />
                 )) : (
                    <div className="space-y-4 animate-pulse">
                       <div className="h-4 bg-slate-800 rounded"></div>
                       <div className="h-4 bg-slate-800 rounded"></div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
           <div className="bg-surface border border-slate-700 rounded-3xl p-5 md:p-6 shadow-xl">
              <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center space-x-2">
                 <Terminal size={18} md:size={20} className="text-indigo-400" />
                 <span>Satellite Inventory</span>
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                 {loading ? (
                    <div className="animate-pulse space-y-3">
                       <div className="h-20 bg-slate-800 rounded-2xl"></div>
                       <div className="h-20 bg-slate-800 rounded-2xl"></div>
                    </div>
                 ) : metadata.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="p-3 md:p-4 bg-slate-800/40 border border-slate-700 rounded-2xl hover:bg-slate-800/80 transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-tighter">{item.id}</span>
                          <span className="text-[9px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                       <div className="text-xs md:text-sm font-bold text-white mb-1 truncate">{item.source}</div>
                       <div className="flex items-center space-x-3 text-[9px] text-slate-400">
                          <span className="flex items-center space-x-1">
                             <Layers size={9} /> <span>{item.resolution}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                             <Database size={9} /> <span>{item.cloud_cover}% CC</span>
                          </span>
                       </div>
                    </div>
                 ))}
              </div>

              <button 
                onClick={handleIngest}
                disabled={isIngesting}
                className={`w-full mt-6 ${isIngesting ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold border border-slate-700 transition-all flex items-center justify-center space-x-2`}
              >
                {isIngesting ? (
                   <>
                      <RefreshCw size={16} className="animate-spin text-primary" />
                      <span>Syncing...</span>
                   </>
                ) : (
                   <span>Ingest New Source</span>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

function SatelliteChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.5
    });
  }, [center, zoom, map]);
  return null;
}

function StatCard({ icon, label, value, sub }) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-surface border border-slate-700 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-xl transition-all"
    >
      <div className="mb-2 md:mb-4 bg-slate-800 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-lg md:text-2xl font-black text-white">{value}</div>
      <div className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1">{label}</div>
      <div className="text-[7px] md:text-[10px] text-slate-600 truncate">{sub}</div>
    </motion.div>
  );
}

function PipelineStep({ label, status, time, active }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${status === 'Completed' ? 'bg-success' : active ? 'bg-primary animate-pulse' : 'bg-slate-700'}`}></div>
          <span className={`text-xs md:text-sm truncate ${status === 'Completed' ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
       </div>
       <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
          <span className="text-[9px] md:text-xs font-mono text-slate-500">{time}</span>
          <span className={`text-[8px] md:text-[10px] font-bold uppercase ${status === 'Completed' ? 'text-success' : active ? 'text-primary' : 'text-slate-600'}`}>
             {status}
          </span>
       </div>
    </div>
  );
}

export default SatelliteIntelligence;
