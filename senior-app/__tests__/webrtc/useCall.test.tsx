import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useCall } from '../../src/app/hooks/useCall';
import { CallHistoryService } from '../../src/app/services/CallHistoryService';

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

// Mock CallHistoryService
jest.mock('../../src/app/services/CallHistoryService', () => ({
  CallHistoryService: {
    addCall: jest.fn(() => Promise.resolve()),
    updateCall: jest.fn(() => Promise.resolve()),
    getCallHistory: jest.fn(() => Promise.resolve([])),
    clearHistory: jest.fn(() => Promise.resolve()),
  },
}));

// Mock telemetry
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(() => Promise.resolve()),
}));

describe('useCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useCall());
    
    expect(result.current.state).toBe('idle');
    expect(result.current.quality).toBe('good');
    expect(result.current.isMuted).toBe(false);
  });

  it('should start call and update state', async () => {
    const { result } = renderHook(() => useCall());
    
    await act(async () => {
      await result.current.startCall('test-room', true);
    });
    
    expect(result.current.state).toBe('connecting');
  });

  it('should end call and update state', async () => {
    const { result } = renderHook(() => useCall());
    
    await act(async () => {
      await result.current.startCall('test-room', true);
      await result.current.endCall();
    });
    
    expect(result.current.state).toBe('ended');
  });

  it('should toggle mute state', async () => {
    const { result } = renderHook(() => useCall());
    
    await act(async () => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
  });

  it('should add call to history when connected', async () => {
    const { result } = renderHook(() => useCall());
    
    await act(async () => {
      await result.current.startCall('test-room', true);
    });
    
    expect(CallHistoryService.addCall).toHaveBeenCalledWith({
      roomId: 'test-room',
      startTime: expect.any(Number),
      state: 'inCall',
    });
  });
});
