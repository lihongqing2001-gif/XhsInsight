import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CookieManager from './components/CookieManager';
import ResultCard from './components/ResultCard';
import NoteDetail from './components/NoteDetail';
import AuthModal from './components/AuthModal';
import { MOCK_RESULTS, MOCK_FOLDERS, MOCK_COOKIES } from './services/mockData';
import { ScrapeResult, Cookie, Folder } from './types';

// Help Modal Component (Translated)
const HelpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-8 rounded-lg max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4">如何使用 XHS-Insight</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
        <li><strong>第一步:</strong> 进入“Cookie 资产”并粘贴有效的小红书网页版 Cookie。</li>
        <li><strong>第二步:</strong> 在输入框中粘贴笔记链接。</li>
        <li><strong>第三步:</strong> 点击“立即分析”。爬虫将抓取数据，Gemini AI 将进行深度分析。</li>
      </ul>
      <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-900 text-white rounded">知道了</button>
    </div>
  </div>
);

const App: React.FC = () => {
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string>(localStorage.getItem('userEmail') || '');
  const [isLocalMode, setIsLocalMode] = useState<boolean>(localStorage.getItem('isLocalMode') === 'true');
  const [localApiKey, setLocalApiKey] = useState<string>(localStorage.getItem('localApiKey') || '');

  // App State
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [urlInput, setUrlInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Modals
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<ScrapeResult | null>(null);
  
  // Processing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  // Initialization
  useEffect(() => {
    if (isLocalMode) {
       // Load Local Data
       const localResults = JSON.parse(localStorage.getItem('localResults') || '[]');
       const localCookies = JSON.parse(localStorage.getItem('localCookies') || '[]');
       setResults(localResults.length ? localResults : MOCK_RESULTS); // Use Mock if empty for demo
       setCookies(localCookies.length ? localCookies : MOCK_COOKIES);
    } else if (token) {
       // Authenticated logic (simulated)
       setResults(MOCK_RESULTS); 
       setCookies(MOCK_COOKIES);
    }
  }, [token, isLocalMode]);

  // Persist Local Data
  useEffect(() => {
    if (isLocalMode) {
      localStorage.setItem('localResults', JSON.stringify(results));
      localStorage.setItem('localCookies', JSON.stringify(cookies));
    }
  }, [results, cookies, isLocalMode]);

  // Filter Logic
  const filteredResults = activeFolder === 'all' 
    ? results 
    : results.filter(r => r.note.groupId === activeFolder);

  // Handlers
  const handleLogin = (newToken: string, email: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    localStorage.removeItem('isLocalMode');
    setToken(newToken);
    setUserEmail(email);
    setIsLocalMode(false);
  };

  const handleLocalMode = (apiKey: string) => {
    localStorage.setItem('isLocalMode', 'true');
    localStorage.setItem('localApiKey', apiKey);
    setLocalApiKey(apiKey);
    setIsLocalMode(true);
    // Remove auth tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail('');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserEmail('');
    setIsLocalMode(false);
    setResults([]);
    setCookies([]);
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) return;
    setIsAnalyzing(true);
    
    // Determine active cookie
    const activeCookie = cookies.find(c => c.status === 'active');

    if (!activeCookie) {
       alert("无可用 Cookie，请先在资产管理中添加。");
       setIsAnalyzing(false);
       return;
    }

    try {
      const payload: any = { url: urlInput };
      const headers: any = { 'Content-Type': 'application/json' };

      if (isLocalMode) {
         payload.gemini_api_key = localApiKey;
         payload.cookie_value = activeCookie.value;
      } else {
         headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.detail || "分析失败");
      }
      
      const data = await res.json();
      
      const newResult: ScrapeResult = {
        id: data.data.id.toString(),
        status: 'completed',
        scrapedAt: new Date().toISOString(),
        note: {
           id: `n_${Date.now()}`,
           title: data.data.title,
           content: data.data.content,
           url: data.data.original_url,
           coverImage: data.data.cover_image,
           stats: data.data.stats_json || { likes: 0, collects: 0, comments: 0, shares: 0 },
           author: data.data.author_json || { name: 'Unknown', avatar: '', followers: 0 },
           postedAt: '刚刚'
        },
        analysis: {
           viralReasons: data.data.ai_viral_reasons,
           improvements: data.data.ai_improvements,
           userPsychology: data.data.ai_psychology,
           tags: ['AI']
        }
      };

      setResults(prev => [newResult, ...prev]);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsAnalyzing(false);
      setUrlInput('');
    }
  };

  const handleRewrite = (noteId: string) => {
    setIsRewriting(true);
    setTimeout(() => { 
        setResults(prev => prev.map(r => {
            if (r.note.id === noteId && r.analysis) {
                return {
                    ...r,
                    analysis: {
                        ...r.analysis,
                        rewriteSuggestion: `**重写标题: ${r.note.title} (爆款版)**\n\n这是 AI 基于原笔记逻辑生成的全新文案草稿...`
                    }
                }
            }
            return r;
        }));
        
        // Update viewing result if open
        setViewingResult(current => {
             if (current && current.note.id === noteId && current.analysis) {
                 return {
                     ...current,
                     analysis: {
                         ...current.analysis,
                         rewriteSuggestion: `**重写标题: ${current.note.title} (爆款版)**\n\n这是 AI 基于原笔记逻辑生成的全新文案草稿...`
                     }
                 }
             }
             return current;
        });

        setIsRewriting(false); 
    }, 1500);
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedIds.size} 项吗?`)) {
      setResults(prevResults => prevResults.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSingle = (id: string) => {
      if (window.confirm('确定要删除这条笔记吗?')) {
          setResults(prevResults => prevResults.filter(r => r.id !== id));
          if (selectedIds.has(id)) {
              const newSet = new Set(selectedIds);
              newSet.delete(id);
              setSelectedIds(newSet);
          }
      }
  };

  const handleAddCookie = async (value: string, note: string) => {
    if (isLocalMode) {
       // Local Mode: Save to State/LocalStorage
       const newCookie: Cookie = { 
         id: Date.now().toString(), 
         value, 
         note, 
         status: 'active', 
         lastUsed: '-' 
       };
       setCookies([...cookies, newCookie]);
    } else if (token) {
       // Server Mode
       try {
         await fetch('/api/cookies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ value, note })
         });
         setCookies([...cookies, { id: Date.now().toString(), value, note, status: 'active', lastUsed: '-' }]);
       } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {(!token && !isLocalMode) && <AuthModal onLogin={handleLogin} onLocalMode={handleLocalMode} />}

      {/* Sidebar */}
      <Sidebar 
        folders={MOCK_FOLDERS}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onOpenCookies={() => setIsCookieModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-8 transition-all duration-300 ease-in-out`}>
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-gray-800">
             {MOCK_FOLDERS.find(f => f.id === activeFolder)?.name || '仪表盘'}
           </h2>
           <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${cookies.some(c => c.status === 'active') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <span className="text-xs font-medium text-gray-600">
                   系统状态: {cookies.some(c => c.status === 'active') ? '就绪' : 'Cookie缺失'}
                 </span>
              </div>
           </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8 transition-all focus-within:ring-2 focus-within:ring-xhs-red/20">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新建分析
          </label>
          <div className="flex gap-3">
             <div className="relative flex-1">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <i className="fa-solid fa-link text-gray-400"></i>
               </div>
               <input
                 type="text"
                 className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-xhs-red focus:ring-1 focus:ring-xhs-red sm:text-sm"
                 placeholder="粘贴小红书笔记链接 (支持短链)..."
                 value={urlInput}
                 onChange={(e) => setUrlInput(e.target.value)}
               />
             </div>
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing || !urlInput}
               className="px-6 py-3 bg-xhs-red text-white font-medium rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200 transition-all flex items-center gap-2"
             >
               {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
               立即分析
             </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <i className="fa-solid fa-info-circle"></i> 支持小红书完整链接及分享短链。
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <span className="text-sm text-gray-500 font-medium">{filteredResults.length} 条记录</span>
             {selectedIds.size > 0 && (
               <div className="flex items-center gap-2 ml-4 animate-fade-in">
                 <span className="text-xs text-xhs-red bg-red-50 px-2 py-1 rounded border border-red-100">
                   已选 {selectedIds.size}
                 </span>
                 <button 
                  onClick={handleBulkDelete}
                  className="text-xs text-gray-500 hover:text-red-600 underline"
                 >
                   删除选中
                 </button>
               </div>
             )}
          </div>
          
          <div className="flex gap-2">
             <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-xhs-red focus:border-xhs-red">
               <option>按时间排序 (最新)</option>
               <option>按点赞排序</option>
             </select>
          </div>
        </div>

        {/* Grid Results */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-3"></i>
             <p className="text-gray-500">该分类下暂无笔记。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map(result => (
              <ResultCard 
                key={result.id} 
                result={result}
                selected={selectedIds.has(result.id)}
                onSelect={() => handleToggleSelect(result.id)}
                onClick={() => setViewingResult(result)}
                onDelete={() => handleDeleteSingle(result.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modals */}
      <CookieManager 
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
        cookies={cookies}
        onAddCookie={handleAddCookie}
        onRemoveCookie={(id) => setCookies(cookies.filter(c => c.id !== id))}
      />

      <NoteDetail 
        result={viewingResult}
        onClose={() => setViewingResult(null)}
        onRewrite={handleRewrite}
        isRewriting={isRewriting}
      />

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
};

export default App;