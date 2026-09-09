import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, 
  Users, Maximize2, Minimize2, UserPlus, PhoneIncoming
} from 'lucide-react';
import { ActiveCallState } from '../types';
import { playSound } from '../utils/audio';

interface CallModalProps {
  call: ActiveCallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onAddParticipant?: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useLocalWebcam, setUseLocalWebcam] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sound effect on call start
  useEffect(() => {
    if (call.status === 'calling' || call.status === 'ringing') {
      playSound('dial');
      const interval = setInterval(() => {
        if (call.status === 'calling' || call.status === 'ringing') {
          playSound('dial');
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [call.status]);

  // Handle webcam stream for video call if video enabled
  useEffect(() => {
    if (call.type === 'video' && call.isVideoEnabled) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          setUseLocalWebcam(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Fallback to simulated camera view if user denies webcam
          setUseLocalWebcam(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setUseLocalWebcam(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [call.type, call.isVideoEnabled]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      id="whatsapp-active-call-modal"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300 ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div 
        className={`relative flex flex-col justify-between overflow-hidden bg-[#111b21] text-white shadow-2xl transition-all ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-4xl h-[85vh] max-h-[720px] rounded-2xl border border-white/10'
        }`}
      >
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {call.status === 'connected' ? 'End-to-end encrypted' : 'WhatsApp Call'}
            </span>
            <span className="text-sm text-gray-300 font-medium">
              {call.status === 'calling' && 'Calling...'}
              {call.status === 'ringing' && 'Ringing...'}
              {call.status === 'connected' && formatCallTime(call.durationSeconds)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="call-fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Call Center Stage */}
        <div className="relative flex-1 flex items-center justify-center p-6">
          {call.type === 'video' ? (
            /* Video Call Screen */
            <div className="w-full h-full grid gap-4 grid-cols-1 md:grid-cols-2 relative rounded-xl overflow-hidden">
              {/* Remote Contact Video / Avatar */}
              <div className="relative flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-inner">
                <img
                  src={call.contact.avatar}
                  alt={call.contact.name}
                  className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 opacity-30"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={call.contact.avatar}
                      alt={call.contact.name}
                      className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                    />
                    {call.status === 'connected' && (
                      <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-gray-900"></span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
                    {call.contact.name}
                  </h3>
                  <p className="text-sm text-emerald-400 mt-1">
                    {call.status === 'connected' ? 'Video Connected' : 'Connecting video feed...'}
                  </p>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-xs font-medium">
                  {call.contact.name}
                </div>
              </div>

              {/* Local User Self Video Tile */}
              <div className="relative flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden border border-white/10">
                {call.isVideoEnabled ? (
                  useLocalWebcam ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-emerald-950/40">
                      <div className="h-24 w-24 rounded-full bg-emerald-600 flex items-center justify-center text-3xl font-bold mb-3 shadow-lg">
                        You
                      </div>
                      <p className="text-xs text-gray-400">Camera preview simulated</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <VideoOff className="h-12 w-12 mb-2" />
                    <p className="text-sm">Camera is turned off</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
                  <span>You</span>
                  {call.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                </div>
              </div>

              {/* Group call participant preview if group */}
              {call.isGroup && call.groupParticipants && (
                <div className="absolute top-16 right-4 z-20 flex -space-x-2 bg-black/60 backdrop-blur p-2 rounded-full border border-white/10">
                  {call.groupParticipants.map((p, idx) => (
                    <img
                      key={idx}
                      src={p.avatar}
                      alt={p.name}
                      title={p.name}
                      className="h-8 w-8 rounded-full border-2 border-emerald-500 object-cover"
                    />
                  ))}
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-xs font-bold text-white">
                    +{call.groupParticipants.length}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Voice Call Screen */
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                {/* Animated calling pulses */}
                {(call.status === 'calling' || call.status === 'ringing') && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></div>
                    <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse"></div>
                  </>
                )}
                <img
                  src={call.contact.avatar}
                  alt={call.contact.name}
                  className="h-36 w-36 md:h-44 md:w-44 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10"
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                {call.contact.name}
              </h2>

              <p className="text-base text-gray-300 flex items-center gap-2 justify-center">
                {call.status === 'calling' && 'WhatsApp Voice Calling...'}
                {call.status === 'ringing' && 'Ringing...'}
                {call.status === 'connected' && (
                  <span className="text-emerald-400 font-mono text-lg">
                    {formatCallTime(call.durationSeconds)}
                  </span>
                )}
              </p>

              {call.isGroup && (
                <div className="mt-4 flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs text-gray-300">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>Group Voice Call ({call.groupParticipants?.length || 3} members)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 flex items-center justify-center space-x-4 md:space-x-6 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          {/* Mute Button */}
          <button
            id="call-toggle-mic-btn"
            onClick={onToggleMute}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              call.isMuted 
                ? 'bg-red-500/80 hover:bg-red-600 text-white' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={call.isMuted ? 'Unmute' : 'Mute'}
          >
            {call.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* Video Toggle Button (for video calls or upgrading voice call) */}
          <button
            id="call-toggle-video-btn"
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              !call.isVideoEnabled 
                ? 'bg-red-500/80 hover:bg-red-600 text-white' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={call.isVideoEnabled ? 'Stop Video' : 'Start Video'}
          >
            {call.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          {/* Speaker Button */}
          <button
            id="call-toggle-speaker-btn"
            onClick={onToggleSpeaker}
            className={`p-4 rounded-full transition-transform active:scale-95 ${
              call.isSpeakerOn 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-white/15 hover:bg-white/25 text-gray-300'
            }`}
            title={call.isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {call.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>

          {/* End Call Button */}
          <button
            id="call-end-btn"
            onClick={() => {
              playSound('hangup');
              onEndCall();
            }}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 transition-transform active:scale-90"
            title="End Call"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
