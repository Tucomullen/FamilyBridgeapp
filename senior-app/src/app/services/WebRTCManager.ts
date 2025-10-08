import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

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
import { io, Socket } from 'socket.io-client';
import { getIceServers } from '../config/iceServers';
import {
  CallState,
  CallQuality,
  CallStats,
  CallConfig,
  CallCallbacks,
  OfferMessage,
  AnswerMessage,
  IceCandidateMessage,
} from '../types/call';

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: Socket | null = null;
  private roomId: string = '';
  private callbacks: CallCallbacks = {};
  private statsInterval: any = null;

  constructor() {
    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    const configuration = {
      iceServers: getIceServers(true), // Include dev TURN server
      iceCandidatePoolSize: 10,
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    (this.peerConnection as any).onicecandidate = (event: any) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          targetId: 'broadcast', // Send to all in room
        });
      }
    };

    // Handle remote stream (modern approach)
    (this.peerConnection as any).ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        console.log('Remote stream added');
      }
    };

    // Handle connection state changes
    (this.peerConnection as any).onconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        this.callbacks.onStateChange?.('inCall');
      } else if (state === 'connecting') {
        this.callbacks.onStateChange?.('connecting');
      } else if (state === 'failed' || state === 'disconnected') {
        this.callbacks.onStateChange?.('error');
      }
    };
  }

  async startCall(config: CallConfig, callbacks: CallCallbacks = {}) {
    try {
      this.callbacks = callbacks;
      this.roomId = config.roomId;
      
      // Get local media
      this.localStream = await mediaDevices.getUserMedia({
        video: config.enableVideo,
        audio: config.enableAudio,
      });

      // Add local stream tracks to peer connection (modern approach)
      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      // Connect to signaling server
      this.connectSignaling();

      this.callbacks.onStateChange?.('connecting');
    } catch (error) {
      console.error('Failed to start call:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private connectSignaling() {
    const signalingUrl = 'http://localhost:3001'; // Default for development
    
    this.socket = io(signalingUrl, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket?.emit('join', this.roomId);
    });

    this.socket.on('user-joined', (socketId: string) => {
      console.log('User joined:', socketId);
      this.createOffer();
    });

    this.socket.on('offer', (data: OfferMessage) => {
      this.handleOffer(data.offer);
    });

    this.socket.on('answer', (data: AnswerMessage) => {
      this.handleAnswer(data.answer);
    });

    this.socket.on('ice-candidate', (data: IceCandidateMessage) => {
      this.handleIceCandidate(data.candidate);
    });

    this.socket.on('user-left', (socketId: string) => {
      console.log('User left:', socketId);
    });
  }

  private async createOffer() {
    try {
      const offer = await this.peerConnection?.createOffer();
      if (offer && this.peerConnection) {
        await this.peerConnection.setLocalDescription(offer);
        
        this.socket?.emit('offer', {
          roomId: this.roomId,
          offer,
          targetId: 'broadcast',
        });
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer as any));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        this.socket?.emit('answer', {
          roomId: this.roomId,
          answer,
          targetId: 'broadcast',
        });
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer as any));
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  async endCall() {
    try {
      // Stop stats monitoring
      if (this.statsInterval) {
        clearInterval(this.statsInterval);
        this.statsInterval = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Disconnect from signaling server
      if (this.socket) {
        this.socket.emit('leave', this.roomId);
        this.socket.disconnect();
        this.socket = null;
      }

      this.callbacks.onStateChange?.('ended');
    } catch (error) {
      console.error('Failed to end call:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack as any).getCapabilities();
        if (capabilities && capabilities.facingMode) {
          const currentFacingMode = (videoTrack as any).getSettings().facingMode;
          const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
          
          videoTrack.applyConstraints({
            facingMode: newFacingMode,
          });
        }
      }
    }
  }

  startStatsMonitoring() {
    this.statsInterval = setInterval(async () => {
      if (this.peerConnection) {
        const stats = await this.getCallStats();
        this.callbacks.onStatsUpdate?.(stats);
        
        const quality = this.getCallQuality(stats);
        this.callbacks.onQualityChange?.(quality);
      }
    }, 1000);
  }

  private async getCallStats(): Promise<CallStats> {
    // Simplified stats - in production, you'd parse RTCStatsReport
    return {
      bitrate: 0,
      jitter: 0,
      packetLoss: 0,
      latency: 0,
    };
  }

  private getCallQuality(stats: CallStats): CallQuality {
    // Simplified quality assessment
    if (stats.bitrate > 1000000) return 'good';
    if (stats.bitrate > 500000) return 'fair';
    return 'poor';
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
