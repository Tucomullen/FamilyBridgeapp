import { WebRTCManager } from '../../src/app/services/WebRTCManager';

// Mock WebRTC
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn(() => ({
    createOffer: jest.fn(() => Promise.resolve({ type: 'offer', sdp: 'test-sdp' })),
    createAnswer: jest.fn(() => Promise.resolve({ type: 'answer', sdp: 'test-sdp' })),
    setLocalDescription: jest.fn(() => Promise.resolve()),
    setRemoteDescription: jest.fn(() => Promise.resolve()),
    addIceCandidate: jest.fn(() => Promise.resolve()),
    addStream: jest.fn(),
    close: jest.fn(),
    onicecandidate: null,
    onaddstream: null,
    onconnectionstatechange: null,
  })),
  RTCView: 'RTCView',
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      toURL: () => 'mock-stream-url',
    })),
  },
}));

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

describe('WebRTCManager', () => {
  let manager: WebRTCManager;

  beforeEach(() => {
    manager = new WebRTCManager();
  });

  afterEach(() => {
    if (manager) {
      manager.endCall();
    }
  });

  it('should create WebRTCManager instance', () => {
    expect(manager).toBeInstanceOf(WebRTCManager);
  });

  it('should start call with valid config', async () => {
    const config = {
      roomId: 'test-room',
      enableVideo: true,
      enableAudio: true,
      iceServers: [],
    };

    const callbacks = {
      onStateChange: jest.fn(),
      onQualityChange: jest.fn(),
      onStatsUpdate: jest.fn(),
      onError: jest.fn(),
    };

    await manager.startCall(config, callbacks);

    expect(callbacks.onStateChange).toHaveBeenCalledWith('connecting');
  });

  it('should end call successfully', async () => {
    const config = {
      roomId: 'test-room',
      enableVideo: true,
      enableAudio: true,
      iceServers: [],
    };

    await manager.startCall(config, {});
    await manager.endCall();

    // Should not throw
    expect(true).toBe(true);
  });

  it('should toggle mute state', async () => {
    const config = {
      roomId: 'test-room',
      enableVideo: true,
      enableAudio: true,
      iceServers: [],
    };

    await manager.startCall(config, {});
    const isMuted = manager.toggleMute();

    expect(typeof isMuted).toBe('boolean');
  });

  it('should switch camera', async () => {
    const config = {
      roomId: 'test-room',
      enableVideo: true,
      enableAudio: true,
      iceServers: [],
    };

    await manager.startCall(config, {});
    
    // Should not throw
    expect(() => manager.switchCamera()).not.toThrow();
  });
});
