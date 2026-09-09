/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  initialContacts, initialChats, initialMessages, 
  initialStatuses, initialCommunities, initialCallHistory, 
  initialDailyUsage 
} from './data/mockData';
import { 
  Contact, Chat, Message, UserStatus, Community, 
  CallRecord, DailyUsage, ActiveCallState, AttachmentData, StatusItem 
} from './types';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CallModal } from './components/CallModal';
import { AttachmentModal } from './components/AttachmentModal';
import { StatusViewer, CreateStatusModal } from './components/StatusViewer';
import { CommunitiesView } from './components/CommunitiesView';
import { ContactInfoDrawer } from './components/ContactInfoDrawer';
import { UsageTrackerModal } from './components/UsageTrackerModal';
import { NewGroupCallModal } from './components/NewGroupCallModal';
import { SettingsModal } from './components/SettingsModal';
import { playSound } from './utils/audio';

export default function App() {
  // Core Entities State
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('wa_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('wa_chats');
    return saved ? JSON.parse(saved) : initialChats;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('wa_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [statuses, setStatuses] = useState<UserStatus[]>(() => {
    const saved = localStorage.getItem('wa_statuses');
    return saved ? JSON.parse(saved) : initialStatuses;
  });

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem('wa_communities');
    return saved ? JSON.parse(saved) : initialCommunities;
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('wa_calls');
    return saved ? JSON.parse(saved) : initialCallHistory;
  });

  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>(() => {
    const saved = localStorage.getItem('wa_daily_usage');
    return saved ? JSON.parse(saved) : initialDailyUsage;
  });

  // Active Screen Time Tracker (Records active minutes in real time)
  const [activeScreenMinutes, setActiveScreenMinutes] = useState<number>(68);

  // Active Navigation & View State
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'communities' | 'calls' | 'usage'>('chats');
  const [activeChatId, setActiveChatId] = useState<string>('chat_c1');

  // Modals & Panels State
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [activeStatusGroup, setActiveStatusGroup] = useState<UserStatus | null>(null);
  const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isNewGroupCallOpen, setIsNewGroupCallOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme & User Profile
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState('You');
  const [userAbout, setUserAbout] = useState('Hey there! I am using WhatsApp.');

  // Simulated Typing Indicator
  const [typingChatId, setTypingChatId] = useState<string | null>(null);

  // Active Call State (Voice & Video & Group Call)
  const [activeCall, setActiveCall] = useState<ActiveCallState>({
    isActive: false,
    type: 'voice',
    contact: initialContacts[0],
    isGroup: false,
    status: 'calling',
    durationSeconds: 0,
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerOn: true,
  });

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to LocalStorage for persistence
  useEffect(() => {
    localStorage.setItem('wa_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('wa_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('wa_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('wa_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('wa_calls', JSON.stringify(calls));
  }, [calls]);

  // Live Screen Time Counter (Ticks every minute for "Dailey kitana WhatsApp chelate ho")
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreenMinutes((prev) => {
        const next = prev + 1;
        setDailyUsage((prevUsage) => {
          const updated = [...prevUsage];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              totalMinutes: next,
            };
          }
          return updated;
        });
        return next;
      });
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  // Call duration counter
  useEffect(() => {
    if (activeCall.isActive && activeCall.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setActiveCall((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
        }));
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall.isActive, activeCall.status]);

  // Simulated Call Connection: transition from 'calling' to 'connected' after 3.5s
  useEffect(() => {
    if (activeCall.isActive && activeCall.status === 'calling') {
      const ringTimer = setTimeout(() => {
        setActiveCall((prev) => ({
          ...prev,
          status: 'connected',
        }));
      }, 3500);

      return () => clearTimeout(ringTimer);
    }
  }, [activeCall.isActive, activeCall.status]);

  // Find active chat & contact
  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const currentContact = contacts.find((c) => c.id === currentChat?.contactId);
  const currentChatMessages = messages[activeChatId] || [];
  const isBlocked = currentContact?.isBlocked || false;

  // Handle Send Message
  const handleSendMessage = (text: string, type: Message['type'] = 'text', attachment?: AttachmentData) => {
    if (!currentChat) return;

    playSound('sent');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId: currentChat.id,
      senderId: 'me',
      text,
      timestamp: timeStr,
      date: now.toISOString().split('T')[0],
      status: 'sent',
      type,
      attachment,
    };

    // Append to active chat
    setMessages((prev) => ({
      ...prev,
      [currentChat.id]: [...(prev[currentChat.id] || []), newMsg],
    }));

    // Update last message in chat list
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChat.id
          ? {
              ...c,
              lastMessage: type === 'document' ? `📄 ${attachment?.fileName || 'Document'}` : type === 'location' ? '📍 Shared Location' : text,
              lastMessageTime: timeStr,
            }
          : c
      )
    );

    // Update daily usage messages count
    setDailyUsage((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          messagesSent: updated[updated.length - 1].messagesSent + 1,
        };
      }
      return updated;
    });

    // Update status to delivered after 800ms
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [currentChat.id]: (prev[currentChat.id] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 800);

    // Update status to read after 1500ms
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [currentChat.id]: (prev[currentChat.id] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'read' } : m
        ),
      }));
    }, 1500);

    // Simulated contact auto-reply if not blocked
    if (!isBlocked && currentChat.type === 'direct' && currentContact) {
      setTimeout(() => {
        setTypingChatId(currentChat.id);
      }, 1200);

      setTimeout(() => {
        setTypingChatId(null);
        playSound('received');

        const replyOptions = [
          'Sounds great! Thanks for sharing 👍',
          'Got it! Looking into it right now.',
          'Awesome, see you soon! ☕',
          'Noted! I will review the file and call you.',
          'Perfect, thanks for the update! 😊'
        ];
        const randomReply = replyOptions[Math.floor(Math.random() * replyOptions.length)];

        const replyMsg: Message = {
          id: `msg_reply_${Date.now()}`,
          chatId: currentChat.id,
          senderId: currentContact.id,
          senderName: currentContact.name,
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: now.toISOString().split('T')[0],
          status: 'read',
          type: 'text',
        };

        setMessages((prev) => ({
          ...prev,
          [currentChat.id]: [...(prev[currentChat.id] || []), replyMsg],
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChat.id
              ? {
                  ...c,
                  lastMessage: randomReply,
                  lastMessageTime: replyMsg.timestamp,
                }
              : c
          )
        );

        setDailyUsage((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              messagesReceived: updated[updated.length - 1].messagesReceived + 1,
            };
          }
          return updated;
        });
      }, 2800);
    }
  };

  // Start Call (Voice or Video)
  const handleStartCall = (
    contact: { id: string; name: string; avatar: string },
    type: 'voice' | 'video',
    isGroup = false,
    groupParticipants?: { id: string; name: string; avatar: string }[]
  ) => {
    setActiveCall({
      isActive: true,
      type,
      contact,
      isGroup,
      groupParticipants,
      status: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isVideoEnabled: type === 'video',
      isSpeakerOn: true,
    });
  };

  // End Call & record in Call History
  const handleEndCall = () => {
    if (activeCall.isActive) {
      const durationSecs = activeCall.durationSeconds;
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      const durationStr = durationSecs > 0 ? `${mins} min ${secs} sec` : 'Cancelled';

      const newRecord: CallRecord = {
        id: `call_${Date.now()}`,
        contactId: activeCall.contact.id,
        contactName: activeCall.contact.name,
        contactAvatar: activeCall.contact.avatar,
        type: activeCall.type,
        direction: 'outgoing',
        timestamp: 'Just now',
        duration: durationSecs > 0 ? durationStr : undefined,
        isGroup: activeCall.isGroup,
      };

      setCalls((prev) => [newRecord, ...prev]);

      // Update call minutes in daily usage
      if (mins > 0) {
        setDailyUsage((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              callMinutes: updated[updated.length - 1].callMinutes + mins,
            };
          }
          return updated;
        });
      }
    }

    setActiveCall((prev) => ({
      ...prev,
      isActive: false,
      status: 'ended',
    }));
  };

  // Block / Unblock Contact
  const handleToggleBlock = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, isBlocked: !c.isBlocked } : c
      )
    );
  };

  // Archive / Unarchive Chat
  const handleToggleArchive = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, isArchived: !c.isArchived } : c
      )
    );
  };

  // Mute / Unmute Chat Notifications
  const handleToggleMute = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
      )
    );
  };

  // Message Reactions
  const handleReactToMessage = (messageId: string, emoji: string) => {
    playSound('tap');
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).map((m) => {
        if (m.id === messageId) {
          const existing = m.reactions || {};
          return {
            ...m,
            reactions: {
              ...existing,
              [emoji]: (existing[emoji] || 0) + 1,
            },
          };
        }
        return m;
      }),
    }));
  };

  // Add new status item to My Status
  const handleAddStatus = (newStatusItem: StatusItem) => {
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.contactId === 'me') {
          return {
            ...s,
            statuses: [newStatusItem, ...s.statuses],
          };
        }
        return s;
      })
    );
  };

  // Start Group Call
  const handleStartGroupCall = (participants: Contact[], type: 'voice' | 'video') => {
    const title = participants.map((p) => p.name.split(' ')[0]).join(', ');
    handleStartCall(
      {
        id: 'group_call_1',
        name: `Group: ${title}`,
        avatar: participants[0]?.avatar || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80',
      },
      type,
      true,
      participants.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar }))
    );
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'dark bg-[#0b141a]' : 'bg-[#eef0f3]'}`}>
      <div className="flex h-full w-full max-w-[1920px] mx-auto overflow-hidden shadow-2xl">
        {/* Left Sidebar (WhatsApp App Rail + List) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setActiveTab('chats');
            // Clear unread count on open
            setChats((prev) =>
              prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
            );
          }}
          statuses={statuses}
          onOpenStatus={(st) => {
            setActiveStatusGroup(st);
            setIsStatusViewerOpen(true);
          }}
          onOpenCreateStatus={() => setIsCreateStatusOpen(true)}
          calls={calls}
          onStartCall={(contact, type) => handleStartCall(contact, type)}
          onOpenNewGroupCall={() => setIsNewGroupCallOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUsageTracker={() => setIsUsageModalOpen(true)}
          activeScreenMinutes={activeScreenMinutes}
        />

        {/* Right Stage: Either Active Chat OR Communities View */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          {activeTab === 'communities' ? (
            <CommunitiesView
              communities={communities}
              onOpenCommunityChat={(chatId) => {
                setActiveChatId(chatId);
                setActiveTab('chats');
              }}
              onCreateCommunity={(newComm) => setCommunities((prev) => [newComm, ...prev])}
            />
          ) : currentChat ? (
            <ChatArea
              chat={currentChat}
              contact={currentContact}
              messages={currentChatMessages}
              isBlocked={isBlocked}
              isTyping={typingChatId === currentChat.id}
              onSendMessage={handleSendMessage}
              onVoiceCall={() =>
                handleStartCall(
                  currentContact || { id: currentChat.id, name: currentChat.name, avatar: currentChat.avatar },
                  'voice',
                  currentChat.type === 'group'
                )
              }
              onVideoCall={() =>
                handleStartCall(
                  currentContact || { id: currentChat.id, name: currentChat.name, avatar: currentChat.avatar },
                  'video',
                  currentChat.type === 'group'
                )
              }
              onOpenAttachmentModal={() => setIsAttachmentOpen(true)}
              onOpenContactInfo={() => setIsContactInfoOpen(true)}
              onUnblockContact={() => currentContact && handleToggleBlock(currentContact.id)}
              onToggleArchive={() => handleToggleArchive(currentChat.id)}
              onReactToMessage={handleReactToMessage}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#111b21] text-gray-400 p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">WhatsApp Web</h3>
              <p className="text-sm max-w-md">Send and receive messages without keeping your phone online.</p>
            </div>
          )}

          {/* Contact Info Drawer */}
          <ContactInfoDrawer
            isOpen={isContactInfoOpen}
            onClose={() => setIsContactInfoOpen(false)}
            contact={currentContact}
            chat={currentChat}
            onVoiceCall={() =>
              handleStartCall(
                currentContact || { id: currentChat.id, name: currentChat.name, avatar: currentChat.avatar },
                'voice'
              )
            }
            onVideoCall={() =>
              handleStartCall(
                currentContact || { id: currentChat.id, name: currentChat.name, avatar: currentChat.avatar },
                'video'
              )
            }
            onToggleBlock={handleToggleBlock}
            onToggleArchive={handleToggleArchive}
            onToggleMute={handleToggleMute}
          />
        </div>
      </div>

      {/* 1. Video & Voice Call Modal */}
      {activeCall.isActive && (
        <CallModal
          call={activeCall}
          onEndCall={handleEndCall}
          onToggleMute={() => setActiveCall((prev) => ({ ...prev, isMuted: !prev.isMuted }))}
          onToggleVideo={() => setActiveCall((prev) => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))}
          onToggleSpeaker={() => setActiveCall((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }))}
        />
      )}

      {/* 2. Attachment Modal (Document send & Location sharing) */}
      <AttachmentModal
        isOpen={isAttachmentOpen}
        onClose={() => setIsAttachmentOpen(false)}
        onSendAttachment={(attachment, caption) => {
          const type = attachment.fileType === 'image' ? 'image' : attachment.latitude ? 'location' : 'document';
          handleSendMessage(caption || '', type, attachment);
        }}
      />

      {/* 3. Status Viewer Modal (Daily Stories) */}
      <StatusViewer
        isOpen={isStatusViewerOpen}
        onClose={() => setIsStatusViewerOpen(false)}
        statusGroup={activeStatusGroup}
        onReplyToStatus={(contactId, text) => {
          const targetChat = chats.find((c) => c.contactId === contactId);
          if (targetChat) {
            setActiveChatId(targetChat.id);
            setActiveTab('chats');
            handleSendMessage(text, 'text');
          }
        }}
      />

      {/* 4. Create Status Modal */}
      <CreateStatusModal
        isOpen={isCreateStatusOpen}
        onClose={() => setIsCreateStatusOpen(false)}
        onAddStatus={handleAddStatus}
      />

      {/* 5. Daily WhatsApp Usage / Screen Time Record Modal */}
      <UsageTrackerModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        usageData={dailyUsage}
        activeMinutesToday={activeScreenMinutes}
      />

      {/* 6. New Group Call Modal */}
      <NewGroupCallModal
        isOpen={isNewGroupCallOpen}
        onClose={() => setIsNewGroupCallOpen(false)}
        contacts={contacts}
        onStartGroupCall={handleStartGroupCall}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        blockedContacts={contacts.filter((c) => c.isBlocked)}
        onUnblockContact={handleToggleBlock}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        userName={userName}
        userAbout={userAbout}
        onUpdateProfile={(name, about) => {
          setUserName(name);
          setUserAbout(about);
        }}
      />
    </div>
  );
}
