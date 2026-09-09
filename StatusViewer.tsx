import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Send, Heart, Eye, 
  Plus, Camera, Type, Palette
} from 'lucide-react';
import { UserStatus, StatusItem } from '../types';

interface StatusViewerProps {
  isOpen: boolean;
  onClose: () => void;
  statusGroup: UserStatus | null;
  onReplyToStatus: (contactId: string, replyText: string) => void;
}

interface NewStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStatus: (statusItem: StatusItem) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  isOpen,
  onClose,
  statusGroup,
  onReplyToStatus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const statuses = statusGroup?.statuses || [];
  const currentStatus = statuses[currentIndex];

  // Auto progression
  useEffect(() => {
    if (!isOpen || !currentStatus || isPaused) return;

    const interval = 50; // update progress every 50ms
    const totalDuration = 5000; // 5 seconds per slide
    const increment = (interval / totalDuration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Reached the end of this user's statuses
            clearInterval(timerRef.current!);
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentStatus, currentIndex, isPaused, statuses.length, onClose]);

  // Reset when status group changes
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [statusGroup?.id]);

  if (!isOpen || !statusGroup || !currentStatus) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReplyToStatus(statusGroup.contactId, `Replied to your status: "${replyText.trim()}"`);
    setReplyText('');
    onClose();
  };

  const handleQuickReaction = (emoji: string) => {
    onReplyToStatus(statusGroup.contactId, `Reacted ${emoji} to your status`);
    onClose();
  };

  return (
    <div 
      id="whatsapp-status-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Dimmed Canvas */}
      <div className="relative w-full max-w-md h-[92vh] max-h-[800px] flex flex-col justify-between overflow-hidden rounded-2xl bg-gray-950 shadow-2xl border border-white/10">
        
        {/* Top: Progress Bars & User Header */}
        <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex gap-1.5 mb-3">
            {statuses.map((_, idx) => (
              <div 
                key={idx} 
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Profile bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={statusGroup.contactAvatar}
                alt={statusGroup.contactName}
                className="h-10 w-10 rounded-full object-cover border border-emerald-500"
              />
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {statusGroup.contactName}
                </h4>
                <p className="text-xs text-gray-300">
                  {currentStatus.timestamp}
                </p>
              </div>
            </div>

            <button
              id="status-viewer-close-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Center: Status Media / Text Content */}
        <div className="relative flex-1 flex items-center justify-center p-6">
          {currentStatus.type === 'image' ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentStatus.content}
                alt="Status update"
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
              {currentStatus.caption && (
                <div className="absolute bottom-4 left-0 right-0 bg-black/60 backdrop-blur-xs py-2 px-4 rounded-xl text-center text-sm text-white mx-4 font-medium">
                  {currentStatus.caption}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center p-8 rounded-xl text-center"
              style={{ 
                backgroundColor: currentStatus.backgroundColor || '#075e54',
                color: currentStatus.textColor || '#ffffff'
              }}
            >
              <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed drop-shadow-md">
                {currentStatus.content}
              </p>
            </div>
          )}

          {/* Left/Right Click Navigators */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white/70 hover:text-white transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white/70 hover:text-white transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom: Reply Input or Views Counter */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          {statusGroup.contactId === 'me' ? (
            /* My Status views counter */
            <div className="flex items-center justify-center gap-2 py-2 text-gray-300 text-sm">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Viewed by {currentStatus.viewsCount || 14} contacts</span>
            </div>
          ) : (
            /* Contact status reply bar */
            <div className="space-y-3">
              {/* Quick Emojis */}
              <div className="flex justify-center gap-4 py-1">
                {['❤️', '😂', '😮', '😢', '🔥', '👏'].map((em) => (
                  <button
                    key={em}
                    onClick={(e) => { e.stopPropagation(); handleQuickReaction(em); }}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Text Reply bar */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 border border-white/15" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="Reply to status..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-hidden"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Create New Status Modal
export const CreateStatusModal: React.FC<NewStatusModalProps> = ({
  isOpen,
  onClose,
  onAddStatus,
}) => {
  const [statusMode, setStatusMode] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState('#075e54');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80');
  const [caption, setCaption] = useState('');

  const bgColors = [
    '#075e54', // WhatsApp dark green
    '#7c3aed', // Purple
    '#dc2626', // Crimson red
    '#0284c7', // Sky blue
    '#ea580c', // Orange
    '#111827', // Slate black
  ];

  if (!isOpen) return null;

  const handlePostStatus = () => {
    if (statusMode === 'text') {
      if (!textContent.trim()) return;
      onAddStatus({
        id: `status_${Date.now()}`,
        type: 'text',
        content: textContent.trim(),
        backgroundColor: selectedBg,
        textColor: '#ffffff',
        timestamp: 'Just now',
        viewsCount: 0,
      });
    } else {
      onAddStatus({
        id: `status_${Date.now()}`,
        type: 'image',
        content: imageUrl,
        caption: caption.trim() || undefined,
        timestamp: 'Just now',
        viewsCount: 0,
      });
    }
    onClose();
  };

  return (
    <div 
      id="whatsapp-create-status-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-md bg-[#222e35] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1f2c34] border-b border-white/10">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            <span>Create Status (नया स्टेटस जोड़ें)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-white/10 bg-[#111b21]">
          <button
            onClick={() => setStatusMode('text')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
              statusMode === 'text'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Type className="h-4 w-4" />
            <span>Text Status</span>
          </button>
          <button
            onClick={() => setStatusMode('image')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${
              statusMode === 'image'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Photo Status</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {statusMode === 'text' ? (
            <div className="space-y-4">
              {/* Preview Box */}
              <div 
                className="h-48 rounded-xl flex items-center justify-center p-6 text-center shadow-inner transition-colors"
                style={{ backgroundColor: selectedBg }}
              >
                <textarea
                  placeholder="Type your daily status here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/60 text-lg font-serif resize-none text-center focus:outline-hidden"
                  rows={3}
                />
              </div>

              {/* Color Palette Picker */}
              <div className="flex items-center justify-between bg-[#111b21] p-3 rounded-xl border border-white/5">
                <span className="text-xs text-gray-300 flex items-center gap-1.5 font-medium">
                  <Palette className="h-4 w-4 text-emerald-400" /> Background Color:
                </span>
                <div className="flex gap-2">
                  {bgColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedBg(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        selectedBg === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Choice"
                    onClick={() => setImageUrl(url)}
                    className={`h-24 w-full object-cover rounded-lg cursor-pointer border-2 transition ${
                      imageUrl === url ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePostStatus}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
          >
            <Send className="h-4 w-4" />
            <span>Post to My Status (24 hrs)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
