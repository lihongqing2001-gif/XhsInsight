import React from 'react';
import { ScrapeResult } from '../types';

interface ResultCardProps {
  result: ScrapeResult;
  onClick: () => void;
  onDelete: () => void;
  selected: boolean;
  onSelect: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClick, onDelete, selected, onSelect }) => {
  const { note, analysis } = result;
  
  // Format numbers (e.g. 12500 -> 12.5k)
  const formatNum = (num: number) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  return (
    <div 
      className={`relative group bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
        selected ? 'border-xhs-red ring-1 ring-xhs-red' : 'border-gray-200'
      }`}
    >
      {/* Checkbox Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-5 h-5 rounded border-gray-300 text-xhs-red focus:ring-xhs-red cursor-pointer"
        />
      </div>

      {/* Delete Action - Always visible on mobile, hover on desktop */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          // console.log('Delete button clicked');
          onDelete(); 
        }}
        className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-white/90 p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
        title="删除笔记"
      >
        <i className="fa-solid fa-trash-can"></i>
      </button>

      {/* Clickable Area */}
      <div onClick={onClick} className="cursor-pointer">
        {/* Image Section */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
          <img 
            src={note.coverImage} 
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          {/* Status Badge */}
          {result.status === 'analyzing' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i>
                <span className="text-xs font-medium">AI 分析中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 h-10 leading-snug">
            {note.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <img src={note.author.avatar} className="w-5 h-5 rounded-full" alt="" />
                <span className="text-xs text-gray-500 truncate max-w-[80px]">{note.author.name}</span>
             </div>
             <span className="text-xs text-gray-400">{note.postedAt}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-50">
            <div className="flex flex-col items-center">
              <i className="fa-regular fa-heart text-gray-400 text-xs mb-1"></i>
              <span className="text-xs font-bold text-gray-700">{formatNum(note.stats.likes)}</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fa-regular fa-star text-gray-400 text-xs mb-1"></i>
              <span className="text-xs font-bold text-gray-700">{formatNum(note.stats.collects)}</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fa-regular fa-comment text-gray-400 text-xs mb-1"></i>
              <span className="text-xs font-bold text-gray-700">{formatNum(note.stats.comments)}</span>
            </div>
          </div>

          {/* AI Tag */}
          {analysis && (
            <div className="mt-3 pt-2 border-t border-gray-50 flex flex-wrap gap-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                AI 洞察
              </span>
              {analysis.tags.slice(0, 1).map(tag => (
                 <span key={tag} className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                   {tag}
                 </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;