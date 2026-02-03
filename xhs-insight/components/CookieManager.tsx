import React, { useState } from 'react';
import { Cookie, CookieStatus } from '../types';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

interface CookieManagerProps {
  cookies: Cookie[];
  onAddCookie: (value: string) => void;
  onDeleteCookie: (id: string) => void;
}

export const CookieManager: React.FC<CookieManagerProps> = ({ cookies, onAddCookie, onDeleteCookie }) => {
  const [newValue, setNewValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newValue.trim()) {
      onAddCookie(newValue.trim());
      setNewValue('');
    }
  };

  const activeCookies = cookies.filter(c => c.status === CookieStatus.Active).length;
  const isDepleted = activeCookies === 0 && cookies.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">Cookie Asset Pool</h3>
            {isDepleted && (
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" /> DEPLETED
                </span>
            )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Collapse' : 'Manage'} ({activeCookies}/{cookies.length})
        </Button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Paste raw cookie string here..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-xhs-red focus:border-transparent"
            />
            <Button type="submit" size="sm">Add</Button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cookies.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No cookies added. The crawler will not work.</p>
            )}
            {cookies.map(cookie => (
              <div key={cookie.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  {cookie.status === CookieStatus.Active ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="flex flex-col truncate">
                    <span className="font-mono text-gray-600 truncate w-48 md:w-64">{cookie.value.substring(0, 30)}...</span>
                    <span className="text-xs text-gray-400">Failures: {cookie.failureCount} | Last used: {cookie.lastUsed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-xhs-red" title="Retry Check">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDeleteCookie(cookie.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};