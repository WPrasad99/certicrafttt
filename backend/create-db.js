const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  password: 'postgres',
  port: 5432,
});

async function createDatabase() {
  try {
    await client.connect();
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'certificate_system'");
    if (res.rowCount === 0) {
      console.log("Database 'certificate_system' does not exist. Creating...");
      await client.query('CREATE DATABASE certificate_system');
      console.log("Database created successfully.");
    } else {
      console.log("Database 'certificate_system' already exists.");
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase();
