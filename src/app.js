import express from 'express';
import homeRouter from './routes/home.js';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import adminsRouter from './routes/admins/index.js';
import { db } from './lib/database.js';
import Post from './models/post.js';
import User from './models/user.js';

class App {
  constructor() {
    this.app = express();
    this.configure();
  }

  configure() {
    // Middleware
    this.app.use(express.json());
    this.app.set('db', db);
    this.app.set('Post', Post);
    this.app.set('User', User);

    // Register route groups
    this.app.use('/', homeRouter);
    this.app.use('/api', apiRouter);
    this.app.use('/auth', authRouter);
    this.app.use('/admins', adminsRouter);
  }

  getApp() {
    return this.app;
  }
}

export default App;
