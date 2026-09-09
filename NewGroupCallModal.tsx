import React, { useState } from 'react';
import { Users, Video, Phone, X, Check } from 'lucide-react';
import { Contact } from '../types';

interface NewGroupCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onStartGroupCall: (participants: Contact[], type: 'voice' | 'video') => void;
}

export const NewGroupCallModal: React.FC<NewGroupCallModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onStartGroupCall,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleStart = (type: 'voice' | 'video') => {
    const selected = contacts.filter((c) => selectedIds.includes(c.id));
    if (selected.length === 0) {
      alert('Please select at least 1 contact to call');
      return;
    }
    onStartGroupCall(selected, type);
    onClose();
  };

  return (
    <div 
      id="whatsapp-new-group-call-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-md bg-[#222e35] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#1f2c34] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">New Group Call</h3>
              <p className="text-xs text-gray-400">
                {selectedIds.length} contact{selectedIds.length === 1 ? '' : 's'} selected (up to 32)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contacts list */}
        <div className="p-3 overflow-y-auto divide-y divide-white/5 flex-1">
          {contacts.map((contact) => {
            const isSelected = selectedIds.includes(contact.id);
            return (
              <div
                key={contact.id}
                onClick={() => toggleSelect(contact.id)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#111b21] cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{contact.name}</h4>
                    <p className="text-xs text-gray-400">{contact.phone}</p>
                  </div>
                </div>

                <div
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-black'
                      : 'border-gray-500 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom Buttons */}
        <div className="p-4 bg-[#1f2c34] border-t border-white/10 flex gap-3">
          <button
            onClick={() => handleStart('voice')}
            disabled={selectedIds.length === 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="h-4 w-4" />
            <span>Voice Group Call</span>
          </button>

          <button
            onClick={() => handleStart('video')}
            disabled={selectedIds.length === 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
          >
            <Video className="h-4 w-4" />
            <span>Video Group Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
