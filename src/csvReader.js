import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

export class CSVReader {
  constructor(filename) {
    this.filename = filename;
  }

  async *readRecords() {
    const parser = createReadStream(this.filename)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    for await (const record of parser) {
      yield record;
    }
  }

  async getHeaders() {
    const parser = createReadStream(this.filename)
      .pipe(parse({ columns: true, to: 1 }));
    
    for await (const record of parser) {
      return Object.keys(record);
    }
    return [];
  }
}