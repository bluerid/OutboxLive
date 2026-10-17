import express from 'express';
import homeRouter from './routes/home.js';
import apiRouter from './routes/api.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import adminsRouter from './routes/admins/index.js';
import { authenticateToken } from './middleware/auth.js';

class App {
  constructor() {
    this.app = express();
    this.configure();
  }

  configure() {
    // Middleware
    this.app.use(express.json());

    // Register route groups
    this.app.use('/', homeRouter);
    this.app.use('/api', apiRouter);
    this.app.use('/auth', authRouter);
    this.app.use('/users', authenticateToken, usersRouter);
    this.app.use('/admins', adminsRouter);
  }

  getApp() {
    return this.app;
  }
}

export default App;
