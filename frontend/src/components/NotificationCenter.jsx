import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, AlertCircle, Info, CheckCircle2, ShieldAlert, Trash2, Search } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error("Notifications fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDeleteAll = async () => {
    if (window.confirm("Clear all system notifications?")) {
       try {
          await axios.delete('http://localhost:8000/api/notifications');
          setNotifications([]);
       } catch (error) {
          console.error("Delete failed:", error);
       }
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'CRITICAL': return 'text-danger bg-danger/10 border-danger/20';
      case 'HIGH': return 'text-warning bg-warning/10 border-warning/20';
      case 'INFO': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'CRITICAL': return <ShieldAlert size={18} />;
      case 'HIGH': return <AlertCircle size={18} />;
      case 'INFO': return <Info size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4 md:px-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Notification Center</h2>
          <p className="text-slate-500 text-xs md:text-sm">Real-time alerts and system logs from the AI analysis engine.</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
           <button 
             onClick={fetchNotifications}
             className="flex-1 sm:flex-none p-2 md:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center justify-center cursor-pointer"
           >
              <Search size={18} />
           </button>
           <button 
             onClick={handleDeleteAll}
             className="flex-1 sm:flex-none p-2 md:p-2.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition-all border border-danger/20 flex items-center justify-center cursor-pointer"
           >
              <Trash2 size={18} />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="h-20 bg-slate-800/40 rounded-2xl animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className={`group flex items-start p-4 md:p-5 rounded-2xl border transition-all cursor-pointer ${notif.status === 'unread' ? 'bg-surface border-slate-600 shadow-xl' : 'bg-surface/40 border-slate-700 opacity-80 hover:opacity-100'}`}>
                <div className={`p-2.5 md:p-3 rounded-xl border mr-3 md:mr-4 shrink-0 overflow-hidden ${getTypeStyle(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] md:text-[10px] font-black tracking-widest uppercase ${getTypeStyle(notif.type).split(' ')[0]}`}>{notif.type}</span>
                    <span className="text-[10px] md:text-xs text-slate-500 font-mono italic">{notif.time}</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-200 truncate group-hover:whitespace-normal transition-all">{notif.title}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-none">Satellite telemetry verified this event. No immediate evacuation required for general population.</p>
                </div>
                {notif.status === 'unread' && (
                  <div className="ml-2 md:ml-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_#3b82f6] shrink-0"></div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-500 italic">
               No active notifications. System clear.
            </div>
          )}
          
          <div className="py-8 md:py-10 text-center">
             <div className="inline-flex items-center space-x-2 px-3 md:px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                <CheckCircle2 size={14} md:size={16} className="text-success" />
                <span className="text-[10px] md:text-xs font-bold text-slate-400">All system integrity checks passed</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
