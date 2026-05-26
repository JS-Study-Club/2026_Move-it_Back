import { UUID } from 'crypto';

export type JwtRefreshPayloadType = {
  sessionId: UUID;
  hash: string;
  iat: number;
  exp: number;
};
