import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, Wind, Droplets, Thermometer, Eye, Navigation } from 'lucide-react';

import API_BASE_URL from '../config';

const WeatherWidget = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/weather/${location}`);
          setWeather(res.data);
        } catch (error) {
          console.error("Weather fetch failed:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }
  }, [location]);

  if (!location) return null;

  return (
    <div className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 bg-primary/20 px-3 py-1 text-[8px] font-black tracking-widest text-primary uppercase">Environmental Telemetry</div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Live Weather: {location}</h3>
          <p className="text-[10px] text-slate-500 font-mono italic">Source: Open-Meteo Real-time</p>
        </div>
        <Cloud className="text-primary animate-pulse" size={20} />
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
          <WeatherStat icon={<Thermometer size={14} className="text-orange-400" />} label="Temp" value={`${weather.temperature.toFixed(1)}°C`} />
          <WeatherStat icon={<Droplets size={14} className="text-blue-400" />} label="Precip" value={`${weather.precipitation.toFixed(1)}mm`} />
          <WeatherStat icon={<Wind size={14} className="text-slate-400" />} label="Wind" value={`${weather.wind_speed.toFixed(1)}km/h`} />
          <WeatherStat icon={<Navigation size={14} className="text-emerald-400" />} label="Pressure" value={`${weather.pressure.toFixed(1)} hPa`} />
          <WeatherStat icon={<Eye size={14} className="text-indigo-400" />} label="Visibility" value={`${weather.visibility.toFixed(1)}km`} />
          <WeatherStat icon={<Droplets size={14} className="text-cyan-400" />} label="Humidity" value={`${weather.humidity}%`} />
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Syncing weather data...</p>
      )}
    </div>
  );
};

function WeatherStat({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="p-1.5 bg-slate-900/50 rounded-lg border border-white/5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">{label}</span>
        <span className="text-xs font-bold text-white font-mono">{value}</span>
      </div>
    </div>
  );
}

export default WeatherWidget;
