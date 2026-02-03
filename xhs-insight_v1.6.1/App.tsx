import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CookieManager from './components/CookieManager';
import ResultCard from './components/ResultCard';
import NoteDetail from './components/NoteDetail';
import AuthModal from './components/AuthModal';
import { MOCK_RESULTS, MOCK_FOLDERS, MOCK_COOKIES } from './services/mockData';
import { ScrapeResult, Cookie, Folder } from './types';

// Help Modal Component with Diagnostics
const HelpModal = ({ onClose }: { onClose: () => void }) => {
  const [testStatus, setTestStatus] = useState<string>('');
  const [testLoading, setTestLoading] = useState(false);

  const runDiagnostics = async () => {
    setTestLoading(true);
    setTestStatus('正在连接后端 /api/health ...');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setTestStatus(`✅ 连接成功!\n后端状态: ${data.status}\nPython版本: ${data.python_version || 'Unknown'}`);
      } else {
        const text = await res.text();
        setTestStatus(`❌ 连接失败 (Status ${res.status}):\n${text.substring(0, 100)}`);
      }
    } catch (e: any) {
      setTestStatus(`❌ 网络错误: ${e.message}\n请检查后端服务是否启动。`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">如何使用 & 系统诊断</h2>
        
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2">使用指南</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
            <li><strong>第一步:</strong> 进入“Cookie 资产”并粘贴有效的小红书网页版 Cookie。</li>
            <li><strong>第二步:</strong> 在输入框中粘贴笔记链接（支持批量粘贴，自动提取链接）。</li>
            <li><strong>第三步:</strong> 点击“立即分析”。</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-bold text-gray-800 mb-2">故障排查 (Diagnostics)</h3>
          <p className="text-xs text-gray-500 mb-3">如果遇到“分析失败”或 Vercel 404 错误，请点击下方按钮测试后端连接。</p>
          
          <button 
            onClick={runDiagnostics} 
            disabled={testLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm font-medium border border-gray-300 flex items-center gap-2"
          >
            {testLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-stethoscope"></i>}
            测试后端连接 (/api/health)
          </button>

          {testStatus && (
            <div className="mt-3 p-3 bg-gray-900 text-green-400 font-mono text-xs rounded whitespace-pre-wrap">
              {testStatus}
            </div>
          )}
        </div>

        <button onClick={onClose} className="mt-6 w-full py-3 bg-xhs-red text-white rounded-lg font-medium hover:bg-red-600">关闭</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string>(localStorage.getItem('userEmail') || '');
  const [isLocalMode, setIsLocalMode] = useState<boolean>(localStorage.getItem('isLocalMode') === 'true');
  const [localApiKey, setLocalApiKey] = useState<string>(localStorage.getItem('localApiKey') || '');

  // App State
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('userFolders');
    return saved ? JSON.parse(saved) : MOCK_FOLDERS;
  });
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [urlInput, setUrlInput] = useState('');
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  
  // Modals
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<ScrapeResult | null>(null);
  
  // Processing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<string>(''); // For batch progress
  const [isRewriting, setIsRewriting] = useState(false);

  // Initialization
  useEffect(() => {
    if (isLocalMode) {
       const localResults = JSON.parse(localStorage.getItem('localResults') || '[]');
       const localCookies = JSON.parse(localStorage.getItem('localCookies') || '[]');
       setResults(localResults.length ? localResults : MOCK_RESULTS);
       setCookies(localCookies.length ? localCookies : MOCK_COOKIES);
    } else if (token) {
       setResults(MOCK_RESULTS); 
       setCookies(MOCK_COOKIES);
    }
  }, [token, isLocalMode]);

  // Persist Data
  useEffect(() => {
    if (isLocalMode) {
      localStorage.setItem('localResults', JSON.stringify(results));
      localStorage.setItem('localCookies', JSON.stringify(cookies));
    }
  }, [results, cookies, isLocalMode]);

  useEffect(() => {
    localStorage.setItem('userFolders', JSON.stringify(folders));
  }, [folders]);

  // Filter Logic
  const filteredResults = activeFolder === 'all' 
    ? results 
    : results.filter(r => r.note.groupId === activeFolder);

  // --- Handlers ---

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
    setFolders(MOCK_FOLDERS); // Reset folders too? Optional.
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) return;
    
    // Extract URLs (Regex for http/https)
    const foundUrls = urlInput.match(/https?:\/\/[^\s,，"']+/g);
    
    if (!foundUrls || foundUrls.length === 0) {
      alert("未能识别出有效的链接，请检查输入。");
      return;
    }

    const uniqueUrls = [...new Set(foundUrls)]; // Deduplicate
    
    setIsAnalyzing(true);
    setAnalyzeProgress(`准备分析 ${uniqueUrls.length} 条笔记...`);
    
    const activeCookie = cookies.find(c => c.status === 'active');
    if (!activeCookie) {
       alert("无可用 Cookie，请先在资产管理中添加。");
       setIsAnalyzing(false);
       setAnalyzeProgress('');
       return;
    }

    // Process URLs sequentially
    for (let i = 0; i < uniqueUrls.length; i++) {
        const currentUrl = uniqueUrls[i];
        setAnalyzeProgress(`正在分析 (${i + 1}/${uniqueUrls.length}): 抓取数据中...`);

        try {
          const payload: any = { url: currentUrl, group_id: activeFolder === 'all' ? undefined : activeFolder };
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
             const contentType = res.headers.get("content-type");
             let errorDetail = "未知错误";
             
             if (contentType && contentType.indexOf("application/json") !== -1) {
                const err = await res.json();
                errorDetail = err.detail || JSON.stringify(err);
             } else {
                const text = await res.text();
                // If it's HTML (Vercel 404/500), take a snippet
                errorDetail = `Server Error (${res.status}): ${text.substring(0, 150)}...`;
             }
             
             console.error(`Link ${i+1} failed:`, errorDetail);
             alert(`链接 ${i+1} 分析失败: ${errorDetail}`);
             continue; 
          }
          
          const data = await res.json();
          
          const newResult: ScrapeResult = {
            id: data.data.id.toString(),
            status: 'completed',
            scrapedAt: new Date().toISOString(),
            note: {
               id: `n_${Date.now()}_${i}`,
               title: data.data.title,
               content: data.data.content,
               url: data.data.original_url,
               coverImage: data.data.cover_image,
               stats: data.data.stats_json || { likes: 0, collects: 0, comments: 0, shares: 0 },
               author: data.data.author_json || { name: 'Unknown', avatar: '', followers: 0 },
               postedAt: '刚刚',
               groupId: activeFolder === 'all' ? undefined : activeFolder
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
          console.error(`Error processing ${currentUrl}:`, e.message);
          alert(`请求异常: ${e.message}`);
        }
    }

    setIsAnalyzing(false);
    setAnalyzeProgress('');
    setUrlInput('');
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
        setViewingResult(current => {
             if (current && current.note.id === noteId && current.analysis) {
                 return { ...current, analysis: { ...current.analysis, rewriteSuggestion: `**重写标题: ${current.note.title} (爆款版)**\n\n这是 AI 基于原笔记逻辑生成的全新文案草稿...` } }
             }
             return current;
        });
        setIsRewriting(false); 
    }, 1500);
  };

  // Folder Management
  const handleAddFolder = () => {
    const name = prompt("请输入新文件夹名称:");
    if (name) {
      const newFolder: Folder = {
        id: `f_${Date.now()}`,
        name,
        icon: 'fa-folder'
      };
      setFolders([...folders, newFolder]);
    }
  };

  const handleDeleteFolder = (id: string) => {
    if (id === 'all') return;
    if (window.confirm("确定删除该文件夹吗？文件夹内的笔记将保留，但不再属于该分类。")) {
      setFolders(folders.filter(f => f.id !== id));
      if (activeFolder === id) setActiveFolder('all');
      // Reset groupId for notes in this folder
      setResults(prev => prev.map(r => r.note.groupId === id ? { ...r, note: { ...r.note, groupId: undefined } } : r));
    }
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
    const newCookieObj: Cookie = { id: Date.now().toString(), value, note, status: 'active', lastUsed: '-' };
    
    if (isLocalMode) {
       setCookies([...cookies, newCookieObj]);
    } else if (token) {
       try {
         await fetch('/api/cookies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ value, note })
         });
         setCookies([...cookies, newCookieObj]);
       } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 overflow-hidden">
      
      {(!token && !isLocalMode) && <AuthModal onLogin={handleLogin} onLocalMode={handleLocalMode} />}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
         <div className="flex items-center gap-2">
            <i className="fa-solid fa-bolt text-xhs-red"></i>
            <span className="font-bold text-lg text-gray-800">XHS-Insight</span>
         </div>
         <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 p-2">
            <i className="fa-solid fa-bars text-xl"></i>
         </button>
      </div>

      {/* Sidebar (Responsive) */}
      <Sidebar 
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={(id) => { setActiveFolder(id); setIsSidebarOpen(false); }}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        onOpenCookies={() => { setIsCookieModalOpen(true); setIsSidebarOpen(false); }}
        onOpenHelp={() => setIsHelpOpen(true)}
        
        // Desktop State
        isCollapsed={isDesktopSidebarCollapsed}
        onToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
        
        // Mobile State
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto pt-20 md:pt-8 px-4 md:px-8 pb-8
          ${isDesktopSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        
        {/* Top Header (Desktop Only for Title) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
           <h2 className="text-2xl font-bold text-gray-800 hidden md:block">
             {folders.find(f => f.id === activeFolder)?.name || '仪表盘'}
           </h2>
           {/* Mobile Title */}
           <h2 className="text-xl font-bold text-gray-800 md:hidden">
             {folders.find(f => f.id === activeFolder)?.name || '仪表盘'}
           </h2>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 flex-1 md:flex-initial">
                 <div className={`w-2 h-2 rounded-full ${cookies.some(c => c.status === 'active') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <span className="text-xs font-medium text-gray-600 truncate">
                   系统状态: {cookies.some(c => c.status === 'active') ? '就绪' : 'Cookie缺失'}
                 </span>
              </div>
           </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 mb-6 md:mb-8 transition-all focus-within:ring-2 focus-within:ring-xhs-red/20">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新建分析
          </label>
          <div className="flex flex-col md:flex-row gap-3">
             <div className="relative flex-1">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <i className="fa-solid fa-link text-gray-400"></i>
               </div>
               <input
                 type="text"
                 className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-xhs-red focus:ring-1 focus:ring-xhs-red sm:text-sm"
                 placeholder="粘贴链接（支持批量，例如：复制多段小红书分享文本）..."
                 value={urlInput}
                 onChange={(e) => setUrlInput(e.target.value)}
               />
             </div>
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing || !urlInput}
               className="w-full md:w-auto px-6 py-3 bg-xhs-red text-white font-medium rounded-xl hover:bg-red-600 focus:outline-none disabled:opacity-50 shadow-md shadow-red-200 flex items-center justify-center gap-2"
             >
               {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
               {isAnalyzing && analyzeProgress ? '处理中...' : '立即分析'}
             </button>
          </div>
          {isAnalyzing && analyzeProgress && (
             <p className="mt-2 text-xs text-xhs-red font-medium animate-pulse">
               {analyzeProgress}
             </p>
          )}
          {!isAnalyzing && (
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <i className="fa-solid fa-info-circle"></i> 支持批量粘贴。系统将自动提取文本中的所有 http/https 链接。
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
             <span className="text-sm text-gray-500 font-medium">{filteredResults.length} 条记录</span>
             {selectedIds.size > 0 && (
               <div className="flex items-center gap-2 ml-auto md:ml-4 animate-fade-in">
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
        </div>

        {/* Grid Results */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-3"></i>
             <p className="text-gray-500">该分类下暂无笔记。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20">
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