import { syncService } from '../../src/app/services/SyncService';
import { authManager } from '../../src/app/services/AuthManager';
import { apiService } from '../../src/app/services/ApiService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock authManager
jest.mock('../../src/app/services/AuthManager', () => ({
  authManager: {
    isAuthenticated: jest.fn(() => false),
    getToken: jest.fn(() => null),
  },
}));

// Mock apiService
jest.mock('../../src/app/services/ApiService', () => ({
  apiService: {
    post: jest.fn(),
  },
}));

describe('SyncService', () => {
  beforeEach(async () => {
    await syncService.clearSyncQueue();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    syncService.stopPeriodicSync();
    jest.useRealTimers();
  });

  it('should initialize successfully', async () => {
    await syncService.initialize();
    expect(syncService).toBeDefined();
  });

  it('should queue item for sync', async () => {
    const itemData = { name: 'test_event', payload: { test: true } };
    
    await syncService.queueItem('telemetry', itemData);
    
    const stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(1);
    expect(stats.pendingItems).toBe(1);
  });

  it('should sync photos when authenticated', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authManager.getToken as jest.Mock).mockReturnValue('mock-token');

    const mockPhotos = [
      {
        id: 'photo-1',
        title: 'Test Photo',
        uri: 'file://test.jpg',
        timestamp: Date.now(),
        size: 1000,
        width: 100,
        height: 100,
        isLocal: true,
      },
    ];

    await syncService.syncPhotos(mockPhotos);

    const stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(1);
    expect(stats.pendingItems).toBe(1);
  });

  it('should skip photo sync when not authenticated', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(false);

    const mockPhotos = [
      {
        id: 'photo-1',
        title: 'Test Photo',
        uri: 'file://test.jpg',
        timestamp: Date.now(),
        size: 1000,
        width: 100,
        height: 100,
        isLocal: true,
      },
    ];

    await syncService.syncPhotos(mockPhotos);

    const stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(0);
  });

  it('should sync telemetry events when authenticated', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);

    const mockEvents = [
      { name: 'test_event', payload: { test: true }, timestamp: Date.now() },
    ];

    await syncService.syncTelemetry(mockEvents);

    const stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(1);
    expect(stats.pendingItems).toBe(1);
  });

  it('should process sync queue when authenticated', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authManager.getToken as jest.Mock).mockReturnValue('mock-token');
    (apiService.post as jest.Mock).mockResolvedValue({ success: true });

    // Queue an item
    await syncService.queueItem('telemetry', { name: 'test_event' });

    // Process the queue
    await syncService.processSyncQueue();

    expect(apiService.post).toHaveBeenCalledWith('/telemetry', { name: 'test_event' }, {
      headers: { Authorization: 'Bearer mock-token' },
    });

    const stats = await syncService.getSyncStats();
    expect(stats.syncedItems).toBe(1);
    expect(stats.pendingItems).toBe(0);
  });

  it('should skip sync when not authenticated', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(false);

    // Queue an item
    await syncService.queueItem('telemetry', { name: 'test_event' });

    // Process the queue
    await syncService.processSyncQueue();

    expect(apiService.post).not.toHaveBeenCalled();

    const stats = await syncService.getSyncStats();
    expect(stats.syncedItems).toBe(0);
    expect(stats.pendingItems).toBe(1);
  });

  it('should handle sync errors and retry', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authManager.getToken as jest.Mock).mockReturnValue('mock-token');
    (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Queue an item
    await syncService.queueItem('telemetry', { name: 'test_event' });

    // Process the queue
    await syncService.processSyncQueue();

    const stats = await syncService.getSyncStats();
    expect(stats.syncedItems).toBe(0);
    expect(stats.pendingItems).toBe(1);
    expect(stats.failedItems).toBe(0); // Not failed yet, just pending
  });

  it('should remove items after max retries', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authManager.getToken as jest.Mock).mockReturnValue('mock-token');
    (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Queue an item
    await syncService.queueItem('telemetry', { name: 'test_event' });

    // Process the queue multiple times to trigger max retries
    for (let i = 0; i < 4; i++) {
      await syncService.processSyncQueue();
    }

    const stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(0); // Item should be removed after max retries
  });

  it('should start and stop periodic sync', async () => {
    await syncService.initialize();
    
    // Fast-forward time to trigger periodic sync
    jest.advanceTimersByTime(30000);
    
    // Stop periodic sync
    syncService.stopPeriodicSync();
    
    // Fast-forward again - should not trigger sync
    jest.advanceTimersByTime(30000);
    
    // No assertions needed, just ensuring no errors
  });

  it('should get sync statistics', async () => {
    const stats = await syncService.getSyncStats();
    
    expect(stats).toEqual({
      totalItems: 0,
      syncedItems: 0,
      pendingItems: 0,
      failedItems: 0,
      lastSyncTime: null,
    });
  });

  it('should clear sync queue', async () => {
    // Queue some items
    await syncService.queueItem('telemetry', { name: 'test1' });
    await syncService.queueItem('photo', { id: 'photo1' });

    let stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(2);

    // Clear queue
    await syncService.clearSyncQueue();

    stats = await syncService.getSyncStats();
    expect(stats.totalItems).toBe(0);
  });

  it('should force sync manually', async () => {
    (authManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authManager.getToken as jest.Mock).mockReturnValue('mock-token');
    (apiService.post as jest.Mock).mockResolvedValue({ success: true });

    // Queue an item
    await syncService.queueItem('telemetry', { name: 'test_event' });

    // Force sync
    await syncService.forceSync();

    expect(apiService.post).toHaveBeenCalled();
  });
});
