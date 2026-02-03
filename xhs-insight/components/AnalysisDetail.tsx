import React, { useState } from 'react';
import { Note } from '../types';
import { X, ExternalLink, ThumbsUp, Star, MessageSquare, PenTool, BarChart2 } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AnalysisDetailProps {
  note: Note;
  onClose: () => void;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ note, onClose }) => {
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'rewrite'>('analysis');

  const handleRewrite = async (tone: 'professional' | 'emotional' | 'humorous') => {
    setIsRewriting(true);
    const result = await geminiService.rewriteContent(note, tone);
    setRewriteResult(result);
    setIsRewriting(false);
    setActiveTab('rewrite');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 truncate max-w-md">{note.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> {note.stats.likes}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3"/> {note.stats.collects}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {note.stats.comments}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href={note.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-xhs-red bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open Original
            </a>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left: Content Preview */}
          <div className="w-1/3 border-r border-gray-100 overflow-y-auto bg-gray-50 p-6 hidden md:block">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Original Note</h3>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              {note.images.length > 0 && (
                <img src={note.images[0]} alt="Cover" className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <h1 className="font-bold text-lg mb-2">{note.title}</h1>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          </div>

          {/* Right: Analysis & Tools */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Tabs */}
             <div className="flex border-b border-gray-100 px-6">
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-xhs-red text-xhs-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4"/> AI Analysis
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('rewrite')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rewrite' ? 'border-xhs-red text-xhs-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4"/> AI Rewrite Lab
                  </div>
                </button>
             </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'analysis' ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Viral Reasons */}
                  <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                    <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      🔥 Viral Attribution
                    </h3>
                    <ul className="space-y-2">
                      {note.analysis?.viralReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      💡 Optimization Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {note.analysis?.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                           <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                           {imp}
                        </li>
                      ))}
                    </ul>
                  </div>

                   {/* Psychology */}
                   <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                    <h3 className="font-semibold text-purple-900 mb-3">🧠 User Psychology</h3>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {note.analysis?.userPsychology}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button variant="secondary" onClick={() => handleRewrite('emotional')} disabled={isRewriting}>
                      ❤️ Emotional Resonance
                    </Button>
                    <Button variant="secondary" onClick={() => handleRewrite('professional')} disabled={isRewriting}>
                      👔 Dry/Professional
                    </Button>
                    <Button variant="secondary" onClick={() => handleRewrite('humorous')} disabled={isRewriting}>
                      😄 Fun/Meme
                    </Button>
                  </div>

                  {isRewriting && (
                     <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="w-8 h-8 border-4 border-xhs-red border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>AI is analyzing the viral structure and rewriting...</p>
                     </div>
                  )}

                  {!isRewriting && rewriteResult && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Draft Result</h3>
                       <div className="prose prose-sm max-w-none text-gray-700">
                          <ReactMarkdown>{rewriteResult}</ReactMarkdown>
                       </div>
                       <div className="mt-6 flex justify-end">
                          <Button onClick={() => navigator.clipboard.writeText(rewriteResult)}>Copy to Clipboard</Button>
                       </div>
                    </div>
                  )}
                  
                  {!isRewriting && !rewriteResult && (
                    <div className="text-center py-12 text-gray-400">
                      Select a tone above to generate a new version of this note based on its success factors.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};