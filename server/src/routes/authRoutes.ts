import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config';
import { createUser, verifyUserCredentials } from '../services/userService';
import { loginSchema, registerSchema } from '../validators/authValidators';
import { ZodError } from 'zod';

export const authRouter = Router();

function signAccessToken(user: { id: string; username: string; role: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    appConfig.jwtSecret,
    {
      expiresIn: '12h'
    }
  );
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const user = await createUser(payload.username, payload.password);
    const token = signAccessToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already taken')) {
      res.status(409).json({ message: error.message });
      return;
    }

    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await verifyUserCredentials(payload.username, payload.password);

    if (!user) {
      res.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    const token = signAccessToken(user);

    res.status(200).json({ user, token });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    next(error);
  }
});

