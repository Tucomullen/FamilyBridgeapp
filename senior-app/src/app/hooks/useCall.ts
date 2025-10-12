import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCManager } from '../services/WebRTCManager';
import { CallHistoryService } from '../services/CallHistoryService';
import { CallState, CallQuality, CallStats, CallConfig } from '../types/call';
import { logEvent } from '../telemetry/logEvent';

export function useCall() {
  const [state, setState] = useState<CallState>('idle');
  const [quality, setQuality] = useState<CallQuality>('good');
  const [stats, setStats] = useState<CallStats>({
    bitrate: 0,
    jitter: 0,
    packetLoss: 0,
    latency: 0,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  
  const webrtcManager = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    webrtcManager.current = new WebRTCManager();
    
    return () => {
      if (webrtcManager.current) {
        webrtcManager.current.endCall();
      }
    };
  }, []);

  const startCall = useCallback(async (roomId: string, enableVideo: boolean = true) => {
    if (!webrtcManager.current) return;

    try {
      const config: CallConfig = {
        roomId,
        enableVideo,
        enableAudio: true,
        iceServers: [], // Will be set by WebRTCManager
      };

      const callbacks = {
        onStateChange: async (newState: CallState) => {
          setState(newState);
          if (newState === 'inCall') {
            webrtcManager.current?.startStatsMonitoring();
            logEvent('call_connected');
            
            // Add call to history
            const callId = Date.now().toString();
            setCurrentCallId(callId);
            await CallHistoryService.addCall({
              roomId,
              startTime: Date.now(),
              state: 'inCall',
            });
          } else if (newState === 'ended') {
            logEvent('call_end');
            
            // Update call in history
            if (currentCallId) {
              await CallHistoryService.updateCall(currentCallId, {
                endTime: Date.now(),
                state: 'ended',
              });
              setCurrentCallId(null);
            }
          } else if (newState === 'error') {
            logEvent('call_error');
            
            // Update call in history
            if (currentCallId) {
              await CallHistoryService.updateCall(currentCallId, {
                endTime: Date.now(),
                state: 'error',
              });
              setCurrentCallId(null);
            }
          }
        },
        onQualityChange: (newQuality: CallQuality) => {
          setQuality(newQuality);
        },
        onStatsUpdate: (newStats: CallStats) => {
          setStats(newStats);
        },
        onError: (error: Error) => {
          console.error('Call error:', error);
          setState('error');
          logEvent('call_error', { error: error.message });
        },
      };

      await webrtcManager.current.startCall(config, callbacks);
      logEvent('call_start', { roomId, enableVideo });
    } catch (error) {
      console.error('Failed to start call:', error);
      setState('error');
      logEvent('call_error', { error: (error as Error).message });
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!webrtcManager.current) return;

    try {
      await webrtcManager.current.endCall();
      setState('ended');
      logEvent('call_end');
    } catch (error) {
      console.error('Failed to end call:', error);
      setState('error');
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!webrtcManager.current) return;

    const newMuteState = webrtcManager.current.toggleMute();
    setIsMuted(!newMuteState);
    logEvent('call_mute_toggle', { muted: !newMuteState });
  }, []);

  const switchCamera = useCallback(() => {
    if (!webrtcManager.current) return;

    webrtcManager.current.switchCamera();
    logEvent('call_camera_switch');
  }, []);

  const getLocalStream = useCallback(() => {
    return webrtcManager.current?.getLocalStream() || null;
  }, []);

  const getRemoteStream = useCallback(() => {
    return webrtcManager.current?.getRemoteStream() || null;
  }, []);

  return {
    state,
    quality,
    stats,
    isMuted,
    isVideoEnabled,
    startCall,
    endCall,
    toggleMute,
    switchCamera,
    getLocalStream,
    getRemoteStream,
  };
}
