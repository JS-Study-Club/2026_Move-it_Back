import { UUID } from 'crypto';

export type JwtRefreshPayloadType = {
  id: number;
  sessionId: UUID;
  hash: string;
  // iat: number;
  // exp: number;
};
