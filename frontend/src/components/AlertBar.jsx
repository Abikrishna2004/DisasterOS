import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const AlertBar = ({ alert, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after some time (optional, maybe not for critical)
  useEffect(() => {
    if (alert.severity !== 'critical') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) setTimeout(() => onDismiss(alert.id), 300); // Wait for anim
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alert.severity, alert.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) setTimeout(() => onDismiss(alert.id), 300);
  };

  const severityConfig = {
    critical: {
      color: 'bg-red-500/10 text-red-500 border-red-500/50',
      icon: <AlertCircle className="text-red-500" size={20} />,
      bgIcon: 'text-red-500/20'
    },
    high: {
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/50',
      icon: <AlertTriangle className="text-orange-500" size={20} />,
      bgIcon: 'text-orange-500/20'
    },
    medium: {
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
      icon: <Info className="text-yellow-500" size={20} />,
      bgIcon: 'text-yellow-500/20'
    },
    low: {
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/50',
      icon: <Info className="text-blue-500" size={20} />,
      bgIcon: 'text-blue-500/20'
    }
  };

  const config = severityConfig[alert.severity] || severityConfig.medium;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={clsx(
            "relative overflow-hidden rounded-xl border p-4 shadow-xl backdrop-blur-md",
            config.color,
            "bg-surface/80" // Dark overlay
          )}
        >
          {/* Subtle pulsating background for critical alerts */}
          {alert.severity === 'critical' && (
            <div className="absolute inset-0 block animate-pulse bg-red-500/5" />
          )}

          <div className="relative z-10 flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              {config.icon}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold tracking-wide text-slate-100 mb-1 flex items-center justify-between">
                {alert.title}
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface/50 text-slate-300">
                  {alert.location}
                </span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {alert.message}
              </p>
            </div>

            <button 
              onClick={handleDismiss}
              className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBar;
