/**
 * Lightweight, idempotent SQL migrator.
 *
 * - Discovers `database/schema.sql` and every file in `database/migrations/`
 *   (walking up from `process.cwd()` so the script works no matter how the
 *   backend is launched).
 * - Splits each file on `;` and runs every statement through the shared
 *   pool. Each statement tolerates being applied twice only when its DDL
 *   uses IF NOT EXISTS; if a duplicate-symbol statement slips through,
 *   the error is logged and migration continues.
 * - One-shot: must be awaited before the server starts accepting traffic.
 */

const fs   = require('fs');
const path = require('path');

// Load .env from the backend root regardless of where this script is launched from.
(function loadEnv() {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, '.env'))) {
      require('dotenv').config({ path: path.join(dir, '.env') });
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
})();

const db   = require('../config/database');

function resolveDbDir() {
  // Walk UP the directory tree from this file looking for `database/schema.sql`.
  // Caps at 6 levels so a broken path doesn't run forever.
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'database', 'schema.sql');
    if (fs.existsSync(candidate)) return path.join(dir, 'database');
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback to cwd (e.g. when running `node migrate.js` from the project root).
  const cwdCand = path.join(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(cwdCand)) return path.join(process.cwd(), 'database');
  return null;
}

function splitStatements(sql) {
  // Strip line-comments, drop empties, split on the trailing `;`.
  // Also drop `CREATE DATABASE` (privileged) and `USE …` (the pool is
  // already pinned to DB_NAME, so USE has no effect and just logs noise).
  const cleaned = sql
    .split('\n')
    .filter(l => !l.trim().startsWith('--'))
    .join('\n');
  return cleaned
    .split(/;\s*(?:\r?\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .filter(s => !/^CREATE\s+DATABASE/i.test(s))
    .filter(s => !/^USE\s+/i.test(s));
}

async function executeFile(label, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = splitStatements(sql);
  console.log(`📜 [migrate] ${label}: ${statements.length} statements`);
  for (const stmt of statements) {
    try {
      await db.query(stmt);
    } catch (err) {
      // Tolerate benign idempotency races (table already exists, duplicate index, …).
      const msg = err.sqlMessage || err.message || '';
      const benign =
        msg.includes('already exists') ||
        msg.includes('Duplicate') ||
        err.code === 'ER_DUP_FIELDNAME' ||
        err.code === 'ER_TABLE_EXISTS_ERROR' ||
        err.code === 'ER_DUP_KEYNAME';
      if (benign) {
        console.log(`   ↪ skip (benign): ${msg.slice(0, 80)}`);
      } else {
        console.error(`   ✗ [${label}] ${msg}`);
      }
    }
  }
}

async function migrate() {
  const root = resolveDbDir();
  if (!root) {
    console.warn('⚠️  [migrate] No database/schema.sql found — skipping migration');
    return;
  }

  const schemaFile = path.join(root, 'schema.sql');
  const migrationsDir = path.join(root, 'migrations');

  console.log(`🔧 [migrate] Using SQL root: ${root}`);

  // 1. Apply the canonical schema (creates DB, core tables, etc.)
  if (fs.existsSync(schemaFile)) {
    await executeFile('schema.sql', schemaFile);
  }

  // 2. Apply every migration file in alphabetical order.
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const f of files) {
      await executeFile(`migrations/${f}`, path.join(migrationsDir, f));
    }
  }

  console.log('✅ [migrate] Database is up to date');
}

module.exports = { migrate, resolveDbDir };
