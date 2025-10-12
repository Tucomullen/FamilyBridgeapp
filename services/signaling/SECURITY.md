# Security Notice

⚠️ **DEVELOPMENT ONLY** - This signaling server is for local development only.

## Security Limitations

- **No Authentication**: Anyone can connect and join rooms
- **No Rate Limiting**: No protection against spam/DoS
- **CORS Open**: Limited to localhost and Expo tunnel URLs only
- **No Encryption**: WebSocket traffic is not encrypted
- **No Logging**: Basic console logging only

## Production Requirements

For production deployment, you MUST:

1. **Add Authentication**: Implement proper user authentication
2. **Add Rate Limiting**: Protect against abuse
3. **Use HTTPS/WSS**: Encrypt all traffic
4. **Add Logging**: Implement proper audit logging
5. **Add Monitoring**: Health checks and alerting
6. **Use TURN Server**: For NAT traversal in production

## Current Configuration

- **Port**: 3001 (configurable via PORT env var)
- **CORS Origins**: localhost only + Expo tunnel patterns
- **No Auth**: Development convenience only

## Never Deploy This

This server should never be deployed to production without significant security hardening.
