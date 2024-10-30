import { MongoClient } from 'mongodb';
import { DataTransformer } from '../utils/dataTransformer.js';

export class MongoImporter {
  constructor(uri) {
    this.client = new MongoClient(uri);
    this.transformer = null;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
  }

  async prepareCollection(collectionName, columns) {
    this.collection = this.db.collection(collectionName);
    this.transformer = new DataTransformer(columns);
  }

  async insertBatch(batch) {
    if (batch.length === 0) return;
    
    const transformedBatch = this.transformer.transformBatch(batch);
    await this.collection.insertMany(transformedBatch, { ordered: false });
  }

  async close() {
    await this.client.close();
  }
}