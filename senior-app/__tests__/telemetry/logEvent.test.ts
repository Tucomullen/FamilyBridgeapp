import { logEvent } from '../../src/app/telemetry/logEvent';
import { featureFlags } from '../../src/app/flags/featureFlags';

// Mock featureFlags
jest.mock('../../src/app/flags/featureFlags', () => ({
  featureFlags: {
    isEnabled: jest.fn(),
  },
}));

// Mock console.log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('logEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
  });

  it('logs event when telemetry is enabled', async () => {
    (featureFlags.isEnabled as jest.Mock).mockReturnValue(true);
    
    await logEvent('call_start', { userId: '123' });
    
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[TELEMETRY]',
      expect.objectContaining({
        name: 'call_start',
        payload: { userId: '123' },
        timestamp: expect.any(String),
        sessionId: expect.any(String),
      })
    );
  });

  it('does not log when telemetry is disabled', async () => {
    (featureFlags.isEnabled as jest.Mock).mockReturnValue(false);
    
    await logEvent('call_start', { userId: '123' });
    
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('logs event without payload', async () => {
    (featureFlags.isEnabled as jest.Mock).mockReturnValue(true);
    
    await logEvent('call_start');
    
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[TELEMETRY]',
      expect.objectContaining({
        name: 'call_start',
        payload: {},
        timestamp: expect.any(String),
        sessionId: expect.any(String),
      })
    );
  });

  it('generates unique session IDs', async () => {
    (featureFlags.isEnabled as jest.Mock).mockReturnValue(true);
    
    await logEvent('call_start');
    await logEvent('call_end');
    
    const calls = mockConsoleLog.mock.calls;
    const sessionId1 = calls[0][1].sessionId;
    const sessionId2 = calls[1][1].sessionId;
    
    expect(sessionId1).not.toBe(sessionId2);
  });
});
