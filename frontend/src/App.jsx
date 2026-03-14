import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Map as MapIcon, 
  Activity, 
  Settings, 
  Menu,
  Bell,
  Search,
  CloudLightning,
  Waves,
  Mountain,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import DashboardMap from './components/DashboardMap';
import RiskAnalysis from './components/RiskAnalysis';
import AlertBar from './components/AlertBar';
import SatelliteIntelligence from './components/SatelliteIntelligence';
import SystemIntegration from './components/SystemIntegration';
import WeatherWidget from './components/WeatherWidget';
import UserProfile from './components/UserProfile';
import NotificationCenter from './components/NotificationCenter';

import API_BASE_URL from './config';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeView, setActiveView] = useState('live-map');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      const config = { timeout: 3000 };
      const [predRes, alertRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/predictions`, config),
        axios.get(`${API_BASE_URL}/api/alerts`, config)
      ]);
      
      const newPredictions = predRes.data || [];
      const newAlerts = alertRes.data || [];
      
      setPredictions(newPredictions);
      setAlerts(newAlerts);
      
      setSelectedLocation(prev => {
        if (!prev && newPredictions.length > 0) {
          const defaultLoc = newPredictions.find(p => p.location === 'Coimbatore');
          return defaultLoc || newPredictions[0];
        } else if (prev && newPredictions.length > 0) {
          const updated = newPredictions.find(p => p.location === prev.location);
          return updated || prev;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const query = e.target.value.trim();
      setLoading(true);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        if (res.data && res.data.length > 0) {
          const topResult = res.data[0];
          const name = topResult.display_name.split(',')[0];
          
          await axios.post(`${API_BASE_URL}/api/location`, {
            name: name,
            lat: parseFloat(topResult.lat),
            lng: parseFloat(topResult.lon)
          });
          
          await fetchData();
          const stub = { 
            location: name, 
            lat: parseFloat(topResult.lat), 
            lng: parseFloat(topResult.lon) 
          };
          setSelectedLocation(stub);
          e.target.value = '';
        } else {
          alert('Location not found.');
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePurgeLocations = async () => {
    if (window.confirm("Purge all custom monitoring points and reset to baseline?")) {
      setLoading(true);
      try {
        const res = await axios.delete(`${API_BASE_URL}/api/location`);
        alert(res.data.message);
        await fetchData();
        const baseline = ['Coimbatore', 'Srinagar', 'Mumbai', 'Guwahati', 'Chennai'];
        if (selectedLocation && !baseline.includes(selectedLocation.location)) {
           setSelectedLocation(null);
        }
      } catch (error) {
        console.error('Purge failed', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-slate-200">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-[1000] w-64 bg-surface/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center space-x-3 border-b border-slate-700/50">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <ShieldAlert size={24} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">DisasterOS</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden ml-auto text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2">
          <NavItem icon={<MapIcon size={20} />} label="Live Map" active={activeView === 'live-map'} onClick={() => { setActiveView('live-map'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<CloudLightning size={20} />} label="Satellite Intelligence" active={activeView === 'satellite'} onClick={() => { setActiveView('satellite'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Bell size={20} />} label="Notification Center" active={activeView === 'notifications'} onClick={() => { setActiveView('notifications'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20} />} label="System Integration" active={activeView === 'admin'} onClick={() => { setActiveView('admin'); setIsMobileMenuOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            System Status: <span className="text-success font-medium">Online</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Last update: Just now
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2 glass rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase italic">
              Dis <span className="text-primary italic">OS</span>
              <span className="hidden sm:inline">aster</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input
                 type="text"
                 placeholder="Search or Click map..."
                 onKeyDown={handleSearch}
                 className="bg-slate-800/50 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all w-64 text-slate-200 placeholder-slate-500"
               />
             </div>
              <button
                onClick={handlePurgeLocations}
                title="Purge Custom Data"
                className="hidden md:flex p-2 bg-slate-800/80 text-danger hover:bg-danger/10 rounded-xl transition-all border border-slate-700 hover:border-danger/30"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => setActiveView('notifications')}
                className="relative p-2 bg-slate-800/80 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-500"
              >
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-4 w-4 bg-danger text-[9px] font-bold text-white items-center justify-center border border-surface">{alerts.length}</span>
                  </span>
                )}
              </button>
              <div
                onClick={() => setActiveView('profile')}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 border-2 border-surface cursor-pointer ring-2 ring-primary/20"
              ></div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden mobile-stack">
             {activeView === 'live-map' && (
               <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                  <div className="flex-1 relative z-0 h-full map-container-mobile">
                    <div className="absolute top-6 left-6 z-[500] pointer-events-none">
                       <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
                          <div className="flex items-center space-x-3 mb-3">
                             <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10b981]"></div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70">Real-Time Sensor Link</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Packet Stream</div>
                                <div className="text-xs font-mono text-primary font-bold">{predictions[0]?.last_update ? `${predictions[0].last_update.replace(/:/g,'')}` : 'SYNCING'}</div>
                             </div>
                             <div>
                                <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Latency</div>
                                <div className="text-xs font-mono text-success font-bold">{Math.floor(Math.random() * 30 + 10)}ms</div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <DashboardMap 
                      predictions={predictions} 
                      selectedLocation={selectedLocation}
                      setSelectedLocation={setSelectedLocation}
                      onForceRefresh={fetchData}
                    />
                  </div>
                  <aside className="w-full md:w-[450px] bg-surface/50 backdrop-blur-md border-t md:border-t-0 md:border-l border-slate-700/50 p-4 md:p-6 overflow-y-auto z-10 custom-scrollbar analytics-container-mobile">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                       <h2 className="text-base md:text-lg font-black text-white uppercase tracking-tighter">Regional Analysis</h2>
                       <WeatherWidget location={selectedLocation?.location} />
                    </div>
                    <RiskAnalysis locationData={selectedLocation} />
                  </aside>
               </div>
             )}

             {activeView === 'satellite' && (
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <div className="max-w-7xl mx-auto">
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Satellite Intelligence</h2>
                            <p className="text-slate-500 text-sm mt-1">Multi-spectral atmospheric monitoring and topography analysis</p>
                         </div>
                         <div className="flex items-center space-x-4">
                            <div className="text-right">
                               <div className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Ground Station Status</div>
                               <div className="flex items-center space-x-2 text-success font-bold text-xs uppercase">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                                  <span>Secure Connection</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      <SatelliteIntelligence selectedLocation={selectedLocation} />
                   </div>
                </div>
             )}

             {activeView === 'notifications' && (
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <div className="max-w-4xl mx-auto">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Notification Center</h2>
                      <p className="text-slate-500 text-sm mb-8">Dispatch logs and early warning history across all monitored channels</p>
                      <NotificationCenter />
                   </div>
                </div>
             )}

             {activeView === 'admin' && (
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <div className="max-w-5xl mx-auto">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">System Integration</h2>
                      <SystemIntegration />
                   </div>
                </div>
             )}

             {activeView === 'profile' && (
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <UserProfile />
                </div>
             )}
          </div>
        )}
        
        {/* Real-time Alert Notification Stack */}
        <div className="fixed bottom-6 right-6 z-[2000] flex flex-col space-y-3 w-80 md:w-96">
           {alerts.slice(0, 3).map((a) => (
              <AlertBar key={a.id} alert={a} onDismiss={dismissAlert} />
           ))}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-primary rounded-2xl -z-10"
        />
      )}
    </button>
  );
}

export default App;
