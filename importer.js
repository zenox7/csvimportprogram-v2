import cliProgress from 'cli-progress';
import { config } from './src/config.js';
import { CSVReader } from './src/csvReader.js';
import { PostgresImporter } from './src/databases/postgresImporter.js';
import { MongoImporter } from './src/databases/mongoImporter.js';

async function importData(filename, dbType, destination) {
  const csvReader = new CSVReader(filename);
  const headers = await csvReader.getHeaders();
  
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let batch = [];
  let totalRows = 0;

  let importer;
  if (dbType === 'postgres') {
    importer = new PostgresImporter(config.postgres.connectionString);
    await importer.connect();
    await importer.createTable(destination, headers);
  } else {
    importer = new MongoImporter(config.mongodb.uri);
    await importer.connect();
    await importer.prepareCollection(destination, headers);
  }

  try {
    for await (const record of csvReader.readRecords()) {
      batch.push(record);
      
      if (batch.length >= config.batchSize) {
        if (dbType === 'postgres') {
          await importer.insertBatch(destination, batch);
        } else {
          await importer.insertBatch(batch);
        }
        totalRows += batch.length;
        progressBar.update(totalRows);
        batch = [];
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      if (dbType === 'postgres') {
        await importer.insertBatch(destination, batch);
      } else {
        await importer.insertBatch(batch);
      }
      totalRows += batch.length;
      progressBar.update(totalRows);
    }
  } finally {
    progressBar.stop();
    await importer.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const [filename, dbType, destination] = args;

  if (!filename || !dbType || !destination) {
    console.error('Usage: node importer.js <filename> <postgres|mongodb> <table_or_collection_name>');
    process.exit(1);
  }

  if (!['postgres', 'mongodb'].includes(dbType)) {
    console.error('Invalid database type. Use "postgres" or "mongodb"');
    process.exit(1);
  }

  console.log(`Starting import of ${filename} to ${dbType}...`);

  try {
    await importData(filename, dbType, destination);
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();