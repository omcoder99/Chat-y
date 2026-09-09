import React, { useState } from 'react';
import { 
  Users, Plus, Megaphone, ChevronRight, MessageSquare, 
  ShieldCheck, Sparkles, X, Layers
} from 'lucide-react';
import { Community, CommunitySubGroup } from '../types';

interface CommunitiesViewProps {
  communities: Community[];
  onOpenCommunityChat: (chatId: string, groupName: string) => void;
  onCreateCommunity: (community: Community) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  onOpenCommunityChat,
  onCreateCommunity,
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(communities[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New community form
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newSubGroupName, setNewSubGroupName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const newComm: Community = {
      id: `comm_${Date.now()}`,
      name: newCommName.trim(),
      description: newCommDesc.trim() || 'Official community groups & announcements',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      announcementChatId: 'chat_comm_announcements',
      createdAt: 'Just now',
      subGroups: [
        {
          id: `sg_${Date.now()}_1`,
          name: newSubGroupName.trim() || 'General Community Chat',
          avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80',
          memberCount: 1,
          lastActivity: 'Just now',
        }
      ]
    };

    onCreateCommunity(newComm);
    setSelectedCommunity(newComm);
    setIsCreateOpen(false);
    setNewCommName('');
    setNewCommDesc('');
    setNewSubGroupName('');
  };

  return (
    <div id="whatsapp-communities-view" className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#111b21] text-white">
      {/* Communities Sidebar List */}
      <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-[#111b21] overflow-y-auto">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1f2c34]">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Communities</h2>
          </div>
          <button
            id="create-new-community-btn"
            onClick={() => setIsCreateOpen(true)}
            className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 text-xs px-2.5 font-medium"
            title="Create New Community"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-emerald-950/30 border-b border-emerald-500/20 text-xs text-emerald-200">
          <p className="flex items-center gap-1.5 font-medium mb-1">
            <Sparkles className="h-4 w-4 text-emerald-400" /> WhatsApp Communities
          </p>
          Bring related neighborhood, workplace, or club groups together with centralized announcements.
        </div>

        {/* Communities Items */}
        <div className="p-3 space-y-2">
          {communities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => setSelectedCommunity(comm)}
              className={`p-3 rounded-xl cursor-pointer transition border ${
                selectedCommunity?.id === comm.id
                  ? 'bg-[#202c33] border-emerald-500/50'
                  : 'bg-[#182229] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={comm.avatar}
                  alt={comm.name}
                  className="h-12 w-12 rounded-xl object-cover border border-emerald-500/40"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{comm.name}</h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{comm.subGroups.length} connected sub-groups</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Detail Stage */}
      {selectedCommunity ? (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0b141a]">
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-r from-[#182823] via-[#10201c] to-[#0b141a] border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={selectedCommunity.avatar}
                alt={selectedCommunity.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedCommunity.name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                    Community
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1 max-w-xl">
                  {selectedCommunity.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>Created {selectedCommunity.createdAt}</span>
                  <span>•</span>
                  <span>{selectedCommunity.subGroups.reduce((acc, g) => acc + g.memberCount, 42)} Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Sections */}
          <div className="p-6 space-y-6 max-w-4xl">
            {/* Announcement Channel Card */}
            <div className="bg-[#111b21] p-5 rounded-2xl border border-emerald-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">Announcements Channel</h4>
                    <p className="text-xs text-gray-400">Only community admins can send messages here</p>
                  </div>
                </div>

                <button
                  id="open-announcement-chat-btn"
                  onClick={() => onOpenCommunityChat(selectedCommunity.announcementChatId, `${selectedCommunity.name} (Announcements)`)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Announcements</span>
                </button>
              </div>
            </div>

            {/* Sub-groups list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>Sub-Groups in this Community ({selectedCommunity.subGroups.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCommunity.subGroups.map((group: CommunitySubGroup) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-xl bg-[#111b21] border border-white/5 hover:border-emerald-500/40 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="h-12 w-12 rounded-xl object-cover border border-white/10"
                      />
                      <div className="truncate">
                        <h5 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate">
                          {group.name}
                        </h5>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {group.memberCount} members • Active {group.lastActivity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCommunityChat('chat_group1', group.name)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-emerald-600 text-xs font-medium text-white transition shrink-0 ml-2"
                    >
                      Join / Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
          <Layers className="h-16 w-16 text-gray-600 mb-3" />
          <p>Select a community to view details</p>
        </div>
      )}

      {/* New Community Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-[#222e35] text-white rounded-2xl shadow-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Create New Community</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My College Society or Startup Hub"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Community Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this community about?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  First Sub-Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. General Discussions"
                  value={newSubGroupName}
                  onChange={(e) => setNewSubGroupName(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/20"
              >
                Create Community
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
