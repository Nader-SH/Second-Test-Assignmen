import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { appConfig } from '../config';
import { AuthenticatedUser } from '../types';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.header('authorization');

  if (!authorization) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    res.status(401).json({ message: 'Invalid authorization header format.' });
    return;
  }

  try {
    const payload = jwt.verify(token, appConfig.jwtSecret) as AccessTokenPayload;

    if (!payload.sub || !payload.username || !payload.role) {
      res.status(401).json({ message: 'Invalid authentication token.' });
      return;
    }

    const user: AuthenticatedUser = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
}

