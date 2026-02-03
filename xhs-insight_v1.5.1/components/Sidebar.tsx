import React from 'react';
import { Folder } from '../types';

interface SidebarProps {
  folders: Folder[];
  activeFolder: string;
  onSelectFolder: (id: string) => void;
  onAddFolder: () => void;
  onDeleteFolder: (id: string) => void;
  
  onOpenCookies: () => void;
  onOpenHelp: () => void;
  
  // Desktop
  isCollapsed: boolean;
  onToggle: () => void;
  
  // Mobile
  isOpen: boolean;
  onClose: () => void;
  
  userEmail?: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  folders, 
  activeFolder, 
  onSelectFolder, 
  onAddFolder,
  onDeleteFolder,
  onOpenCookies,
  onOpenHelp,
  isCollapsed,
  onToggle,
  isOpen,
  onClose,
  userEmail,
  onLogout
}) => {
  
  // Base Classes
  const mobileClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out shadow-2xl ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } md:hidden`;

  const desktopClasses = `hidden md:flex flex-col fixed left-0 top-0 h-screen border-r border-gray-200 bg-white z-10 transition-all duration-300 ease-in-out shadow-sm ${
    isCollapsed ? 'w-20' : 'w-64'
  }`;

  const Content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-gray-100 shrink-0`}>
        {(!isCollapsed || isOpen) && (
          <div className="flex items-center gap-2 overflow-hidden">
             <h1 className="text-xl font-bold text-xhs-red flex items-center gap-2 whitespace-nowrap">
              <i className="fa-solid fa-bolt"></i>
              XHS-Insight
            </h1>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden text-gray-500 p-2">
           <i className="fa-solid fa-times text-xl"></i>
        </button>

        {/* Desktop Collapse Button */}
        <button 
          onClick={onToggle}
          className={`hidden md:block text-gray-400 hover:text-gray-600 transition-colors`}
          title={isCollapsed ? "展开" : "收起"}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-angles-right text-xl' : 'fa-bars-staggered'}`}></i>
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        
        {/* Library Section */}
        {(!isCollapsed || isOpen) && (
          <div className="px-6 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">资源库</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onAddFolder(); }}
              className="text-xs text-xhs-red hover:bg-red-50 px-2 py-1 rounded transition-colors"
              title="新建文件夹"
            >
              <i className="fa-solid fa-plus mr-1"></i>新建
            </button>
          </div>
        )}
        
        <nav className="space-y-1 px-3">
          {folders.map((folder) => (
            <div key={folder.id} className="group relative flex items-center">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`w-full flex items-center ${isCollapsed && !isOpen ? 'justify-center px-0' : 'px-3'} py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeFolder === folder.id
                    ? 'bg-red-50 text-xhs-red'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={isCollapsed ? folder.name : ''}
              >
                <i className={`fa-solid ${folder.icon} ${isCollapsed && !isOpen ? 'text-lg' : 'w-6'}`}></i>
                {(!isCollapsed || isOpen) && <span className="ml-2 whitespace-nowrap truncate">{folder.name}</span>}
              </button>
              
              {/* Delete Button (Only for custom folders, on hover or active) */}
              {folder.id !== 'all' && (!isCollapsed || isOpen) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                  className="absolute right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除文件夹"
                >
                  <i className="fa-regular fa-trash-can text-xs"></i>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Management Section */}
        <div className={`mt-8 mb-2 ${isCollapsed && !isOpen ? 'hidden' : 'px-6'} text-xs font-semibold text-gray-400 uppercase tracking-wider`}>
          系统管理
        </div>
        {isCollapsed && !isOpen && <div className="mt-8 border-t border-gray-100 my-2 mx-4"></div>}
        
        <nav className="space-y-1 px-3">
          <button 
            onClick={onOpenCookies}
            className={`w-full flex items-center ${isCollapsed && !isOpen ? 'justify-center px-0' : 'px-3'} py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50`}
            title={isCollapsed ? "Cookie 资产" : ""}
          >
            <i className={`fa-solid fa-cookie-bite ${isCollapsed && !isOpen ? 'text-lg' : 'w-6'}`}></i>
            {(!isCollapsed || isOpen) && <span className="ml-2 whitespace-nowrap">Cookie 资产</span>}
          </button>
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
         {(!isCollapsed || isOpen) ? (
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-xhs-red text-white flex items-center justify-center font-bold text-xs shrink-0">
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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <aside className={mobileClasses}>
        {Content}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={desktopClasses}>
        {Content}
      </aside>
    </>
  );
};

export default Sidebar;