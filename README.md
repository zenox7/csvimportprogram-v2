# CSV Data Importer

This program efficiently imports large CSV files into PostgreSQL or MongoDB databases using streaming and batch processing. It handles missing data entries gracefully and provides data validation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your database connections in `.env`:
- `PG_CONNECTION_STRING`: PostgreSQL connection string
- `MONGO_URI`: MongoDB connection string
- `BATCH_SIZE`: Number of records to insert in each batch (default: 10000)

## Usage

```bash
node importer.js <filename> <postgres|mongodb> <table_or_collection_name>
```

Example:
```bash
node importer.js data.csv postgres users
node importer.js data.csv mongodb users
```

## Features

- Handles missing data entries gracefully
- Data validation and sanitization
- Streaming CSV parsing for memory efficiency
- Batch processing for optimal performance
- Progress bar showing import status
- Automatic table creation for PostgreSQL
- Error handling and reporting
- Configurable batch size

## Data Handling

- Missing or empty values are stored as NULL in PostgreSQL and null in MongoDB
- Special characters are sanitized to prevent SQL injection
- Empty lines in the CSV are skipped
- All values are trimmed of whitespace