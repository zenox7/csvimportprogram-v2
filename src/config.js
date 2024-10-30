import dotenv from 'dotenv';

dotenv.config();

export const config = {
  batchSize: parseInt(process.env.BATCH_SIZE) || 10000,
  postgres: {
    connectionString: process.env.PG_CONNECTION_STRING
  },
  mongodb: {
    uri: process.env.MONGO_URI
  }
};