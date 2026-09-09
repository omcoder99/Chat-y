import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, Video, Search, MoreVertical, Paperclip, Smile, Mic, 
  Send, Check, CheckCheck, FileText, Download, MapPin, 
  ExternalLink, Ban, Play, Pause, X, Trash2, Heart, 
  ThumbsUp, Laugh, Users, CornerUpLeft, Info, Archive
} from 'lucide-react';
import { Chat, Contact, Message, AttachmentData } from '../types';
import { playSound } from '../utils/audio';

interface ChatAreaProps {
  chat: Chat;
  contact?: Contact;
  messages: Message[];
  isBlocked: boolean;
  isTyping: boolean;
  onSendMessage: (text: string, type?: Message['type'], attachment?: AttachmentData) => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onOpenAttachmentModal: () => void;
  onOpenContactInfo: () => void;
  onUnblockContact: () => void;
  onToggleArchive: () => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  contact,
  messages,
  isBlocked,
  isTyping,
  onSendMessage,
  onVoiceCall,
  onVideoCall,
  onOpenAttachmentModal,
  onOpenContactInfo,
  onUnblockContact,
  onToggleArchive,
  onReactToMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  
  // Voice note recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecordingVoice]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    onSendMessage('Voice message', 'audio', {
      duration: Math.max(recordingSeconds, 3),
    });
    setRecordingSeconds(0);
  };

  const cancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const emojisList = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '❤️', '😊', '🤔', '😎', '👋', '☕', '🚀'];

  return (
    <div id="whatsapp-chat-area" className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      {/* Chat Top Header */}
      <div className="h-16 px-4 bg-[#202c33] border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        {/* Contact info left */}
        <div 
          onClick={onOpenContactInfo}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative">
            <img
              src={contact?.avatar || chat.avatar}
              alt={chat.name}
              className="h-10 w-10 rounded-full object-cover border border-white/10"
            />
            {contact?.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#202c33]"></span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate max-w-[200px] sm:max-w-xs">
              {chat.name}
            </h3>
            <p className="text-xs text-gray-400">
              {isTyping ? (
                <span className="text-emerald-400 font-medium animate-pulse">typing...</span>
              ) : isBlocked ? (
                <span className="text-red-400">Blocked</span>
              ) : contact?.isOnline ? (
                <span className="text-emerald-400">online</span>
              ) : contact?.lastSeen ? (
                `last seen ${contact.lastSeen}`
              ) : chat.type === 'group' ? (
                'click here for group info'
              ) : (
                'WhatsApp'
              )}
            </p>
          </div>
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-1 sm:gap-2 text-gray-300">
          {/* Normal Audio Call */}
          <button
            id="chat-header-voice-call-btn"
            onClick={onVoiceCall}
            className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-emerald-400 transition"
            title="Start Voice Call"
          >
            <Phone className="h-5 w-5" />
          </button>

          {/* Video Call */}
          <button
            id="chat-header-video-call-btn"
            onClick={onVideoCall}
            className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-emerald-400 transition"
            title="Start Video Call"
          >
            <Video className="h-5 w-5" />
          </button>

          {/* Group Call trigger if group */}
          {chat.type === 'group' && (
            <button
              id="chat-header-group-call-btn"
              onClick={onVideoCall}
              className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-emerald-400 transition hidden sm:block"
              title="Start Group Video Call"
            >
              <Users className="h-5 w-5" />
            </button>
          )}

          {/* Vertical 3 dots Menu */}
          <div className="relative">
            <button
              id="chat-header-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-52 bg-[#233138] rounded-xl shadow-2xl border border-white/10 py-1.5 z-30 text-sm">
                <button
                  onClick={() => { setShowMenu(false); onOpenContactInfo(); }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 text-gray-200 flex items-center gap-2"
                >
                  <Info className="h-4 w-4 text-gray-400" />
                  <span>Contact info</span>
                </button>
                <button
                  onClick={() => { setShowMenu(false); onToggleArchive(); }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 text-gray-200 flex items-center gap-2"
                >
                  <Archive className="h-4 w-4 text-emerald-400" />
                  <span>{chat.isArchived ? 'Unarchive chat' : 'Archive chat'}</span>
                </button>
                {contact && (
                  <button
                    onClick={() => { setShowMenu(false); onUnblockContact(); }}
                    className="w-full px-4 py-2 text-left hover:bg-white/10 text-red-400 flex items-center gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    <span>{isBlocked ? 'Unblock contact' : 'Block contact'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Stream Canvas */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 relative"
        style={{
          backgroundColor: '#0b141a',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* End to end encryption pill */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229]/90 border border-white/5 rounded-lg px-4 py-1.5 text-center text-[11px] text-amber-200/80 max-w-md shadow-sm">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </div>
        </div>

        {/* Message items */}
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={`flex flex-col relative group ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl px-3.5 py-2 text-sm shadow-md transition-all ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                }`}
              >
                {/* Sender Name in Group Chat */}
                {chat.type === 'group' && !isMe && msg.senderName && (
                  <div className="text-xs font-semibold text-emerald-400 mb-1">
                    {msg.senderName}
                  </div>
                )}

                {/* 1. DOCUMENT ATTACHMENT CARD ("dormant sand") */}
                {msg.type === 'document' && msg.attachment && (
                  <div className="mb-2 bg-black/25 rounded-xl p-3 flex items-center gap-3 border border-white/10 hover:border-emerald-500/40 transition">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {msg.attachment.fileName || 'Attachment.pdf'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {msg.attachment.fileSize || '2.4 MB'} • {msg.attachment.fileType?.toUpperCase() || 'PDF'}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${msg.attachment?.fileName}...`)}
                      className="p-2 rounded-full bg-white/10 hover:bg-emerald-600 text-white transition shrink-0"
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* 2. LOCATION SHARING CARD ("location shering") */}
                {msg.type === 'location' && msg.attachment && (
                  <div className="mb-2 bg-black/30 rounded-xl overflow-hidden border border-white/10">
                    <div className="h-28 bg-[#16272b] relative flex items-center justify-center">
                      {/* Grid background for map */}
                      <div className="absolute inset-0 bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:12px_12px] opacity-20"></div>
                      <div className="relative flex flex-col items-center">
                        <MapPin className="h-8 w-8 text-red-500 animate-bounce drop-shadow-md" />
                      </div>
                    </div>
                    <div className="p-3 bg-[#182229]">
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{msg.attachment.locationName || 'Live Location'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {msg.attachment.latitude?.toFixed(4)}, {msg.attachment.longitude?.toFixed(4)}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${msg.attachment.latitude},${msg.attachment.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-medium"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* 3. AUDIO / VOICE NOTE BUBBLE */}
                {msg.type === 'audio' && (
                  <div className="mb-2 flex items-center gap-3 bg-black/20 p-2.5 rounded-xl">
                    <button
                      onClick={() => {
                        playSound('tap');
                        setActiveVoicePlaying(activeVoicePlaying === msg.id ? null : msg.id);
                      }}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white transition shrink-0"
                    >
                      {activeVoicePlaying === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    {/* Simulated Voice Waveform */}
                    <div className="flex-1 flex items-center gap-1 h-6">
                      {[30, 60, 45, 80, 20, 90, 70, 40, 85, 55, 30, 75, 45, 60].map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all ${
                            activeVoicePlaying === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-300 font-mono">0:{msg.attachment?.duration || 14}</span>
                  </div>
                )}

                {/* Text Content */}
                {msg.text && <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>}

                {/* Timestamp & Status checks */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-300/80 mt-1 select-none">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'sent' && <Check className="h-3.5 w-3.5 text-gray-400" />}
                      {msg.status === 'delivered' && <CheckCheck className="h-3.5 w-3.5 text-gray-400" />}
                      {msg.status === 'read' && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
                    </span>
                  )}
                </div>

                {/* Emoji Reactions display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-[#222e35] px-2 py-0.5 rounded-full border border-white/10 text-xs shadow-md">
                    {Object.entries(msg.reactions).map(([emoji, count]) => {
                      const numCount = Number(count);
                      return (
                        <span key={emoji} className="flex items-center gap-0.5">
                          <span>{emoji}</span>
                          {numCount > 1 && <span className="text-[10px] text-gray-400">{numCount}</span>}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick Reaction popup on hover */}
                {hoveredMessageId === msg.id && (
                  <div className={`absolute -top-9 ${isMe ? 'right-0' : 'left-0'} z-20 flex items-center gap-1 bg-[#202c33] border border-white/15 px-2 py-1 rounded-full shadow-xl`}>
                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((em) => (
                      <button
                        key={em}
                        onClick={() => onReactToMessage(msg.id, em)}
                        className="hover:scale-130 transition-transform text-sm p-0.5"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-[#202c33] text-gray-300 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Blocked Contact Notice Bar */}
      {isBlocked ? (
        <div className="p-4 bg-[#182229] border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <Ban className="h-4 w-4 shrink-0" />
            <span>You blocked this contact. Tap to unblock to resume messaging and calls.</span>
          </div>
          <button
            onClick={onUnblockContact}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shrink-0 ml-3"
          >
            Unblock
          </button>
        </div>
      ) : (
        /* Chat Input Bar */
        <div className="p-3 bg-[#202c33] border-t border-white/10 shrink-0 relative">
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-30 bg-[#222e35] p-3 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap gap-2 max-w-xs">
              {emojisList.map((em) => (
                <button
                  key={em}
                  onClick={() => setInputText((prev) => prev + em)}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* Voice recording active state */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between gap-3 bg-[#111b21] rounded-2xl px-4 py-2.5 border border-red-500/30">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs text-red-400 font-medium font-mono">
                  Recording: {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60}
                </span>
                <span className="text-xs text-gray-400">Speak into your microphone...</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelVoiceRecording}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition"
                  title="Cancel Recording"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSendVoiceNote}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Regular input mode */
            <div className="flex items-center gap-2">
              {/* Emoji button */}
              <button
                id="chat-input-emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <Smile className="h-6 w-6" />
              </button>

              {/* Attachment Paperclip (Document, Location, Photos) */}
              <button
                id="chat-input-attachment-btn"
                onClick={onOpenAttachmentModal}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                title="Send Document, Location, or Photos"
              >
                <Paperclip className="h-6 w-6 transform rotate-45" />
              </button>

              {/* Text Input Box */}
              <input
                id="chat-message-input"
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 text-sm px-4 py-2.5 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />

              {/* Send or Voice Note button */}
              {inputText.trim() ? (
                <button
                  id="chat-message-send-btn"
                  onClick={handleSend}
                  className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md active:scale-95"
                  title="Send Message"
                >
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <button
                  id="chat-voice-record-btn"
                  onClick={() => setIsRecordingVoice(true)}
                  className="p-2.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-emerald-400 transition"
                  title="Record Voice Message"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
