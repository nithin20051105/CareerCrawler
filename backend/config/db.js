import mongoose from 'mongoose';

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env before starting the server.');
  }

  await mongoose.connect(mongoUri);
  isConnected = true;

  console.log('MongoDB connected');
  return mongoose.connection;
}
