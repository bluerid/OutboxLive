import express from 'express';
import cors from 'cors';
import homeRouter from './routes/home.js';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import adminsRouter from './routes/admins/index.js';
import { db } from './lib/database.js';
import Post from './models/post.js';
import User from './models/user.js';
import Comment from './models/comment.js';

class App {
  constructor() {
    this.app = express();
    this.configure();
  }

  configure() {
    // Middleware
    this.app.use(express.json());
    this.app.use(cors({
      origin: 'http://localhost:5173', // Your frontend URL //TODO: load from env
      credentials: true
    }));
    this.app.set('db', db);
    this.app.set('Post', Post);
    this.app.set('User', User);
    this.app.set('Comment', Comment);

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
