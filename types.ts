export type MessageType = 'text' | 'image' | 'document' | 'location' | 'audio' | 'call_log';

export interface AttachmentData {
  fileName?: string;
  fileSize?: string;
  fileType?: string; // 'pdf' | 'doc' | 'zip' | 'image' | etc.
  url?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  duration?: number; // for audio
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string; // 'me' or contactId
  senderName?: string;
  text: string;
  timestamp: string; // e.g. "10:42 AM"
  date: string; // YYYY-MM-DD
  status: 'sent' | 'delivered' | 'read';
  type: MessageType;
  attachment?: AttachmentData;
  reactions?: { [emoji: string]: number };
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  about: string;
  isOnline: boolean;
  lastSeen?: string;
  isBlocked?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'community_channel';
  name: string;
  avatar: string;
  contactId?: string; // for direct chats
  participants?: string[]; // user IDs or contact IDs
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  communityId?: string;
  groupDescription?: string;
}

export interface StatusItem {
  id: string;
  type: 'image' | 'text';
  content: string; // image url or text content
  backgroundColor?: string;
  textColor?: string;
  caption?: string;
  timestamp: string;
  viewsCount?: number;
}

export interface UserStatus {
  id: string;
  contactId: string; // 'me' or contactId
  contactName: string;
  contactAvatar: string;
  statuses: StatusItem[];
  allSeen?: boolean;
}

export interface CommunitySubGroup {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  lastActivity: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  announcementChatId: string;
  subGroups: CommunitySubGroup[];
  createdAt: string;
}

export interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
  isGroup?: boolean;
  groupParticipants?: string[];
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Mon', 'Tue', etc.
  totalMinutes: number;
  messagesSent: number;
  messagesReceived: number;
  callMinutes: number;
}

export interface ActiveCallState {
  isActive: boolean;
  type: 'voice' | 'video';
  contact: Contact | { id: string; name: string; avatar: string };
  isGroup: boolean;
  groupParticipants?: { id: string; name: string; avatar: string }[];
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
}
