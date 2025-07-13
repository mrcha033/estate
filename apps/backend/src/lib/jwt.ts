import jwt from 'jsonwebtoken';
import { getSecrets } from './secrets';

const JWT_SECRET: string = getSecrets().JWT_SECRET || 'supersecretjwtkey';

export const generateToken = (payload: string | object | Buffer, expiresIn: string): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: expiresIn as string | number 
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): string | jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
