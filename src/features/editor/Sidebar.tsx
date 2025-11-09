import React, { useState } from 'react';
import { ChevronLeft, Settings, User, LogOut, Zap, Loader2 } from 'lucide-react';
import { NodeCategory, SidebarNode } from '@/shared/types';

interface SidebarProps {
  allowedCategories: NodeCategory[];
  nodeLibrary: SidebarNode[];
  loading: boolean;
  error: Error | null;
}

const Sidebar: React.FC<SidebarProps> = ({ allowedCategories, nodeLibrary, loading, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categorizedNodes = Object.values(NodeCategory).map(category => ({
    category,
    nodes: nodeLibrary.filter(node => node.category === category)
  }));

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'}`}>
      <div className="flex items-center justify-between h-14 border-b border-gray-200 px-4 flex-shrink-0">
        {!isCollapsed && <h2 className="font-semibold text-lg">Nodes</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-100">
          <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-2 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            {!isCollapsed && <span className="ml-2 text-sm text-gray-500">Loading nodes...</span>}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            {!isCollapsed && (
              <p className="text-sm text-red-600">Failed to load nodes. Please try again later.</p>
            )}
          </div>
        )}
        {!loading && !error && categorizedNodes.map(({ category, nodes }) => (
          nodes.length > 0 && (
            <div key={category}>
              {!isCollapsed && <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>}
              {isCollapsed && <hr className="my-3"/>}
              <div className="space-y-1">
                {nodes.map((node) => {
                  const Icon = node.icon;
                  const isAllowed = allowedCategories.includes(node.category);
                  const title = isAllowed ? node.description : `This node is disabled. Allowed categories: ${allowedCategories.join(', ')}.`;

                  return (
                    <div
                      key={node.type}
                      className={`flex items-center p-2 rounded-md group ${isAllowed ? 'cursor-grab hover:bg-orange-50' : 'cursor-not-allowed opacity-50'}`}
                      onDragStart={(event) => isAllowed && onDragStart(event, node.type)}
                      draggable={isAllowed}
                      title={title}
                    >
                      <Icon className={`w-5 h-5 ${isAllowed ? 'text-gray-500 group-hover:text-[#f65e05]' : 'text-gray-400'}`} />
                      {!isCollapsed && <span className="ml-3 text-sm font-medium text-gray-700">{node.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
       {/* Bottom Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2 space-y-2">
        <button
          title="Upgrade Plan"
          className={`flex items-center p-2 rounded-md w-full text-sm font-medium ${isCollapsed ? 'justify-center' : ''} bg-orange-50 text-[#f65e05] hover:bg-orange-100`}
        >
          <Zap className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Upgrade Plan</span>}
        </button>
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-1' : 'justify-around'}`}>
          <button title="Profile" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <User className="w-5 h-5" />
          </button>
          <button title="Settings" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <Settings className="w-5 h-5" />
          </button>
          <button title="Logout" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


