import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './ApiService';
import { authManager } from './AuthManager';
import { Photo } from './PhotoService';
import { logEvent } from '../telemetry/logEvent';

export interface SyncItem {
  id: string;
  type: 'photo' | 'telemetry';
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

export interface SyncStats {
  totalItems: number;
  syncedItems: number;
  pendingItems: number;
  failedItems: number;
  lastSyncTime: number | null;
}

class SyncService {
  private isInitialized = false;
  private isSyncing = false;
  private readonly SYNC_QUEUE_KEY = 'familybridge_sync_queue';
  private readonly SYNC_STATS_KEY = 'familybridge_sync_stats';
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start periodic sync
      this.startPeriodicSync();
      this.isInitialized = true;
      console.log('🔄 SyncService initialized');
    } catch (error) {
      console.error('🔄 Failed to initialize SyncService:', error);
      this.isInitialized = true;
    }
  }

  // Add item to sync queue
  async queueItem(type: 'photo' | 'telemetry', data: any): Promise<void> {
    try {
      const item: SyncItem = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        synced: false,
        retryCount: 0,
      };

      const queue = await this.getSyncQueue();
      queue.push(item);
      await this.saveSyncQueue(queue);

      console.log(`🔄 Queued ${type} item for sync:`, item.id);
    } catch (error) {
      console.error('🔄 Failed to queue item:', error);
    }
  }

  // Sync photos with backend
  async syncPhotos(photos: Photo[]): Promise<void> {
    try {
      console.log('🔄 Syncing photos with backend...');

      if (!authManager.isAuthenticated()) {
        console.log('🔄 Not authenticated, skipping photo sync');
        return;
      }

      const token = authManager.getToken();
      if (!token) {
        console.log('🔄 No token available for photo sync');
        return;
      }

      // For now, just queue each photo for sync
      for (const photo of photos) {
        if (!photo.isLocal) continue; // Only sync local photos

        await this.queueItem('photo', {
          id: photo.id,
          title: photo.title,
          uri: photo.uri,
          timestamp: photo.timestamp,
          size: photo.size,
          width: photo.width,
          height: photo.height,
        });
      }

      console.log(`🔄 Queued ${photos.length} photos for sync`);
    } catch (error) {
      console.error('🔄 Failed to sync photos:', error);
    }
  }

  // Sync telemetry events with backend
  async syncTelemetry(events: any[]): Promise<void> {
    try {
      console.log('🔄 Syncing telemetry events with backend...');

      if (!authManager.isAuthenticated()) {
        console.log('🔄 Not authenticated, skipping telemetry sync');
        return;
      }

      // For now, just queue each event for sync
      for (const event of events) {
        await this.queueItem('telemetry', {
          name: event.name,
          payload: event.payload,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
        });
      }

      console.log(`🔄 Queued ${events.length} telemetry events for sync`);
    } catch (error) {
      console.error('🔄 Failed to sync telemetry:', error);
    }
  }

  // Process sync queue
  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('🔄 Sync already in progress, skipping');
      return;
    }

    if (!authManager.isAuthenticated()) {
      console.log('🔄 Not authenticated, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      const queue = await this.getSyncQueue();
      const pendingItems = queue.filter(item => !item.synced);

      if (pendingItems.length === 0) {
        console.log('🔄 No pending items to sync');
        return;
      }

      console.log(`🔄 Processing ${pendingItems.length} pending sync items...`);

      const token = authManager.getToken();
      if (!token) {
        console.log('🔄 No token available for sync');
        return;
      }

      for (const item of pendingItems) {
        try {
          await this.syncItem(item, token);
          
          // Mark as synced
          item.synced = true;
          await this.saveSyncQueue(queue);
          
          console.log(`✅ Synced ${item.type} item:`, item.id);
        } catch (error) {
          console.error(`❌ Failed to sync ${item.type} item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove item if max retries reached
          if (item.retryCount >= this.MAX_RETRIES) {
            console.log(`🗑️ Removing failed item after ${this.MAX_RETRIES} retries:`, item.id);
            const index = queue.indexOf(item);
            if (index > -1) {
              queue.splice(index, 1);
            }
          }
          
          await this.saveSyncQueue(queue);
        }
      }

      await this.updateSyncStats();
    } catch (error) {
      console.error('🔄 Sync queue processing failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync individual item
  private async syncItem(item: SyncItem, token: string): Promise<void> {
    const headers = { Authorization: `Bearer ${token}` };

    switch (item.type) {
      case 'photo':
        await apiService.post('/photos', item.data, { headers });
        break;
      case 'telemetry':
        await apiService.post('/telemetry', item.data, { headers });
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  // Start periodic sync
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, this.SYNC_INTERVAL);

    console.log('🔄 Started periodic sync every', this.SYNC_INTERVAL, 'ms');
  }

  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🔄 Stopped periodic sync');
    }
  }

  // Get sync statistics
  async getSyncStats(): Promise<SyncStats> {
    try {
      const stats = await AsyncStorage.getItem(this.SYNC_STATS_KEY);
      if (stats) {
        return JSON.parse(stats);
      }
    } catch (error) {
      console.error('🔄 Failed to get sync stats:', error);
    }

    return {
      totalItems: 0,
      syncedItems: 0,
      pendingItems: 0,
      failedItems: 0,
      lastSyncTime: null,
    };
  }

  // Update sync statistics
  private async updateSyncStats(): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const stats: SyncStats = {
        totalItems: queue.length,
        syncedItems: queue.filter(item => item.synced).length,
        pendingItems: queue.filter(item => !item.synced).length,
        failedItems: queue.filter(item => !item.synced && item.retryCount >= this.MAX_RETRIES).length,
        lastSyncTime: Date.now(),
      };

      await AsyncStorage.setItem(this.SYNC_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('🔄 Failed to update sync stats:', error);
    }
  }

  // Get sync queue
  private async getSyncQueue(): Promise<SyncItem[]> {
    try {
      const queue = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('🔄 Failed to get sync queue:', error);
      return [];
    }
  }

  // Save sync queue
  private async saveSyncQueue(queue: SyncItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('🔄 Failed to save sync queue:', error);
    }
  }

  // Clear sync queue (for testing)
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SYNC_QUEUE_KEY);
      await AsyncStorage.removeItem(this.SYNC_STATS_KEY);
      console.log('🔄 Sync queue cleared');
    } catch (error) {
      console.error('🔄 Failed to clear sync queue:', error);
    }
  }

  // Manual sync trigger
  async forceSync(): Promise<void> {
    console.log('🔄 Manual sync triggered');
    await this.processSyncQueue();
  }
}

// Export singleton instance
export const syncService = new SyncService();
