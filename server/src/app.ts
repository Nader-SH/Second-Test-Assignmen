import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/authRoutes';
import { discussionRouter } from './routes/discussionRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/discussions', discussionRouter);

app.use(errorHandler);

