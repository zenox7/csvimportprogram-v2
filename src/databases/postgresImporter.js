import pg from 'pg';
import { DataTransformer } from '../utils/dataTransformer.js';

export class PostgresImporter {
  constructor(connectionString) {
    this.client = new pg.Client(connectionString);
    this.transformer = null;
  }

  async connect() {
    await this.client.connect();
  }

  async createTable(tableName, columns) {
    const columnDefs = columns
      .map(col => `"${col}" TEXT`)
      .join(', ');

    await this.client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        ${columnDefs}
      )
    `);

    this.transformer = new DataTransformer(columns);
  }

  async insertBatch(tableName, batch) {
    if (batch.length === 0) return;

    const transformedBatch = this.transformer.transformBatch(batch);
    const columns = Object.keys(transformedBatch[0]);
    
    const values = transformedBatch
      .map(row => `(${
        columns
          .map(col => row[col] === null ? 'NULL' : `'${row[col]}'`)
          .join(', ')
      })`)
      .join(', ');

    await this.client.query(`
      INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')})
      VALUES ${values}
    `);
  }

  async close() {
    await this.client.end();
  }
}