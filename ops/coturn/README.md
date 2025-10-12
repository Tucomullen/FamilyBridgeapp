# FamilyBridge TURN Server

Development TURN server using Coturn for WebRTC NAT traversal.

## Quick Start

```bash
# Start TURN server
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop server
docker-compose down
```

## Configuration

- **Port**: 3478 (TURN/STUN)
- **Username**: test (DEV ONLY)
- **Password**: testpass (DEV ONLY)
- **Relay Ports**: 49152-65535

## ICE Server Configuration

Use these ICE servers in your WebRTC configuration:

```typescript
const iceServers = [
  { urls: ["stun:stun.l.google.com:19302"] },
  { 
    urls: ["turn:localhost:3478"],
    username: "test",
    credential: "testpass"
  }
];
```

## Testing

Test TURN server:
```bash
# Install turnutils
npm install -g turnutils

# Test TURN server
turnutils_stunclient localhost
```

## Security Warning

⚠️ **DEV ONLY**: This configuration is for development only.

- No authentication required
- No rate limiting
- No encryption
- Credentials are hardcoded

## Production Requirements

For production, you MUST:

1. **Use proper credentials**: Generate secure username/password
2. **Enable TLS**: Use turn: with TLS
3. **Add authentication**: Require proper auth
4. **Use external IP**: Set real external IP
5. **Add monitoring**: Health checks and logging
