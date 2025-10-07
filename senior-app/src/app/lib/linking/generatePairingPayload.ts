import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type PairingPayload = {
  pairingId: string;
  code: string;
  createdAt: string;
};

export function generatePairingPayload(): PairingPayload {
  const pairingId = uuidv4();
  const code = pairingId.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
  const createdAt = new Date().toISOString();
  return { pairingId, code, createdAt };
}


