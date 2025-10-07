import AsyncStorage from '@react-native-async-storage/async-storage';
import { CallHistoryItem } from '../types/call';

const CALL_HISTORY_KEY = 'call_history';
const MAX_HISTORY_ITEMS = 50;

export class CallHistoryService {
  static async addCall(call: Omit<CallHistoryItem, 'id'>): Promise<void> {
    try {
      const history = await this.getCallHistory();
      const newCall: CallHistoryItem = {
        ...call,
        id: Date.now().toString(),
      };
      
      history.unshift(newCall);
      
      // Keep only the most recent calls
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
      }
      
      await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add call to history:', error);
    }
  }

  static async getCallHistory(): Promise<CallHistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Failed to get call history:', error);
      return [];
    }
  }

  static async updateCall(callId: string, updates: Partial<CallHistoryItem>): Promise<void> {
    try {
      const history = await this.getCallHistory();
      const callIndex = history.findIndex(call => call.id === callId);
      
      if (callIndex !== -1) {
        history[callIndex] = { ...history[callIndex], ...updates };
        await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to update call in history:', error);
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CALL_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear call history:', error);
    }
  }
}
