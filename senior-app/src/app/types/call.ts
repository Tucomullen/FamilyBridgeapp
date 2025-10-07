// WebRTC types for React Native
interface RTCIceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
}

export type CallState = 'idle' | 'connecting' | 'inCall' | 'ended' | 'error';

export type CallQuality = 'good' | 'fair' | 'poor';

export interface CallStats {
  bitrate: number;
  jitter: number;
  packetLoss: number;
  latency: number;
}

export interface CallHistoryItem {
  id: string;
  roomId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  state: CallState;
  quality?: CallQuality;
}

export interface SignalingMessage {
  roomId: string;
  targetId: string;
  from: string;
}

export interface OfferMessage extends SignalingMessage {
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends SignalingMessage {
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends SignalingMessage {
  candidate: RTCIceCandidateInit;
}

export interface CallConfig {
  roomId: string;
  enableVideo: boolean;
  enableAudio: boolean;
  iceServers: RTCIceServer[];
}

export interface CallCallbacks {
  onStateChange?: (state: CallState) => void;
  onQualityChange?: (quality: CallQuality) => void;
  onStatsUpdate?: (stats: CallStats) => void;
  onError?: (error: Error) => void;
}
