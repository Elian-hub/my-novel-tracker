import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import busboyBodyParser from 'busboy-body-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import errorHandler from './middleware/error-handler.js';
import userRoutes from './routes/user.js';
import bookRoutes from './routes/book.js';
import statsRoutes from './routes/stats.js';
import quoteRoutes from './routes/quote.js';
import tokenRoutes from './routes/token.js';

import { authenticateUser } from './middleware/authenticate-user.js';

import compression from 'compression';
import helmet from 'helmet';

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_APP_URL,
        'http://localhost:5173',
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(busboyBodyParser());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet()); // helmet sets security-related HTTP response headers to prevent attacks like XSS, clickjacking, etc.
app.use(compression());

app.use('/api/users', userRoutes);
app.use('/api/books', authenticateUser, bookRoutes);
app.use('/api/stats', authenticateUser, statsRoutes);
app.use('/api/quote', authenticateUser, quoteRoutes);
app.use('/api/auth', tokenRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-tracker'
    );
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting the server:', err);
  }
}

startServer();

export default app;
