import { featureFlags } from '../flags/featureFlags';
import { authManager } from '../services/AuthManager';
import { syncService } from '../services/SyncService';

export type TelemetryEvent = 
  | 'call_start' 
  | 'call_connected'
  | 'call_state_change' 
  | 'call_end'
  | 'call_error'
  | 'call_mute_toggle'
  | 'call_camera_switch'
  | 'call_open'
  | 'sos_requested'
  | 'sos_sent' 
  | 'sos_failed'
  | 'sos_received_dev'
  | 'sos_send_attempt'
  | 'photos_open' 
  | 'photos_next'
  | 'photos_select'
  | 'photos_take'
  | 'photos_select_gallery'
  | 'photos_share'
  | 'photos_delete'
  | 'tts_voice_changed'
  | 'tts_rate_changed'
  | 'tts_pitch_changed'
  | 'tts_volume_changed'
  | 'tts_feedback_toggled'
  | 'tts_test_voice'
  | 'voice_commands_open'
  | 'voice_commands_toggled'
  | 'voice_command_recognized'
  | 'voice_command_executed'
  | 'flag_toggle';

export interface TelemetryPayload {
  [key: string]: any;
}

export async function logEvent(name: TelemetryEvent, payload?: TelemetryPayload): Promise<void> {
  // Check if telemetry is enabled
  if (!featureFlags.isEnabled('TELEMETRY_ENABLED')) {
    return;
  }

  const event = {
    name,
    payload: payload || {},
    timestamp: new Date().toISOString(),
    sessionId: await getSessionId(),
  };

  // Log to console for debugging
  console.log('[TELEMETRY]', event);

  // Send to backend if authenticated
  try {
    if (authManager.isAuthenticated()) {
      await syncService.queueItem('telemetry', event);
      console.log('📊 Telemetry event queued for sync');
    } else {
      console.log('📊 Not authenticated, telemetry event not queued');
    }
  } catch (error) {
    console.error('📊 Failed to queue telemetry event:', error);
  }
}

async function getSessionId(): Promise<string> {
  // Simple session ID generation
  // In a real app, this would be more sophisticated
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
