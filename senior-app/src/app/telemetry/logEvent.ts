import { featureFlags } from '../flags/featureFlags';

export type TelemetryEvent = 
  | 'call_start' 
  | 'call_connected'
  | 'call_state_change' 
  | 'call_end'
  | 'call_error'
  | 'call_mute_toggle'
  | 'call_camera_switch'
  | 'sos_send_attempt' 
  | 'sos_sent' 
  | 'sos_retry'
  | 'photos_open' 
  | 'photos_next'
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

  // For now, just log to console
  // Later we can send to a real backend
  console.log('[TELEMETRY]', event);
}

async function getSessionId(): Promise<string> {
  // Simple session ID generation
  // In a real app, this would be more sophisticated
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
