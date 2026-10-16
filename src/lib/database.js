import mongoose from 'mongoose';
import { config } from '../config/index.js';

if (!config.databaseUrl) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

mongoose.connect(config.databaseUrl, {});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Import models to register them with Mongoose
import '../models/user.js';
import '../models/post.js';

export { db };