import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../../services/healthService';

const BackendStatusPill = ({ compact = false }) => {
  const [status, setStatus] = useState({
    checked: false,
    online: false,
    message: 'Checking backend...',
    database: 'NeDB',
  });

  const checkStatus = async () => {
    const res = await checkBackendHealth();
    setStatus({
      checked: true,
      online: res.online,
      message: res.message,
      database: res.database,
    });
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status.checked) return null;

  if (compact) {
    return (
      <div 
        title={status.online ? `Connected to ${status.database} Backend: ${status.message}` : status.message}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-theme-lavender/25 bg-theme-purple/80 backdrop-blur-md cursor-help transition-all shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          {status.online && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status.online ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
        </span>
        <span className="text-white font-mono text-[11px] font-semibold">
          {status.online ? 'NeDB Backend: Live' : 'Backend: Local Engine'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
        status.online
          ? 'bg-[#131A2B] border-emerald-400/40 text-emerald-300'
          : 'bg-[#131A2B] border-amber-400/40 text-amber-300'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status.online ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status.online ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
          }`}
        />
      </span>
      <span>
        {status.online ? (
          <>
            Backend: <strong className="text-white font-black">Connected ({status.database})</strong>
          </>
        ) : (
          <>
            Backend: <strong className="text-white font-black">Local Fallback (Express offline)</strong>
          </>
        )}
      </span>
    </div>
  );
};

export default BackendStatusPill;
