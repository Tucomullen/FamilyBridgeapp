# FamilyBridge Signaling Server

Minimal WebRTC signaling server using Socket.IO for FamilyBridge calling functionality.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build and run production
npm run build
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## API Endpoints

- `GET /health` - Health check
- `WebSocket /` - Socket.IO connection

## WebSocket Events

### Client → Server
- `join(roomId)` - Join a room
- `offer({ roomId, offer, targetId })` - Send WebRTC offer
- `answer({ roomId, answer, targetId })` - Send WebRTC answer  
- `ice-candidate({ roomId, candidate, targetId })` - Send ICE candidate
- `leave(roomId)` - Leave a room

### Server → Client
- `user-joined(socketId)` - User joined room
- `user-left(socketId)` - User left room
- `offer({ offer, from })` - Received offer
- `answer({ answer, from })` - Received answer
- `ice-candidate({ candidate, from })` - Received ICE candidate

## Testing

Test WebSocket connection:
```bash
# Using wscat (install with: npm install -g wscat)
wscat -c ws://localhost:3001

# Then send:
{"event": "join", "data": "test-room"}
```

## Security

⚠️ **DEV ONLY**: This server is for development only. Do not expose publicly.

- CORS limited to localhost and Expo tunnel URLs
- No authentication (dev only)
- No rate limiting (dev only)
