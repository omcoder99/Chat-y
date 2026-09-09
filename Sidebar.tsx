import React, { useState } from 'react';
import { 
  MessageSquare, CircleDashed, Users, Phone, Clock, Settings, 
  Search, Plus, Filter, Archive, Pin, Video, ArrowDownLeft, 
  ArrowUpRight, PhoneMissed, ChevronRight, UserPlus, Link2, 
  CheckCheck, Layers
} from 'lucide-react';
import { Chat, Contact, UserStatus, CallRecord } from '../types';

interface SidebarProps {
  activeTab: 'chats' | 'status' | 'communities' | 'calls' | 'usage';
  setActiveTab: (tab: 'chats' | 'status' | 'communities' | 'calls' | 'usage') => void;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  statuses: UserStatus[];
  onOpenStatus: (status: UserStatus) => void;
  onOpenCreateStatus: () => void;
  calls: CallRecord[];
  onStartCall: (contact: { id: string; name: string; avatar: string }, type: 'voice' | 'video') => void;
  onOpenNewGroupCall: () => void;
  onOpenSettings: () => void;
  onOpenUsageTracker: () => void;
  activeScreenMinutes: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  chats,
  activeChatId,
  onSelectChat,
  statuses,
  onOpenStatus,
  onOpenCreateStatus,
  calls,
  onStartCall,
  onOpenNewGroupCall,
  onOpenSettings,
  onOpenUsageTracker,
  activeScreenMinutes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [viewingArchived, setViewingArchived] = useState(false);

  // Filter chats
  const filteredChats = chats.filter((c) => {
    // Archived filter
    if (viewingArchived) {
      if (!c.isArchived) return false;
    } else {
      if (c.isArchived) return false;
    }

    // Pills filter
    if (chatFilter === 'unread' && c.unreadCount === 0) return false;
    if (chatFilter === 'groups' && c.type !== 'group' && c.type !== 'community_channel') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const archivedCount = chats.filter((c) => c.isArchived).length;
  const unreadTotal = chats.reduce((sum, c) => sum + (c.isArchived ? 0 : c.unreadCount), 0);
  const missedCallsCount = calls.filter((c) => c.direction === 'missed').length;

  const myStatus = statuses.find((s) => s.contactId === 'me');
  const otherStatuses = statuses.filter((s) => s.contactId !== 'me');
  const recentStatuses = otherStatuses.filter((s) => !s.allSeen);
  const viewedStatuses = otherStatuses.filter((s) => s.allSeen);

  return (
    <div id="whatsapp-sidebar-container" className="flex h-full border-r border-white/10 bg-[#111b21] shrink-0 w-full sm:w-80 md:w-96">
      {/* 1. Leftmost Vertical App Rail (WhatsApp Desktop / Web style) */}
      <div className="w-16 bg-[#202c33] border-r border-white/10 flex flex-col items-center justify-between py-4 shrink-0 select-none">
        {/* Top Icons */}
        <div className="flex flex-col items-center gap-4">
          {/* Chats Icon */}
          <button
            id="nav-chats-tab-btn"
            onClick={() => { setActiveTab('chats'); setViewingArchived(false); }}
            className={`p-2.5 rounded-xl relative transition ${
              activeTab === 'chats'
                ? 'bg-white/15 text-emerald-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Chats"
          >
            <MessageSquare className="h-5 w-5" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center">
                {unreadTotal}
              </span>
            )}
          </button>

          {/* Status Tab Icon */}
          <button
            id="nav-status-tab-btn"
            onClick={() => setActiveTab('status')}
            className={`p-2.5 rounded-xl relative transition ${
              activeTab === 'status'
                ? 'bg-white/15 text-emerald-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Status (Diley stutes)"
          >
            <CircleDashed className="h-5 w-5" />
            {recentStatuses.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          {/* Communities Tab Icon */}
          <button
            id="nav-communities-tab-btn"
            onClick={() => setActiveTab('communities')}
            className={`p-2.5 rounded-xl relative transition ${
              activeTab === 'communities'
                ? 'bg-white/15 text-emerald-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Communities (Comunitey group)"
          >
            <Layers className="h-5 w-5" />
          </button>

          {/* Calls Tab Icon */}
          <button
            id="nav-calls-tab-btn"
            onClick={() => setActiveTab('calls')}
            className={`p-2.5 rounded-xl relative transition ${
              activeTab === 'calls'
                ? 'bg-white/15 text-emerald-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Calls & Call History"
          >
            <Phone className="h-5 w-5" />
            {missedCallsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {missedCallsCount}
              </span>
            )}
          </button>

          {/* Screen Time / Daily Usage Tracker Icon */}
          <button
            id="nav-usage-tracker-btn"
            onClick={onOpenUsageTracker}
            className="p-2.5 rounded-xl text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 relative transition group"
            title="Screen Time / Daily WhatsApp Record (कितना चलाते हो)"
          >
            <Clock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -bottom-1 text-[9px] font-bold text-emerald-400 font-mono">
              {activeScreenMinutes}m
            </span>
          </button>
        </div>

        {/* Bottom Icons: Settings & My Profile */}
        <div className="flex flex-col items-center gap-3">
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <div
            onClick={onOpenSettings}
            className="relative cursor-pointer hover:opacity-90 transition"
            title="Your Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
              alt="My Avatar"
              className="h-8 w-8 rounded-full object-cover border border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Main List Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#111b21]">
        
        {/* ===================== CHATS TAB ===================== */}
        {activeTab === 'chats' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {viewingArchived ? 'Archived' : 'Chats'}
              </h2>
              {viewingArchived && (
                <button
                  onClick={() => setViewingArchived(false)}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Back to all chats
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2.5 bg-[#202c33] rounded-xl px-3.5 py-2 border border-white/5 focus-within:border-emerald-500 transition">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  id="search-chats-input"
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Filter Pills */}
            {!viewingArchived && (
              <div className="flex gap-2 px-3 pb-2 select-none overflow-x-auto">
                {(['all', 'unread', 'groups'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setChatFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${
                      chatFilter === filter
                        ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                        : 'bg-[#202c33] text-gray-400 hover:text-gray-200 border border-white/5'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {/* Archived Folder Banner */}
            {!viewingArchived && archivedCount > 0 && (
              <div
                id="archived-chats-folder-btn"
                onClick={() => setViewingArchived(true)}
                className="mx-3 my-1 p-2.5 rounded-xl bg-[#1a2328] hover:bg-[#202c33] border border-white/5 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2.5 text-gray-300">
                  <Archive className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium">Archived (आर्काइव चैट्स)</span>
                </div>
                <span className="text-emerald-400 font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {archivedCount}
                </span>
              </div>
            )}

            {/* Chat List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No conversations found
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer select-none transition ${
                        isActive
                          ? 'bg-[#2a3942]'
                          : 'hover:bg-[#202c33]/70'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="h-12 w-12 rounded-full object-cover border border-white/10"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {chat.name}
                          </h4>
                          <span className={`text-[11px] shrink-0 ${chat.unreadCount > 0 ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>
                            {chat.lastMessageTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 truncate pr-2">
                            {chat.lastMessage || 'Tap to chat'}
                          </p>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {chat.isPinned && (
                              <Pin className="h-3 w-3 text-gray-400 transform rotate-45" />
                            )}
                            {chat.unreadCount > 0 && (
                              <span className="h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ===================== STATUS TAB ("Diley stutes") ===================== */}
        {activeTab === 'status' && (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-wide">Status</h2>
              <button
                id="add-status-btn"
                onClick={onOpenCreateStatus}
                className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 text-xs px-2.5 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Status</span>
              </button>
            </div>

            <div className="p-3 space-y-4">
              {/* My Status Card */}
              <div
                onClick={() => {
                  if (myStatus && myStatus.statuses.length > 0) {
                    onOpenStatus(myStatus);
                  } else {
                    onOpenCreateStatus();
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] cursor-pointer transition border border-white/5"
              >
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                    alt="My status"
                    className={`h-12 w-12 rounded-full object-cover border-2 ${
                      myStatus?.statuses?.length ? 'border-emerald-500' : 'border-gray-500'
                    }`}
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs border-2 border-[#202c33]">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">My Status</h4>
                  <p className="text-xs text-gray-400">
                    {myStatus?.statuses?.length ? `${myStatus.statuses.length} updates active` : 'Tap to add status update'}
                  </p>
                </div>
              </div>

              {/* Recent Updates */}
              {recentStatuses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block px-1">
                    Recent Updates
                  </span>
                  {recentStatuses.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onOpenStatus(st)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] cursor-pointer transition"
                    >
                      <div className="relative shrink-0 p-0.5 rounded-full border-2 border-emerald-500">
                        <img
                          src={st.contactAvatar}
                          alt={st.contactName}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{st.contactName}</h4>
                        <p className="text-xs text-gray-400">{st.statuses[st.statuses.length - 1]?.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Viewed Updates */}
              {viewedStatuses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-1">
                    Viewed Updates
                  </span>
                  {viewedStatuses.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onOpenStatus(st)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] cursor-pointer transition opacity-75 hover:opacity-100"
                    >
                      <div className="relative shrink-0 p-0.5 rounded-full border-2 border-gray-600">
                        <img
                          src={st.contactAvatar}
                          alt={st.contactName}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{st.contactName}</h4>
                        <p className="text-xs text-gray-400">{st.statuses[st.statuses.length - 1]?.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== CALLS TAB ("Call history") ===================== */}
        {activeTab === 'calls' && (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-wide">Calls</h2>
              <button
                id="sidebar-new-group-call-btn"
                onClick={onOpenNewGroupCall}
                className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 text-xs px-2.5 font-medium"
              >
                <Users className="h-4 w-4" />
                <span>New Group Call</span>
              </button>
            </div>

            <div className="p-3 space-y-4">
              {/* Create Call Link banner */}
              <div 
                onClick={() => alert('WhatsApp Call Link created: https://call.whatsapp.com/v/sample123')}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] cursor-pointer transition border border-white/5"
              >
                <div className="h-11 w-11 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Create call link</h4>
                  <p className="text-xs text-gray-400">Share a link for your WhatsApp call</p>
                </div>
              </div>

              {/* Recent Calls Log */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block px-1 mb-2">
                  Recent Call History
                </span>
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202c33] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={call.contactAvatar}
                        alt={call.contactName}
                        className="h-11 w-11 rounded-full object-cover border border-white/10"
                      />
                      <div className="truncate">
                        <h4 className={`text-sm font-semibold truncate ${
                          call.direction === 'missed' ? 'text-red-400' : 'text-white'
                        }`}>
                          {call.contactName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          {call.direction === 'incoming' && <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />}
                          {call.direction === 'outgoing' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
                          {call.direction === 'missed' && <PhoneMissed className="h-3.5 w-3.5 text-red-400" />}
                          <span>{call.timestamp}</span>
                          {call.duration && <span>• {call.duration}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartCall({ id: call.contactId, name: call.contactName, avatar: call.contactAvatar }, call.type)}
                      className="p-2 rounded-full hover:bg-white/10 text-emerald-400 transition ml-2 shrink-0"
                      title={`Call ${call.contactName}`}
                    >
                      {call.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
