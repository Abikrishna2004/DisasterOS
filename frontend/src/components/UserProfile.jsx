import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Building2, MapPin, Bell, LogOut, Settings } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/user/profile');
      setProfile(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Profile fetch failed:", error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/user/profile', formData);
      setProfile(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header/Cover */}
        <div className="h-24 md:h-32 bg-gradient-to-r from-primary/50 to-indigo-600/50 relative">
           <div className="absolute -bottom-10 md:-bottom-12 left-6 md:left-10 p-1 bg-surface rounded-2xl border-2 border-slate-700 shadow-xl">
              <img src={profile.avatar} alt="Avatar" className="h-20 w-20 md:h-24 md:w-24 rounded-xl" />
           </div>
        </div>

        <div className="pt-14 md:pt-16 pb-8 md:pb-10 px-6 md:px-10">
           <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className="w-full sm:w-auto">
                 {isEditing ? (
                    <input 
                      className="text-2xl md:text-3xl font-black bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-white outline-none focus:border-primary w-full mb-2"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 ) : (
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight break-words">{profile.name}</h2>
                 )}
                 <p className="text-primary font-bold text-sm md:text-base">{profile.role}</p>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto overflow-x-auto pb-1">
                 {isEditing ? (
                    <>
                       <button 
                         onClick={() => setIsEditing(false)}
                         className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border border-slate-700 whitespace-nowrap"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={handleSave}
                         className="flex-1 sm:flex-none bg-primary hover:bg-primary/80 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                       >
                         Save Changes
                       </button>
                    </>
                 ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all border border-slate-700 whitespace-nowrap"
                    >
                      <Settings size={18} />
                      <span>Edit Profile</span>
                    </button>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4 md:space-y-6">
                 {isEditing ? (
                    <>
                       <EditField icon={<Building2 size={20} />} label="Organization" value={formData.organization} onChange={(val) => setFormData({...formData, organization: val})} />
                       <EditField icon={<Mail size={20} />} label="Email Address" value={formData.email} onChange={(val) => setFormData({...formData, email: val})} />
                       <EditField icon={<User size={20} />} label="Professional Role" value={formData.role} onChange={(val) => setFormData({...formData, role: val})} />
                    </>
                 ) : (
                    <>
                       <ProfileInfo icon={<Building2 size={20} />} label="Organization" value={profile.organization} />
                       <ProfileInfo icon={<Mail size={20} />} label="Email Address" value={profile.email} />
                       <ProfileInfo icon={<Shield size={20} />} label="Administrative Rights" value="Full Access" />
                    </>
                 )}
              </div>
              <div className="space-y-4 md:space-y-6">
                 <div className="bg-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-700/50">
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center space-x-2">
                       <MapPin size={16} />
                       <span>Monitored Regions</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {profile.regions_monitored.map((region, i) => (
                          <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold">
                             {region}
                          </span>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 md:p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                       <Bell size={20} className="text-warning" />
                       <span className="text-xs md:text-sm font-bold text-white">Alert Notifications</span>
                    </div>
                    <div className="w-10 h-5 md:w-12 md:h-6 bg-success rounded-full flex items-center justify-end px-1 cursor-pointer">
                       <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
              <span className="text-[10px] md:text-xs text-center sm:text-left">Account UUID: <span className="font-mono text-slate-400 break-all">{profile.uid}</span></span>
              <button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto text-danger hover:text-red-400 flex items-center justify-center space-x-2 font-bold transition-colors text-sm md:text-base"
              >
                 <LogOut size={18} />
                 <span>Sign Out System</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

function ProfileInfo({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-3 md:space-x-4 group">
       <div className="p-2.5 md:p-3 bg-slate-800 rounded-xl border border-slate-700 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-slate-800/80">{icon}</div>
       <div className="min-w-0 flex-1">
          <div className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">{label}</div>
          <div className="text-sm md:text-base font-bold text-slate-200 truncate md:whitespace-normal">{value}</div>
       </div>
    </div>
  );
}

function EditField({ icon, label, value, onChange }) {
  return (
    <div className="flex items-center space-x-3 md:space-x-4 animate-in fade-in duration-300">
       <div className="p-2.5 md:p-3 bg-slate-800 rounded-xl border border-slate-700 text-primary">{icon}</div>
       <div className="flex-1 min-w-0">
          <div className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</div>
          <input 
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 md:px-3 py-1.5 text-xs md:text-sm text-white outline-none focus:border-primary transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
       </div>
    </div>
  );
}

export default UserProfile;
