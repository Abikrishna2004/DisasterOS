import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

// Fix leafet icon issue
delete L.Icon.Default.prototype._getIconUrl;

const getMarkerColor = (risk) => {
  if (risk === 'red') return '#ef4444'; // danger
  if (risk === 'yellow') return '#f59e0b'; // warning
  return '#10b981'; // success
};

import 'leaflet.heat';

// Component to dynamically change map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      pan: {
        duration: 1
      }
    });
  }, [center, zoom, map]);
  return null;
}

// Module 5: Heatmap Visualization logic
function HeatLayer({ predictions }) {
  const map = useMap();
  useEffect(() => {
    if (!predictions || predictions.length === 0) return;
    
    // Format: [[lat, lng, intensity], ...]
    const points = predictions.map(p => {
      const maxRisk = Math.max(p.flood_risk, p.landslide_risk, p.cyclone_risk);
      return [p.lat, p.lng, maxRisk / 100];
    });

    if (typeof L.heatLayer !== 'function') {
      console.warn('Leaflet.heat not loaded properly');
      return;
    }

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [predictions, map]);
  return null;
}

function MapEvents({ onLocationAdd, onSelectLocation }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        // Reverse Geocoding
        // High-Precision Name Resolution
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const address = res.data.address;
        const displayName = res.data.display_name || "";
        const name = address?.city || address?.town || address?.village || address?.suburb || address?.neighbourhood || address?.county || (displayName.split(',')[0]) || "Target Point";
        
        await axios.post('http://localhost:8000/api/location', {
          name: name,
          lat: lat,
          lng: lng
        });
        
        // Immediately select the location to update UI
        if(onSelectLocation) onSelectLocation({ location: name, lat: lat, lng: lng });
        
        // Trigger generic callback to refresh
        if(onLocationAdd) onLocationAdd();
      } catch (error) {
        console.error("Failed to add new location dynamically", error);
      }
    }
  });
  return null;
}

const DashboardMap = ({ predictions, selectedLocation, setSelectedLocation, onForceRefresh }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const center = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : defaultCenter;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={true}
        attributionControl={false}
        className="rounded-lg shadow-inner"
      >
        <ChangeView center={center} zoom={6} />
        <HeatLayer predictions={predictions} />
        <MapEvents onLocationAdd={onForceRefresh} onSelectLocation={setSelectedLocation} />
        
        {/* 100% Real High-Definition Google Satellite Hybrid (Optimized Speed) */}
        <TileLayer
          attribution='&copy; Google'
          url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={['0','1','2','3']}
          maxZoom={20}
          updateWhenIdle={true}
          keepBuffer={2}
        />

        {predictions.map((pred, idx) => {
           const color = getMarkerColor(pred.severity);
           
           // Determine the max risk value for sizing the marker
           const maxRisk = Math.max(pred.flood_risk, pred.landslide_risk, pred.cyclone_risk);
           const radius = Math.max(8, maxRisk / 3); // Base size 8, dynamically scales with risk

           return (
             <CircleMarker
               key={idx}
               center={[pred.lat, pred.lng]}
               pathOptions={{ 
                 color: color, 
                 fillColor: color, 
                 fillOpacity: 0.7,
                 weight: selectedLocation?.location === pred.location ? 4 : 1
               }}
               radius={selectedLocation?.location === pred.location ? radius + 5 : radius}
               eventHandlers={{
                 click: () => {
                   setSelectedLocation(pred);
                 },
               }}
             >
               <Tooltip direction="top" offset={[0, -10]} opacity={0.9} className="custom-tooltip bg-surface border-slate-700 text-slate-200 p-2 rounded-lg">
                 <div>
                   <h3 className="font-bold border-b border-slate-600 pb-1 mb-1">{pred.location}</h3>
                   <div className="text-xs space-y-1">
                     <p className="flex justify-between w-32"><span>Flood Risk:</span> <span className="font-mono font-bold text-blue-400">{pred.flood_risk}%</span></p>
                     <p className="flex justify-between"><span>Landslide:</span> <span className="font-mono font-bold text-amber-500">{pred.landslide_risk}%</span></p>
                     <p className="flex justify-between"><span>Cyclone:</span> <span className="font-mono font-bold text-indigo-400">{pred.cyclone_risk}%</span></p>
                   </div>
                 </div>
               </Tooltip>
             </CircleMarker>
           );
        })}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
