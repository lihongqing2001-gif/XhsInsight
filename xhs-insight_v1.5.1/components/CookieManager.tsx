import React, { useState } from 'react';
import { Cookie } from '../types';

interface CookieManagerProps {
  isOpen: boolean;
  onClose: () => void;
  cookies: Cookie[];
  onAddCookie: (value: string, note: string) => void;
  onRemoveCookie: (id: string) => void;
}

const CookieManager: React.FC<CookieManagerProps> = ({
  isOpen, onClose, cookies, onAddCookie, onRemoveCookie
}) => {
  const [newCookie, setNewCookie] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCookie.trim()) {
      onAddCookie(newCookie, note);
      setNewCookie('');
      setNote('');
    }
  };

  const activeCount = cookies.filter(c => c.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cookie 资产管理</h2>
            <p className="text-sm text-gray-500 mt-1">
              有效: <span className="text-green-600 font-bold">{activeCount}</span> / 总计: {cookies.length}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warning Alert if no active cookies */}
          {activeCount === 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <span className="font-bold">系统警告:</span> 当前无有效 Cookie。爬虫将无法工作，请立即补充新的小红书网页版 Cookie。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add New Cookie */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">添加新 Session Cookie</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="账号备注 (例如: 账号A - 美妆)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-xhs-red focus:border-xhs-red"
                />
              </div>
              <div>
                <textarea
                  placeholder="在此粘贴完整 Cookie 字符串..."
                  value={newCookie}
                  onChange={(e) => setNewCookie(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded text-sm font-mono text-xs focus:ring-xhs-red focus:border-xhs-red"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newCookie.trim()}
                  className="px-4 py-2 bg-xhs-red text-white text-sm font-medium rounded hover:bg-red-600 disabled:opacity-50"
                >
                  添加到资产池
                </button>
              </div>
            </form>
          </div>

          {/* Cookie List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">已管理 Cookie</h3>
            {cookies.length === 0 ? (
              <p className="text-sm text-gray-400 italic">暂无 Cookie 记录。</p>
            ) : (
              cookies.map(cookie => (
                <div key={cookie.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-2 h-2 rounded-full ${cookie.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{cookie.note || '未命名账号'}</p>
                      <p className="text-xs text-gray-500 truncate font-mono w-64">{cookie.value.substring(0, 40)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`text-xs px-2 py-1 rounded-full ${
                       cookie.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                       {cookie.status === 'active' ? '有效' : '失效'}
                     </span>
                    <button 
                      onClick={() => onRemoveCookie(cookie.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieManager;