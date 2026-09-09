import React, { useState } from 'react';
import { 
  X, User, Shield, Moon, Sun, Volume2, Bell, Ban, 
  Check, Lock, Smartphone, Edit2
} from 'lucide-react';
import { Contact } from '../types';
import { playSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedContacts: Contact[];
  onUnblockContact: (contactId: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userName: string;
  userAbout: string;
  onUpdateProfile: (name: string, about: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  blockedContacts,
  onUnblockContact,
  isDarkMode,
  onToggleTheme,
  userName,
  userAbout,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'theme' | 'notifications'>('profile');
  const [name, setName] = useState(userName);
  const [about, setAbout] = useState(userAbout);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name.trim(), about.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div 
      id="whatsapp-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-lg bg-[#222e35] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#1f2c34] border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-base">WhatsApp Settings</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#111b21] px-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'privacy', label: 'Privacy & Blocked', icon: Shield },
            { id: 'theme', label: 'Appearance', icon: isDarkMode ? Moon : Sun },
            { id: 'notifications', label: 'Sounds', icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                    alt="My avatar"
                    className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Edit2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-2">Tap to change profile picture</span>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[11px] text-gray-500">This is not your username or pin. This name will be visible to your WhatsApp contacts.</span>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">About</label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Profile saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>End-to-End Encryption</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your personal messages and calls stay between you and the people you choose. Not even WhatsApp can read or listen to them.
                </p>
              </div>

              {/* Blocked Contacts Management */}
              <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Ban className="h-4 w-4 text-red-400" />
                    <span>Blocked Contacts ({blockedContacts.length})</span>
                  </div>
                </div>

                {blockedContacts.length === 0 ? (
                  <p className="text-xs text-gray-500">No blocked contacts.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={contact.avatar} alt={contact.name} className="h-7 w-7 rounded-full object-cover" />
                          <span className="font-medium text-white">{contact.name}</span>
                        </div>
                        <button
                          onClick={() => onUnblockContact(contact.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-medium transition"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Dark Theme</h4>
                  <p className="text-xs text-gray-400">WhatsApp signature dark green & obsidian palette</p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className={`p-2 rounded-xl transition ${
                    isDarkMode ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-sm font-semibold text-white">Sound Effects & Tones</h4>
                <p className="text-xs text-gray-400">Play sounds for incoming and outgoing messages and calls.</p>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => playSound('sent')}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center gap-2 transition"
                  >
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    <span>Test Sent Tone</span>
                  </button>
                  <button
                    onClick={() => playSound('received')}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center gap-2 transition"
                  >
                    <Bell className="h-4 w-4 text-emerald-400" />
                    <span>Test Recv Tone</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
