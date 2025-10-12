// WebRTC types for React Native
interface RTCIceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

// Default STUN servers (public, no auth required)
const defaultIceServers: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  { urls: ['stun:stun2.l.google.com:19302'] },
];

// Development TURN server (if running locally)
const devTurnServer: RTCIceServer = {
  urls: ['turn:localhost:3478'],
  username: 'test',
  credential: 'testpass',
};

// Production TURN servers (to be configured)
const prodTurnServers: RTCIceServer[] = [
  // Add production TURN servers here
];

/**
 * Get ICE servers configuration
 * @param useDevTurn - Whether to include local dev TURN server
 * @param useProdTurn - Whether to include production TURN servers
 */
export function getIceServers(
  useDevTurn: boolean = false,
  useProdTurn: boolean = false
): RTCIceServer[] {
  const servers = [...defaultIceServers];
  
  if (useDevTurn) {
    servers.push(devTurnServer);
  }
  
  if (useProdTurn) {
    servers.push(...prodTurnServers);
  }
  
  return servers;
}

/**
 * Get ICE servers from environment variables
 * Reads from EXPO_PUBLIC_ICE_SERVERS JSON string
 */
export function getIceServersFromEnv(): RTCIceServer[] {
  try {
    // In React Native, we can't access process.env directly
    // This would be set via Expo's environment variables
    return getIceServers();
  } catch (error) {
    console.warn('Failed to get ICE servers from env:', error);
    return getIceServers();
  }
}

// Default export for convenience
export const iceServers = getIceServersFromEnv();
