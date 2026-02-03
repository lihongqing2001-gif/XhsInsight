import React, { useState } from 'react';

interface AuthModalProps {
  onLogin: (token: string, email: string) => void;
  onLocalMode: (apiKey: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onLocalMode }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'local'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Handle Local Mode
    if (mode === 'local') {
      if (!apiKey.trim()) {
         setError('请输入 Gemini API Key');
         return;
      }
      onLocalMode(apiKey);
      return;
    }

    // Handle Remote Auth
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/token' : '/api/register';
      const body = mode === 'login' 
        ? new URLSearchParams({ username: email, password: password }) 
        : JSON.stringify({ email, password, gemini_api_key: apiKey });

      const headers = mode === 'login' 
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/json' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || '认证失败');
      }

      const data = await res.json();
      onLogin(data.access_token, email);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            <i className="fa-solid fa-bolt mr-2"></i>
            XHS-Insight
          </h2>
          <p className="text-red-100">专业小红书内容分析平台</p>
        </div>
        
        <div className="p-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'login' ? 'text-xhs-red border-b-2 border-xhs-red' : 'text-gray-400'}`}
              onClick={() => setMode('login')}
            >
              登录
            </button>
            <button 
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'register' ? 'text-xhs-red border-b-2 border-xhs-red' : 'text-gray-400'}`}
              onClick={() => setMode('register')}
            >
              注册
            </button>
             <button 
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'local' ? 'text-xhs-red border-b-2 border-xhs-red' : 'text-gray-400'}`}
              onClick={() => setMode('local')}
            >
              本地模式
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                <i className="fa-solid fa-circle-exclamation mr-1"></i> {error}
              </div>
            )}
            
            {mode === 'local' ? (
               <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2">
                 <p className="font-bold mb-1">本地模式说明：</p>
                 <ul className="list-disc list-inside">
                   <li>无需注册账号，数据存储在本地。</li>
                   <li>需要 <strong>Gemini API Key</strong> (已自动填入测试 Key)。</li>
                 </ul>
               </div>
            ) : null}

            {mode !== 'local' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">邮箱</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-xhs-red focus:border-xhs-red"
                    placeholder="hello@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">密码</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-xhs-red focus:border-xhs-red"
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {(mode === 'register' || mode === 'local') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-xhs-red focus:border-xhs-red pr-8"
                    placeholder="AIzaSy..."
                    defaultValue={mode === 'local' ? "AIzaSyBpXVrxDVjexBaX0njSyOBzLAxyTm0Qnhg" : ""}
                    onFocus={(e) => {
                         if (!apiKey) setApiKey(e.target.value);
                    }}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400 cursor-help" title="用于 AI 分析">
                    <i className="fa-solid fa-key"></i>
                  </div>
                </div>
                {mode === 'local' && <p className="text-[10px] text-green-600 mt-1">已预填测试用 Key，点击开始即可。</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-xhs-red text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 
                (mode === 'login' ? '进入系统' : (mode === 'register' ? '创建账号' : '开始使用'))}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;