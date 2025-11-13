import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/authRoutes';
import { postRouter } from './routes/postRoutes';
import { commentRouter } from './routes/commentRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// CORS configuration - allow all origins in development, or specific origins in production
// Note: credentials is set to false because we use JWT tokens in Authorization header, not cookies
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : true; // Allow all origins if CORS_ORIGIN is not set

    // If CORS_ORIGIN is not set, allow all origins
    if (allowedOrigins === true) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Origin not allowed
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: false, // Set to false when using wildcard origin (*) - we use JWT in headers, not cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api', commentRouter);

app.use(errorHandler);

