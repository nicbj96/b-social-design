'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface CallModalProps {
  callState: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  isVideo: boolean;
  otherUserName: string;
  onAccept: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export default function CallModal({
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  callDuration,
  isVideo,
  otherUserName,
  onAccept,
  onEnd,
  onToggleMute,
  onToggleVideo,
}: CallModalProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [displayDuration, setDisplayDuration] = useState('00:00');

  // ALL hooks MUST be called before any early return (React rules of hooks)

  // Attach streams to video elements
  // Include callState + isVideo in deps so effects re-run when video elements mount
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState, isVideo]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState, isVideo]);

  // Attach remote stream to audio element for audio-only calls
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  // Format call duration as MM:SS
  useEffect(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    setDisplayDuration(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
  }, [callDuration]);

  // Only render if not idle — AFTER all hooks
  if (callState === 'idle') {
    return null;
  }

  // Get user initials for avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${getUserInitials(
    otherUserName
  )}&background=4ECDC4&color=060a0f&size=120&bold=true`;

  return (
    <>
      {/* Hidden audio element for audio-only calls */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(78, 205, 196, 0.7);
          }
          70% {
            box-shadow: 0 0 0 30px rgba(78, 205, 196, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(78, 205, 196, 0);
          }
        }

        @keyframes pulse-ring-fast {
          0% {
            box-shadow: 0 0 0 0 rgba(78, 205, 196, 0.7);
          }
          70% {
            box-shadow: 0 0 0 40px rgba(78, 205, 196, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(78, 205, 196, 0);
          }
        }

        @keyframes bounce-dots {
          0%, 20%, 50%, 80%, 100% {
            opacity: 1;
          }
          40% {
            opacity: 0.3;
          }
          60% {
            opacity: 0.5;
          }
        }

        .pulse-animate {
          animation: pulse-ring 2s infinite;
        }

        .pulse-animate-fast {
          animation: pulse-ring-fast 1.5s infinite;
        }

        .bounce-text {
          display: inline;
        }

        .bounce-text span {
          animation: bounce-dots 1.4s infinite;
        }

        .bounce-text span:nth-child(1) {
          animation-delay: 0s;
        }

        .bounce-text span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .bounce-text span:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Full screen modal overlay — z-[10000] to cover CalmBottomNav (z-[9999]) */}
      <div className="fixed inset-0 bg-[#060a0f] z-[10000] flex flex-col">
        {/* Video Call - Connected State */}
        {isVideo && callState === 'connected' && (
          <>
            {/* Remote video fills screen */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Duration display top-center */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-2xl font-semibold z-10">
              {displayDuration}
            </div>

            {/* Other user's name top-left */}
            <div className="absolute top-6 left-6 text-white text-lg font-medium z-10">
              {otherUserName}
            </div>

            {/* Local video PiP bottom-right */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-24 right-4 w-40 h-32 rounded-2xl border-2 border-[#4ECDC4] object-cover"
            />

            {/* Bottom control bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent pt-8 pb-6 px-6 flex items-center justify-center gap-4">
              {/* Mute toggle */}
              <button
                onClick={onToggleMute}
                className="p-3 rounded-full bg-[#4ECDC4] hover:bg-[#3db8af] transition-colors text-[#0a0f1a]"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff size={24} />
                ) : (
                  <Mic size={24} />
                )}
              </button>

              {/* Video toggle */}
              <button
                onClick={onToggleVideo}
                className="p-3 rounded-full bg-[#4ECDC4] hover:bg-[#3db8af] transition-colors text-[#0a0f1a]"
                aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? (
                  <VideoOff size={24} />
                ) : (
                  <Video size={24} />
                )}
              </button>

              {/* End call button */}
              <button
                onClick={onEnd}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white"
                aria-label="End call"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </>
        )}

        {/* Audio Call - Connected State */}
        {!isVideo && callState === 'connected' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Avatar with pulse */}
            <div className="mb-8 pulse-animate">
              <img
                src={avatarUrl}
                alt={otherUserName}
                className="w-32 h-32 rounded-full"
              />
            </div>

            {/* User name */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {otherUserName}
            </h2>

            {/* Call duration */}
            <p className="text-4xl font-bold text-[#4ECDC4] mb-12">
              {displayDuration}
            </p>

            {/* Bottom control bar */}
            <div className="flex items-center justify-center gap-4">
              {/* Mute toggle */}
              <button
                onClick={onToggleMute}
                className="p-4 rounded-full bg-[#4ECDC4] hover:bg-[#3db8af] transition-colors text-[#0a0f1a]"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff size={28} />
                ) : (
                  <Mic size={28} />
                )}
              </button>

              {/* End call button */}
              <button
                onClick={onEnd}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white"
                aria-label="End call"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}

        {/* Calling State */}
        {callState === 'calling' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Avatar with pulse */}
            <div className="mb-8 pulse-animate">
              <img
                src={avatarUrl}
                alt={otherUserName}
                className="w-32 h-32 rounded-full"
              />
            </div>

            {/* User name */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {otherUserName}
            </h2>

            {/* Calling status with animated dots */}
            <p className="text-lg text-[#4ECDC4] mb-12 bounce-text">
              Ringer
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>

            {/* End call button only */}
            <button
              onClick={onEnd}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white"
              aria-label="End call"
            >
              <PhoneOff size={28} />
            </button>
          </div>
        )}

        {/* Ringing State */}
        {callState === 'ringing' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Avatar with fast pulse */}
            <div className="mb-8 pulse-animate-fast">
              <img
                src={avatarUrl}
                alt={otherUserName}
                className="w-32 h-32 rounded-full"
              />
            </div>

            {/* Incoming call status */}
            <p className="text-lg text-gray-400 mb-2">Indgående opkald</p>

            {/* User name */}
            <h2 className="text-2xl font-bold text-white mb-8">
              {otherUserName}
            </h2>

            {/* Accept and Decline buttons */}
            <div className="flex items-center justify-center gap-6">
              {/* Accept button */}
              <button
                onClick={onAccept}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors text-white"
                aria-label="Accept call"
              >
                <Phone size={28} />
              </button>

              {/* Decline button */}
              <button
                onClick={onEnd}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white"
                aria-label="Decline call"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}

        {/* Ended State */}
        {callState === 'ended' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Avatar */}
            <div className="mb-8">
              <img
                src={avatarUrl}
                alt={otherUserName}
                className="w-32 h-32 rounded-full"
              />
            </div>

            {/* Call ended message */}
            <p className="text-2xl font-semibold text-gray-400">
              Opkald afsluttet
            </p>
          </div>
        )}
      </div>
    </>
  );
}
