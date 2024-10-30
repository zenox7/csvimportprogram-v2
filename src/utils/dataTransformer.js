/**
 * Transforms and validates CSV record data
 */
export class DataTransformer {
  constructor(columns) {
    this.columns = columns;
  }

  transformRecord(record) {
    const transformed = {};
    
    for (const column of this.columns) {
      // Handle missing or empty values
      const value = record[column];
      transformed[column] = this.sanitizeValue(value);
    }
    
    return transformed;
  }

  sanitizeValue(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    // Remove any special characters that might cause SQL injection
    return value.toString().replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '');
  }

  transformBatch(batch) {
    return batch.map(record => this.transformRecord(record));
  }
}