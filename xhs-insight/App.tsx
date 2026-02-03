import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Search, Plus, Download, HelpCircle, User as UserIcon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CookieManager } from './components/CookieManager';
import { Button } from './components/Button';
import { AnalysisDetail } from './components/AnalysisDetail';
import { Cookie, CookieStatus, Note, Group, DashboardMetrics } from './types';

// --- MOCK DATA FOR DEMO ---
const MOCK_COOKIES: Cookie[] = [
  { id: '1', value: 'session=abc; other=xyz;', status: CookieStatus.Active, lastUsed: '2023-10-27 10:00', failureCount: 0 },
  { id: '2', value: 'session=dead; other=beef;', status: CookieStatus.Invalid, lastUsed: '2023-10-26 15:30', failureCount: 3 }
];

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Makeup Competitors', count: 12 },
  { id: 'g2', name: 'Copywriting Inspiration', count: 5 }
];

const MOCK_METRICS: DashboardMetrics = {
  totalNotes: 42,
  avgLikes: 1540,
  activeCookies: 1,
  topKeywords: []
};

const MOCK_NOTES: Note[] = [
  {
    id: 'n1',
    url: 'https://www.xiaohongshu.com/explore/123',
    title: '5 Tips needed for Winter Makeup',
    content: 'Here are the essential tips for staying glowing in winter... Use heavy moisturizer...',
    author: 'BeautyGuru_Alice',
    images: ['https://picsum.photos/400/400'],
    stats: { likes: 5200, collects: 1200, comments: 340, shares: 100 },
    group: 'g1',
    crawledAt: '2023-10-27',
    analysis: {
        viralReasons: ['High contrast cover image', 'Step-by-step clear instructions', 'Seasonal relevance'],
        improvements: ['Add more specific product names', 'Use emojis in title'],
        userPsychology: 'Users are feeling dry skin anxiety due to weather change and looking for quick fixes.',
        summary: 'Excellent seasonal content.'
    }
  },
  {
    id: 'n2',
    url: 'https://www.xiaohongshu.com/explore/456',
    title: 'Why my life changed after waking up at 5AM',
    content: 'Productivity hacks that actually work. 1. Drink water. 2. Meditate...',
    author: 'SelfImprove_Daily',
    images: ['https://picsum.photos/400/401'],
    stats: { likes: 12000, collects: 5000, comments: 800, shares: 2000 },
    group: 'g2',
    crawledAt: '2023-10-26',
    analysis: {
        viralReasons: ['Aspirational lifestyle', 'Controversial topic (5AM club)', 'Clean aesthetic'],
        improvements: ['Title is a bit clickbaity', 'Add video content'],
        userPsychology: 'Appeal to users wanting control over their chaotic lives.',
        summary: 'Strong lifestyle piece.'
    }
  }
];

export default function App() {
  const [cookies, setCookies] = useState<Cookie[]>(MOCK_COOKIES);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---
  const handleAddCookie = (val: string) => {
    const newCookie: Cookie = {
        id: Date.now().toString(),
        value: val,
        status: CookieStatus.Active,
        lastUsed: 'Never',
        failureCount: 0
    };
    setCookies([...cookies, newCookie]);
  };

  const handleDeleteCookie = (id: string) => {
    setCookies(cookies.filter(c => c.id !== id));
  };

  const handleAnalyze = () => {
    if (!inputUrl) return;
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
        const newNote: Note = {
            id: Date.now().toString(),
            url: inputUrl,
            title: 'New Analyzed Note (Simulated)',
            content: 'This content was scraped from ' + inputUrl,
            author: 'Unknown',
            images: ['https://picsum.photos/400/402'],
            stats: { likes: 0, collects: 0, comments: 0, shares: 0 },
            group: selectedGroupId || 'g1',
            crawledAt: new Date().toLocaleDateString(),
            analysis: {
                viralReasons: ['Pending real analysis...'],
                improvements: ['Connect backend to see real results'],
                userPsychology: 'N/A',
                summary: 'Mock Data'
            }
        };
        setNotes([newNote, ...notes]);
        setInputUrl('');
        setIsProcessing(false);
    }, 1500);
  };

  const filteredNotes = selectedGroupId 
    ? notes.filter(n => n.group === selectedGroupId) 
    : notes;

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#F8F9FA] text-gray-800 font-sans pb-20">
        
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-xhs-red text-white p-1.5 rounded-lg font-bold text-lg">XI</div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">XHS-Insight</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 cursor-pointer">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Top Section: Cookies & Dashboard */}
          <div className="mb-8 space-y-8">
            <CookieManager 
                cookies={cookies} 
                onAddCookie={handleAddCookie} 
                onDeleteCookie={handleDeleteCookie}
            />
            
            <Dashboard 
                groups={MOCK_GROUPS} 
                metrics={{...MOCK_METRICS, activeCookies: cookies.filter(c => c.status === CookieStatus.Active).length}}
                selectedGroupId={selectedGroupId}
                onSelectGroup={setSelectedGroupId}
            />
          </div>

          {/* Analysis Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">New Analysis</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input 
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-xhs-red focus:border-transparent transition-shadow" 
                        placeholder="Paste XiaoHongShu note links here (supports multiple)..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <div className="w-full md:w-48">
                     <select 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-xhs-red focus:border-transparent"
                        value={selectedGroupId || ''}
                        onChange={(e) => setSelectedGroupId(e.target.value || null)}
                     >
                        <option value="">No Group</option>
                        {MOCK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                     </select>
                </div>
                <Button size="lg" onClick={handleAnalyze} isLoading={isProcessing}>
                    Analyze
                </Button>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    {selectedGroupId ? `${MOCK_GROUPS.find(g => g.id === selectedGroupId)?.name}` : 'Recent Analysis'}
                </h2>
                <div className="flex gap-2">
                     <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                     </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map(note => (
                    <div 
                        key={note.id} 
                        onClick={() => setSelectedNote(note)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="relative h-48 bg-gray-100">
                             <img src={note.images[0]} alt={note.title} className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {note.crawledAt}
                             </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-xhs-red transition-colors">
                                {note.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-4 border-t border-gray-50 pt-3">
                                <span className="flex items-center gap-1"><span className="text-red-500">♥</span> {note.stats.likes}</span>
                                <span className="flex items-center gap-1">★ {note.stats.collects}</span>
                                <span className="flex items-center gap-1">💬 {note.stats.comments}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </main>

        {/* Deep View Modal */}
        {selectedNote && (
            <AnalysisDetail note={selectedNote} onClose={() => setSelectedNote(null)} />
        )}

      </div>
    </HashRouter>
  );
}