import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'end-call';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  callerId?: string;
  withVideo?: boolean;
}

export interface UseWebRTCReturn {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  startCall: (withVideo: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

export function useWebRTC(
  conversationId: string | null,
  myId: string | null,
): UseWebRTCReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RealtimeChannel | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const remoteOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const remoteIdRef = useRef<string | null>(null);
  const withVideoRef = useRef(false);

  // Clean up media tracks
  const stopMediaTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach(track => track.stop());
  };

  // Close peer connection
  const closePeerConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  // Stop duration timer
  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    setCallDuration(0);
  };

  // Start duration timer
  const startDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    let elapsed = 0;
    durationInterval.current = setInterval(() => {
      elapsed += 1;
      setCallDuration(elapsed);
    }, 1000);
  };

  // Handle incoming ICE candidates
  const handleIncomingIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  };

  // Send signaling message via Supabase broadcast
  const sendSignalingMessage = (message: SignalingMessage) => {
    if (!channel.current) return;
    channel.current.send({
      type: 'broadcast',
      event: 'signaling',
      payload: { ...message, senderId: myId },
    });
  };

  // Create and setup peer connection
  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack event received');
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'closed') {
        endCall();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        endCall();
      }
    };

    return pc;
  };

  // Start a call (as the caller)
  const startCall = async (withVideo: boolean) => {
    if (!conversationId || !myId) {
      console.error('[WebRTC] Missing conversationId or myId');
      return;
    }

    try {
      setCallState('calling');
      withVideoRef.current = withVideo;

      // Get user media
      const mediaConstraints = {
        audio: true,
        video: withVideo ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(stream);

      // Create peer connection
      peerConnection.current = createPeerConnection();

      // Add local tracks
      stream.getTracks().forEach(track => {
        peerConnection.current!.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // Send offer via signaling
      sendSignalingMessage({
        type: 'offer',
        sdp: offer,
        callerId: myId,
        withVideo,
      });

      console.log('[WebRTC] Offer sent');
    } catch (error) {
      console.error('[WebRTC] Error starting call:', error);
      setCallState('ended');
      stopMediaTracks(localStream);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!remoteOfferRef.current || !peerConnection.current) {
      console.error('[WebRTC] No remote offer or peer connection');
      return;
    }

    try {
      // Get user media
      const mediaConstraints = {
        audio: true,
        video: withVideoRef.current ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(stream);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current!.addTrack(track, stream);
      });

      // Set remote description
      await peerConnection.current.setRemoteDescription(remoteOfferRef.current);

      // Create and send answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      sendSignalingMessage({
        type: 'answer',
        sdp: answer,
      });

      setCallState('connected');
      startDurationTimer();

      console.log('[WebRTC] Answer sent, call connected');
    } catch (error) {
      console.error('[WebRTC] Error accepting call:', error);
      setCallState('ended');
      stopMediaTracks(localStream);
    }
  };

  // End call
  const endCall = () => {
    if (channel.current) {
      sendSignalingMessage({ type: 'end-call' });
    }
    closePeerConnection();
    stopMediaTracks(localStream);
    stopMediaTracks(remoteStream);
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setIsMuted(false);
    setIsVideoOff(false);
    stopDurationTimer();
    remoteOfferRef.current = null;
    remoteIdRef.current = null;
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Setup Supabase Realtime channel
  useEffect(() => {
    if (!conversationId || !myId) return;

    const channelName = `call:${conversationId}`;
    channel.current = supabase.channel(channelName);

    channel.current.on(
      'broadcast',
      { event: 'signaling' },
      ({ payload }: { payload: SignalingMessage & { senderId?: string } }) => {
        // Ignore own messages
        if (payload.senderId === myId) return;

        remoteIdRef.current = payload.senderId || null;

        if (payload.type === 'offer') {
          console.log('[WebRTC] Received offer');
          remoteOfferRef.current = payload.sdp || null;
          withVideoRef.current = payload.withVideo || false;

          // Create peer connection on receiving offer
          if (!peerConnection.current) {
            peerConnection.current = createPeerConnection();
          }

          setCallState('ringing');
        } else if (payload.type === 'answer') {
          console.log('[WebRTC] Received answer');
          if (peerConnection.current && payload.sdp) {
            peerConnection.current
              .setRemoteDescription(payload.sdp)
              .then(() => {
                setCallState('connected');
                startDurationTimer();
              })
              .catch(error => {
                console.error('[WebRTC] Error setting remote description:', error);
              });
          }
        } else if (payload.type === 'ice-candidate') {
          console.log('[WebRTC] Received ICE candidate');
          if (payload.candidate) {
            handleIncomingIceCandidate(payload.candidate);
          }
        } else if (payload.type === 'end-call') {
          console.log('[WebRTC] Received end-call');
          endCall();
        }
      },
    );

    channel.current.subscribe((status) => {
      console.log(`[WebRTC] Channel status: ${status}`);
      if (status === 'CHANNEL_ERROR') {
        console.error('[WebRTC] Channel subscription failed');
      }
    });

    return () => {
      if (channel.current) {
        supabase.removeChannel(channel.current);
      }
    };
  }, [conversationId, myId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTimer();
      closePeerConnection();
      stopMediaTracks(localStream);
      stopMediaTracks(remoteStream);
    };
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
