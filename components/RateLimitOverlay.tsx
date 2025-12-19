
import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle, Clock, Calendar, Lock } from 'lucide-react';

interface RateLimitOverlayProps {
  type: 'RPM' | 'RPD';
  resetTime: number; // Timestamp when the limit resets
  onClose: () => void;
}

const RateLimitOverlay: React.FC<RateLimitOverlayProps> = ({ type, resetTime, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, resetTime - now);
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [resetTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Lock className="h-10 w-10 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {type === 'RPM' ? 'System Cooling Down' : 'Daily Limit Reached'}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {type === 'RPM' 
              ? 'Our AI engine is processing many requests. Please wait a moment before the next audit.'
              : 'You have reached the maximum 1,500 audits for today. System will reset at midnight.'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            Time Remaining
          </div>
          <div className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          I Understand
        </button>
        
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center">
          <Clock className="h-3 w-3 mr-1" /> Auto-unlocking soon
        </p>
      </div>
    </div>
  );
};

export default RateLimitOverlay;
