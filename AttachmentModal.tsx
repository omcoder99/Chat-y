import React, { useState } from 'react';
import { 
  FileText, MapPin, Image as ImageIcon, X, Send, 
  Navigation, CheckCircle2, Upload, FileCheck
} from 'lucide-react';
import { AttachmentData } from '../types';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAttachment: (attachment: AttachmentData, captionText?: string) => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onSendAttachment,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'location' | 'media'>('document');
  
  // Document state
  const [docName, setDocName] = useState('Project_Requirement_Doc.pdf');
  const [docSize, setDocSize] = useState('1.8 MB');
  const [docType, setDocType] = useState('pdf');
  const [caption, setCaption] = useState('');

  // Location state
  const [locationType, setLocationType] = useState<'current' | 'live'>('current');
  const [liveDuration, setLiveDuration] = useState('1 hour');
  const [locationPlace, setLocationPlace] = useState('Connaught Place, New Delhi');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6315, lng: 77.2167 });
  const [isLocating, setIsLocating] = useState(false);

  // Preset location choices
  const presetLocations = [
    { name: 'Connaught Place, Central Delhi', lat: 28.6315, lng: 77.2167 },
    { name: 'Cyber City, Gurugram', lat: 28.4952, lng: 77.0894 },
    { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
    { name: 'Indiranagar 100ft Rd, Bengaluru', lat: 12.9716, lng: 77.6412 },
  ];

  if (!isOpen) return null;

  const handleFetchCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPlace(`Current GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        // Fallback to preset
        setLocationPlace('Connaught Place, New Delhi (Default)');
      },
      { timeout: 8000 }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setDocSize(`${sizeInMB} MB`);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      setDocType(ext);
    }
  };

  const handleSubmitDocument = () => {
    onSendAttachment({
      fileName: docName,
      fileSize: docSize,
      fileType: docType,
      url: '#',
    }, caption || undefined);
    onClose();
  };

  const handleSubmitLocation = () => {
    onSendAttachment({
      locationName: locationType === 'live' ? `📍 Live Location (Sharing for ${liveDuration}) - ${locationPlace}` : locationPlace,
      latitude: coords.lat,
      longitude: coords.lng,
    }, locationType === 'live' ? `Sharing live location (${liveDuration})` : 'Shared location pin');
    onClose();
  };

  const handleSubmitMedia = (imgUrl: string, mediaCaption: string) => {
    onSendAttachment({
      url: imgUrl,
      fileName: 'Photo.jpg',
      fileType: 'image',
    }, mediaCaption);
    onClose();
  };

  return (
    <div 
      id="whatsapp-attachment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#222e35] text-gray-100 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1f2c34]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              {activeTab === 'document' && <FileText className="h-5 w-5" />}
              {activeTab === 'location' && <MapPin className="h-5 w-5" />}
              {activeTab === 'media' && <ImageIcon className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {activeTab === 'document' && 'Send Document (फ़ाइल भेजें)'}
                {activeTab === 'location' && 'Share Location (लोकेशन शेयर करें)'}
                {activeTab === 'media' && 'Share Photos & Media'}
              </h3>
              <p className="text-xs text-gray-400">
                Encrypted WhatsApp transfer
              </p>
            </div>
          </div>

          <button
            id="attachment-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#111b21] px-4">
          <button
            id="tab-document-btn"
            onClick={() => setActiveTab('document')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'document'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Document</span>
          </button>
          <button
            id="tab-location-btn"
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'location'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </button>
          <button
            id="tab-media-btn"
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'media'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Photos</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'document' && (
            <div className="space-y-4">
              {/* File upload drag drop zone */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-xl p-6 cursor-pointer bg-[#111b21]/60 hover:bg-[#111b21] transition group">
                <Upload className="h-10 w-10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-200">
                  Upload file from computer / device
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PDF, DOCX, XLSX, PPT, ZIP up to 100 MB
                </span>
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {/* Document Preview Card */}
              <div className="bg-[#111b21] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/30">
                  {docType}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{docName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{docSize} • {docType.toUpperCase()} Document</div>
                </div>
                <FileCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              </div>

              {/* Sample Quick Documents */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Or select sample document
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'Office_Agreement_Final.pdf', size: '2.1 MB', type: 'pdf' },
                    { name: 'Invoice_Manali_Trip_2026.pdf', size: '890 KB', type: 'pdf' },
                    { name: 'Project_Design_Brief.docx', size: '3.4 MB', type: 'docx' },
                    { name: 'Expense_Sheet_Q3.xlsx', size: '1.2 MB', type: 'xlsx' }
                  ].map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDocName(doc.name);
                        setDocSize(doc.size);
                        setDocType(doc.type);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition ${
                        docName === doc.name
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                          : 'bg-[#111b21] border-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium truncate">{doc.name}</div>
                        <div className="text-gray-400 text-[10px]">{doc.size}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption input */}
              <div>
                <input
                  id="doc-caption-input"
                  type="text"
                  placeholder="Add a caption (optional)..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[#111b21] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                id="submit-send-document-btn"
                onClick={handleSubmitDocument}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <Send className="h-4 w-4" />
                <span>Send Document</span>
              </button>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Type selector: Current vs Live Location */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocationType('current')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    locationType === 'current'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-[#111b21] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="font-semibold text-sm flex items-center gap-1.5 text-emerald-400">
                    <MapPin className="h-4 w-4" /> Send Current Location
                  </span>
                  <span className="text-xs text-gray-400">Static GPS coordinates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType('live')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    locationType === 'live'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-[#111b21] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="font-semibold text-sm flex items-center gap-1.5 text-emerald-400">
                    <Navigation className="h-4 w-4 animate-pulse" /> Share Live Location
                  </span>
                  <span className="text-xs text-gray-400">Real-time tracking</span>
                </button>
              </div>

              {locationType === 'live' && (
                <div className="bg-[#111b21] p-3.5 rounded-xl border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Share Live Location For
                  </label>
                  <div className="flex gap-2">
                    {['15 minutes', '1 hour', '8 hours'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setLiveDuration(dur)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                          liveDuration === dur
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulated / Real Map preview */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#111b21] h-40 flex flex-col justify-end p-4">
                {/* Visual Map Pattern */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#162a26] via-[#102027] to-[#1e3a35] opacity-90">
                  {/* Grid lines simulating street grid */}
                  <div className="w-full h-full opacity-20 bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                {/* Pin in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="h-2 w-5 bg-black/40 rounded-full filter blur-xs mt-1"></div>
                  </div>
                </div>

                {/* Map Bottom Card */}
                <div className="relative z-10 bg-black/80 backdrop-blur rounded-lg p-2.5 border border-white/10 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <div className="text-xs font-medium text-white truncate">{locationPlace}</div>
                    <div className="text-[10px] text-emerald-400">Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchCurrentGPS}
                    disabled={isLocating}
                    className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1 shrink-0"
                    title="Get device GPS location"
                  >
                    <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'GPS'}</span>
                  </button>
                </div>
              </div>

              {/* Preset Places */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Or select nearby landmark
                </label>
                <div className="space-y-1.5">
                  {presetLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLocationPlace(loc.name);
                        setCoords({ lat: loc.lat, lng: loc.lng });
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                        locationPlace === loc.name
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                          : 'bg-[#111b21] border-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <span className="truncate">{loc.name}</span>
                      {locationPlace === loc.name && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="submit-send-location-btn"
                onClick={handleSubmitLocation}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <Send className="h-4 w-4" />
                <span>{locationType === 'live' ? 'Share Live Location' : 'Send Location Pin'}</span>
              </button>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Select Photo to Share
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                    caption: 'Beautiful scenic mountain view 🏔️',
                    name: 'Mountains.jpg'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
                    caption: 'Project planning whiteboard 📊',
                    name: 'Meeting_Notes.jpg'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
                    caption: 'Sunset beach vacation memories 🏖️',
                    name: 'Beach_Sunset.jpg'
                  },
                  {
                    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
                    caption: 'Conference event celebration 🎉',
                    name: 'Party_Event.jpg'
                  },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSubmitMedia(item.url, item.caption)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 cursor-pointer aspect-4/3 hover:border-emerald-500 transition"
                  >
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <p className="text-xs text-white truncate font-medium">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
