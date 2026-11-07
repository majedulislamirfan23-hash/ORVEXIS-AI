import React, { useState } from 'react';
import {
  Plus,
  Compass,
  MessageSquare,
  Wrench,
  Image as ImageIcon,
  Code2,
  GraduationCap,
  FileText,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Brain,
  Sparkles,
  Pin,
  X,
  User,
} from 'lucide-react';
import { ActiveView, Conversation } from '../types';
import { filterConversations } from '../utils/logic';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  memoryCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = filterConversations(conversations, searchQuery);

  const navItems = [
    { id: 'chat' as ActiveView, label: 'Chat Engine', icon: MessageSquare, badge: null },
    { id: 'explore' as ActiveView, label: 'Explore AI', icon: Compass, badge: 'New' },
    { id: 'think' as ActiveView, label: 'ORVEXIS Think', icon: Brain, badge: 'Cognitive' },
    { id: 'code' as ActiveView, label: 'Coding Assistant', icon: Code2, badge: null },
    { id: 'vision' as ActiveView, label: 'Image Studio', icon: ImageIcon, badge: 'Vision' },
    { id: 'study' as ActiveView, label: 'Study Assistant', icon: GraduationCap, badge: null },
    { id: 'document' as ActiveView, label: 'Document Assistant', icon: FileText, badge: null },
    { id: 'create' as ActiveView, label: 'ORVEXIS Create', icon: Sparkles, badge: null },
    { id: 'tools' as ActiveView, label: 'AI Tools', icon: Wrench, badge: null },
    { id: 'profile' as ActiveView, label: 'Personal Profile', icon: User, badge: null },
    { id: 'settings' as ActiveView, label: 'Settings', icon: Settings, badge: memoryCount > 0 ? `${memoryCount}` : null },
    { id: 'about' as ActiveView, label: 'About ORVEXIS', icon: Info, badge: null },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#090a12]/95 backdrop-blur-xl border-r border-white/[0.08] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div
          onClick={() => handleNavClick('chat')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="ORVEXIS AI Home"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] bg-black">
            <img
              src="/assets/aistudio/1794037215776_5d40d62c.jpg"
              alt="ORVEXIS"
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-wider bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                ORVEXIS AI
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest font-mono">
                BEYOND LIMITS
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Action: New Chat */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            if (activeView !== 'chat') setActiveView('chat');
            if (isMobileOpen) setIsMobileOpen(false);
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-md cursor-pointer ${
            isCollapsed
              ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
          }`}
          title="New Conversation"
          aria-label="Start New Chat"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          {!isCollapsed && <span className="font-display tracking-wider text-xs font-semibold">NEW CHAT</span>}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-2 py-1">
          {!isCollapsed && 'INTELLIGENCE SUITE'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-purple-600/20 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-purple-300'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        item.badge === 'New'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : item.badge === 'Cognitive'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Conversation History Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2 border-t border-white/[0.06] mt-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                RECENT SESSIONS
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {conversations.length}
              </span>
            </div>

            {/* Search Input for history */}
            <div className="px-2 mb-2">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  aria-label="Search conversation history"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-0.5 max-h-48 overflow-y-auto px-1">
              {filteredConversations.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4">
                  {searchQuery ? 'No matching sessions' : 'No previous chats'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (activeView !== 'chat') setActiveView('chat');
                        if (isMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white/[0.08] text-white border-l-2 border-cyan-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                      }`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {conv.pinned && <Pin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity"
                        title="Delete chat"
                        aria-label={`Delete ${conv.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">GEMINI 3.8 FLASH</span>
              <span className="text-[9px] font-mono text-emerald-400">READY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden flex"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-72 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
