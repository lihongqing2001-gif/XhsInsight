import React, { useState } from 'react';
import { ScrapeResult, AIAnalysis } from '../types';

interface NoteDetailProps {
  result: ScrapeResult | null;
  onClose: () => void;
  onRewrite: (noteId: string) => void;
  isRewriting: boolean;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ result, onClose, onRewrite, isRewriting }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'rewrite'>('analysis');

  if (!result) return null;

  const { note, analysis } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        
        {/* Left Column: Original Content (Scrollable) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
           <div className="p-4 bg-white border-b flex items-center gap-3 sticky top-0 z-10">
              <button onClick={onClose} className="md:hidden text-gray-500">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h3 className="font-bold text-gray-800">原笔记内容</h3>
           </div>
           
           <div className="overflow-y-auto flex-1 p-6">
              <img src={note.coverImage} alt="Cover" className="w-full rounded-lg shadow-sm mb-4" />
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">{note.title}</h2>
              
              <div className="flex items-center gap-3 mb-6">
                <img src={note.author.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                <div>
                   <p className="text-sm font-medium">{note.author.name}</p>
                   <p className="text-xs text-gray-500">{note.postedAt}</p>
                </div>
              </div>

              <div className="prose prose-sm text-gray-700 whitespace-pre-wrap mb-8">
                {note.content}
              </div>

              <a 
                href={note.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center w-full py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                跳转至小红书原文 <i className="fa-solid fa-external-link-alt ml-2"></i>
              </a>
           </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="w-2/3 flex flex-col bg-white">
          {/* Header */}
          <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
             <div className="flex gap-6">
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className={`relative h-16 text-sm font-medium transition-colors ${
                    activeTab === 'analysis' ? 'text-xhs-red border-b-2 border-xhs-red' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fa-solid fa-brain mr-2"></i>
                  AI 深度洞察
                </button>
                <button 
                  onClick={() => setActiveTab('rewrite')}
                  className={`relative h-16 text-sm font-medium transition-colors ${
                    activeTab === 'rewrite' ? 'text-xhs-red border-b-2 border-xhs-red' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fa-solid fa-pen-fancy mr-2"></i>
                  AI 仿写助手
                </button>
             </div>
             
             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
               <i className="fa-solid fa-times text-lg"></i>
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'analysis' ? (
              analysis ? (
                <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                  
                  {/* Viral Reasons */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                      <i className="fa-solid fa-fire mr-2"></i> 爆款归因分析
                    </h3>
                    <ul className="space-y-3">
                      {analysis.viralReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-red-600 flex items-center justify-center text-xs font-bold shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Psychology */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <i className="fa-solid fa-user-group mr-2 text-indigo-500"></i> 用户心理画像
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {analysis.userPsychology}
                      </p>
                    </div>

                    {/* Improvements */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <i className="fa-solid fa-arrow-trend-up mr-2 text-green-500"></i> 改进建议
                      </h3>
                       <ul className="space-y-2">
                        {analysis.improvements.map((imp, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <i className="fa-solid fa-check text-green-500 mt-1 text-xs"></i>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Export Button */}
                  <div className="flex justify-end pt-4">
                     <button className="text-sm text-gray-500 hover:text-gray-800 underline">
                       导出分析报告 (PDF)
                     </button>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <i className="fa-solid fa-robot text-4xl mb-4 text-gray-300"></i>
                  <p>暂无分析数据</p>
                </div>
              )
            ) : (
              // Rewrite Tab
              <div className="max-w-3xl mx-auto">
                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100 mb-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">AI 创意仿写</h3>
                    <p className="text-sm text-purple-700 mb-4">
                      基于该笔记的爆款逻辑，为您生成一篇全新的原创草稿。
                    </p>
                    
                    {!analysis?.rewriteSuggestion ? (
                      <button 
                        onClick={() => onRewrite(note.id)}
                        disabled={isRewriting}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-black transition-all disabled:opacity-70 flex items-center gap-2"
                      >
                        {isRewriting ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i> 正在创作中...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i> 生成新草稿
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100 mt-4">
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                          {analysis.rewriteSuggestion}
                        </pre>
                        <div className="mt-4 flex gap-3">
                          <button 
                            className="text-xs text-purple-600 font-medium hover:underline"
                            onClick={() => {navigator.clipboard.writeText(analysis.rewriteSuggestion || '')}}
                          >
                            <i className="fa-regular fa-copy mr-1"></i> 复制内容
                          </button>
                           <button 
                            className="text-xs text-gray-500 hover:text-gray-800"
                            onClick={() => onRewrite(note.id)}
                          >
                            <i className="fa-solid fa-rotate mr-1"></i> 重新生成
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;