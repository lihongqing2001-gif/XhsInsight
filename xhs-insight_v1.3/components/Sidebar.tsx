import React from 'react';
import { Folder } from '../types';

interface SidebarProps {
  folders: Folder[];
  activeFolder: string;
  onSelectFolder: (id: string) => void;
  onOpenCookies: () => void;
  onOpenHelp: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  userEmail?: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  folders, 
  activeFolder, 
  onSelectFolder, 
  onOpenCookies,
  onOpenHelp,
  isCollapsed,
  onToggle,
  userEmail,
  onLogout
}) => {
  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 transition-all duration-300 ease-in-out shadow-sm`}
    >
      {/* Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-gray-100`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
             <h1 className="text-xl font-bold text-xhs-red flex items-center gap-2 whitespace-nowrap">
              <i className="fa-solid fa-bolt"></i>
              XHS-Insight
            </h1>
          </div>
        )}
        <button 
          onClick={onToggle}
          className={`text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? '' : ''}`}
          title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-angles-right text-xl' : 'fa-bars-staggered'}`}></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        
        {/* Library Section */}
        {!isCollapsed && (
          <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider animate-fade-in">
            资源库
          </div>
        )}
        <nav className="space-y-1 px-3">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-3 text-sm font-medium rounded-lg transition-colors ${
                activeFolder === folder.id
                  ? 'bg-red-50 text-xhs-red'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={isCollapsed ? folder.name : ''}
            >
              <i className={`fa-solid ${folder.icon} ${isCollapsed ? 'text-lg' : 'w-6'}`}></i>
              {!isCollapsed && <span className="ml-2 whitespace-nowrap">{folder.name}</span>}
            </button>
          ))}
        </nav>

        {/* Management Section */}
        <div className={`mt-8 mb-2 ${isCollapsed ? 'hidden' : 'px-6'} text-xs font-semibold text-gray-400 uppercase tracking-wider`}>
          系统管理
        </div>
        {isCollapsed && <div className="mt-8 border-t border-gray-100 my-2 mx-4"></div>}
        
        <nav className="space-y-1 px-3">
          <button 
            onClick={onOpenCookies}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50`}
            title={isCollapsed ? "Cookie 资产" : ""}
          >
            <i className={`fa-solid fa-cookie-bite ${isCollapsed ? 'text-lg' : 'w-6'}`}></i>
            {!isCollapsed && <span className="ml-2 whitespace-nowrap">Cookie 资产</span>}
          </button>
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
         {!isCollapsed ? (
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-xhs-red text-white flex items-center justify-center font-bold text-xs">
               {userEmail ? userEmail.substring(0,2).toUpperCase() : 'L'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-medium text-gray-900 truncate">{userEmail || 'Local Mode'}</p>
               <button onClick={onLogout} className="text-[10px] text-gray-500 hover:text-red-500">退出登录</button>
             </div>
             <button onClick={onOpenHelp} className="text-gray-400 hover:text-gray-600">
               <i className="fa-regular fa-circle-question"></i>
             </button>
           </div>
         ) : (
           <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-xhs-red text-white flex items-center justify-center font-bold text-xs cursor-pointer" title={userEmail}>
                {userEmail ? userEmail.substring(0,1).toUpperCase() : 'L'}
              </div>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default Sidebar;