jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Mock react-native-webrtc
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
  RTCSessionDescription: jest.fn(),
  RTCIceCandidate: jest.fn(),
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      toURL: () => 'mock-stream-url',
    })),
  },
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));


