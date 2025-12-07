import { useState, useEffect } from 'react';
import useDashboardStore from '@/store/useDashboardStore';

const ENCRYPTION_KEY = 'finboard_api_keys';

function encrypt(data) {
  return btoa(JSON.stringify(data));
}
function decrypt(data) {
  try {
    return JSON.parse(atob(data));
  } catch {
    return {};
  }
}

export default function SettingsPanel({ isOpen, onClose }) {
  const { theme } = useDashboardStore();
  const [keys, setKeys] = useState({ finnhub: '', alphavantage: '' });

  useEffect(() => {
    const stored = localStorage.getItem(ENCRYPTION_KEY);
    if (stored) setKeys(decrypt(stored));
  }, [isOpen]);

  const handleChange = (e) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem(ENCRYPTION_KEY, encrypt(keys));
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-xl shadow-lg p-6 flex flex-col gap-4 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          API Key Settings
        </h2>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Finnhub API Key
          </label>
          <input
            type="text"
            name="finnhub"
            value={keys.finnhub}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border ${
              theme === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
            placeholder="Enter Finnhub API Key"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Alpha Vantage API Key
          </label>
          <input
            type="text"
            name="alphavantage"
            value={keys.alphavantage}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded border ${
              theme === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
            placeholder="Enter Alpha Vantage API Key"
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={onClose} 
            className={`px-4 py-2 rounded ${
              theme === 'dark'
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
