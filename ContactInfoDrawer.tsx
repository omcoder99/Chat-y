import React from 'react';
import { 
  X, Phone, Video, Ban, Archive, ArchiveRestore, Bell, 
  BellOff, ShieldAlert, Star, FileText, Image as ImageIcon, ChevronRight
} from 'lucide-react';
import { Contact, Chat } from '../types';

interface ContactInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
  chat?: Chat;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onToggleBlock: (contactId: string) => void;
  onToggleArchive: (chatId: string) => void;
  onToggleMute: (chatId: string) => void;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  isOpen,
  onClose,
  contact,
  chat,
  onVoiceCall,
  onVideoCall,
  onToggleBlock,
  onToggleArchive,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  const isBlocked = contact?.isBlocked || false;
  const isArchived = chat?.isArchived || false;
  const isMuted = chat?.isMuted || false;

  return (
    <div 
      id="whatsapp-contact-info-drawer"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#111b21] border-l border-white/10 text-white shadow-2xl flex flex-col transition-all duration-300 overflow-y-auto"
    >
      {/* Drawer Header */}
      <div className="flex items-center gap-4 px-4 py-4 bg-[#202c33] border-b border-white/10 shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="font-semibold text-base text-gray-100">
          {chat?.type === 'group' ? 'Group info' : 'Contact info'}
        </h3>
      </div>

      <div className="flex-1 space-y-4 p-4 pb-12">
        {/* Profile Card */}
        <div className="flex flex-col items-center p-6 bg-[#202c33] rounded-2xl border border-white/5 text-center">
          <img
            src={contact?.avatar || chat?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={contact?.name || chat?.name}
            className="h-28 w-28 rounded-full object-cover border-3 border-emerald-500 shadow-xl mb-4"
          />
          <h2 className="text-xl font-bold text-white">{contact?.name || chat?.name}</h2>
          <p className="text-xs text-gray-400 mt-1">
            {contact?.phone || (chat?.participants ? `${chat.participants.length} group members` : 'WhatsApp Account')}
          </p>
          {contact?.isOnline && (
            <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          )}

          {/* Quick Call Action Buttons */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={() => { onClose(); onVoiceCall(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#111b21] hover:bg-[#1a2730] border border-white/10 text-emerald-400 transition"
              title="Voice Call"
            >
              <Phone className="h-5 w-5" />
              <span className="text-[11px] text-gray-300 font-medium">Audio</span>
            </button>
            <button
              onClick={() => { onClose(); onVideoCall(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#111b21] hover:bg-[#1a2730] border border-white/10 text-emerald-400 transition"
              title="Video Call"
            >
              <Video className="h-5 w-5" />
              <span className="text-[11px] text-gray-300 font-medium">Video</span>
            </button>
          </div>
        </div>

        {/* About & Phone Number */}
        <div className="bg-[#202c33] p-4 rounded-2xl border border-white/5 space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            About
          </span>
          <p className="text-sm text-gray-200">
            {contact?.about || chat?.groupDescription || 'Hey there! I am using WhatsApp.'}
          </p>
          {contact?.phone && (
            <div className="pt-2 border-t border-white/5 text-xs text-gray-400">
              {contact.phone}
            </div>
          )}
        </div>

        {/* Media, Links & Docs Card */}
        <div className="bg-[#202c33] p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Media, Links and Docs
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 cursor-pointer hover:underline">
              12 items <ChevronRight className="h-3 w-3" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80" 
              alt="media" 
              className="h-16 w-full object-cover rounded-lg border border-white/10"
            />
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&auto=format&fit=crop&q=80" 
              alt="media" 
              className="h-16 w-full object-cover rounded-lg border border-white/10"
            />
            <div className="h-16 rounded-lg bg-[#111b21] flex flex-col items-center justify-center text-xs text-emerald-400 border border-white/10">
              <FileText className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] text-gray-300">NDA.pdf</span>
            </div>
          </div>
        </div>

        {/* Chat Settings & Actions */}
        <div className="bg-[#202c33] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
          {/* Mute Notifications */}
          {chat && (
            <button
              onClick={() => onToggleMute(chat.id)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                {isMuted ? <BellOff className="h-5 w-5 text-gray-400" /> : <Bell className="h-5 w-5 text-gray-300" />}
                <div>
                  <div className="text-sm font-medium text-white">Mute notifications</div>
                  <div className="text-xs text-gray-400">{isMuted ? 'Muted' : 'Normal'}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isMuted ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-gray-400'}`}>
                {isMuted ? 'Muted' : 'Off'}
              </span>
            </button>
          )}

          {/* Starred Messages */}
          <button className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <div className="text-sm font-medium text-white">Starred Messages</div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>

          {/* Archive / Unarchive Chat ("arichiv") */}
          {chat && (
            <button
              id="drawer-toggle-archive-btn"
              onClick={() => onToggleArchive(chat.id)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                {isArchived ? (
                  <ArchiveRestore className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Archive className="h-5 w-5 text-emerald-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">
                    {isArchived ? 'Unarchive chat (आर्काइव से हटाएं)' : 'Archive chat (आर्काइव करें)'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isArchived ? 'Move back to regular chats' : 'Hide chat in Archived folder'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Block / Unblock Contact ("Block") */}
          {contact && (
            <button
              id="drawer-toggle-block-btn"
              onClick={() => onToggleBlock(contact.id)}
              className={`w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition ${
                isBlocked ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ban className="h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">
                    {isBlocked ? `Unblock ${contact.name}` : `Block ${contact.name} (ब्लॉक करें)`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isBlocked ? 'Allow messages and calls' : 'Blocked contacts cannot call or message you'}
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
