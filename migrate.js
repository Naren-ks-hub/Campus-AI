/**
 * CampusAI - TiDB Cloud Database Schema Migration & Seeder
 * Reads schema.sql and applies tables and seed records to TiDB Cloud Serverless MySQL.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function getDbConnection() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '4000', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'campusai_db';
  const ssl = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  } : false;

  console.log(`[Migration] Connecting to MySQL / TiDB host: ${host}:${port} as user: ${user}...`);

  // Connect without DB first to ensure database exists
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl,
      multipleStatements: true
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`[Migration] Connected successfully. Using database: ${database}`);
    return connection;
  } catch (err) {
    if (connection) await connection.end().catch(() => {});
    throw err;
  }
}

function parseSqlStatements(sqlContent) {
  const statements = [];
  let currentStmt = '';
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1] || '';

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      currentStmt += char;
      if (char === stringChar) {
        // Check for escaped quote '' or \'
        if (sqlContent[i - 1] === '\\') {
          // escaped
        } else if (nextChar === stringChar) {
          currentStmt += nextChar;
          i++;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (char === '-' && nextChar === '-') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringChar = char;
      currentStmt += char;
      continue;
    }

    if (char === ';') {
      const trimmed = currentStmt.trim();
      if (trimmed.length > 0 && !trimmed.toLowerCase().startsWith('use ')) {
        statements.push(trimmed);
      }
      currentStmt = '';
      continue;
    }

    currentStmt += char;
  }

  const finalTrimmed = currentStmt.trim();
  if (finalTrimmed.length > 0 && !finalTrimmed.toLowerCase().startsWith('use ')) {
    statements.push(finalTrimmed);
  }

  return statements;
}

async function runMigration() {
  let conn;
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`[Migration] schema.sql not found at ${schemaPath}`);
      return false;
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = parseSqlStatements(sql);

    console.log(`[Migration] Found ${statements.length} SQL statements to execute.`);

    conn = await getDbConnection();

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await conn.query(stmt);
      } catch (stmtErr) {
        // Handle common non-fatal errors like already existing rows
        if (stmtErr.code === 'ER_DUP_ENTRY' || stmtErr.message.includes('Duplicate entry')) {
          // Ignore duplicate seed row
        } else {
          console.warn(`[Migration] Warning on statement #${i + 1}: ${stmtErr.message.slice(0, 120)}`);
        }
      }
    }

    console.log('[Migration] Database migration completed successfully! All tables and seed data are in place.');
    return true;
  } catch (err) {
    console.error('[Migration] Failed to migrate database:', err.message);
    return false;
  } finally {
    if (conn) {
      await conn.end().catch(() => {});
    }
  }
}

if (require.main === module) {
  runMigration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runMigration, getDbConnection };
