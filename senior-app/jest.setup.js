jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn()
}));


