/**
 * OMR+ Data Migration Script
 * Copies all data from OLD Supabase project → NEW Supabase project
 *
 * Run: node scripts/migrate-data.mjs
 * Requires Node.js 18+ (uses native fetch)
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────

const OLD_URL  = 'https://rhxgrxmhdofjonnikkab.supabase.co';
const OLD_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeGdyeG1oZG9mam9ubmlra2FiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzMDUyMCwiZXhwIjoyMDkwNTA2NTIwfQ.cgKtmWTdP2xX41xGkdmJOL0Tm93HhdBIx07_6yYtLPE';

const NEW_URL  = 'https://skgdbfvlbjsxhvlpvoim.supabase.co';
const NEW_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZ2RiZnZsYmpzeGh2bHB2b2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgxMDE0NywiZXhwIjoyMDkxMzg2MTQ3fQ.7CfKgy_1idrV3TuI5qpwyZvUl7uuKNe68-dFr21DAc0';

// Tables to migrate in dependency order (parent before child)
const TABLES = [
  'profiles',
  'subscriptions',
  'trainer_client_assignments',
  'onboarding_responses',
  'meal_plans',
  'meal_plan_items',
  'workout_plans',
  'workout_plan_days',
  'workout_exercises',
  'progress_logs',
  'body_checks',
  'message_threads',
  'messages',
  'products',
  'orders',
  'order_items',
  'pricing_plans',
  'workout_videos',
  'content_blocks',
];

// ── Clients ───────────────────────────────────────────────────

const oldDb = createClient(OLD_URL, OLD_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const newDb = createClient(NEW_URL, NEW_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// ── Helpers ───────────────────────────────────────────────────

const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

function log(msg)       { console.log(`  ${msg}`); }
function ok(msg)        { console.log(`${c.green}  ✓${c.reset} ${msg}`); }
function warn(msg)      { console.log(`${c.yellow}  ⚠${c.reset} ${msg}`); }
function fail(msg)      { console.log(`${c.red}  ✗${c.reset} ${msg}`); }
function section(title) { console.log(`\n${c.cyan}${c.bold}► ${title}${c.reset}`); }

// Fetch all rows from a table (handles pagination)
async function fetchAll(client, table) {
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(from, from + PAGE - 1)
      .order('created_at', { ascending: true });

    if (error) {
      // Some tables may not have created_at — try without ordering
      const { data: d2, error: e2 } = await client
        .from(table)
        .select('*')
        .range(from, from + PAGE - 1);
      if (e2) throw new Error(`Fetch ${table}: ${e2.message}`);
      rows.push(...(d2 ?? []));
      if ((d2?.length ?? 0) < PAGE) break;
    } else {
      rows.push(...(data ?? []));
      if ((data?.length ?? 0) < PAGE) break;
    }
    from += PAGE;
  }
  return rows;
}

// Insert rows in batches (avoids payload size limits)
async function insertBatch(client, table, rows, batchSize = 200) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await client.from(table).insert(batch);
    if (error) throw new Error(`Insert ${table} batch ${i}: ${error.message}`);
    inserted += batch.length;
  }
  return inserted;
}

// ── Step 1: Migrate Auth Users ────────────────────────────────

async function migrateAuthUsers() {
  section('Step 1 — Auth Users');

  // List all users from old project
  log('Fetching users from old project…');
  const { data: { users }, error } = await oldDb.auth.admin.listUsers({ perPage: 1000 });
  if (error) { fail(`Could not list users: ${error.message}`); return []; }
  log(`Found ${users.length} user(s)`);

  if (users.length === 0) { warn('No users to migrate'); return []; }

  let created = 0, skipped = 0, failed = 0;

  for (const user of users) {
    // Check if user already exists in new project
    const { data: existing } = await newDb.auth.admin.getUserById(user.id);
    if (existing?.user) { skipped++; continue; }

    // Create in new project with same ID
    const { error: createErr } = await newDb.auth.admin.createUser({
      email:          user.email,
      email_confirm:  true,
      user_metadata:  user.user_metadata ?? {},
      app_metadata:   user.app_metadata  ?? {},
      // Set a temp password — users will receive a reset email
      password: `OMRplus_Temp_${Math.random().toString(36).slice(2, 10)}!`,
    });

    if (createErr) {
      // Try to create without specifying ID (Supabase may auto-assign)
      fail(`  User ${user.email}: ${createErr.message}`);
      failed++;
    } else {
      created++;
    }
  }

  ok(`Users → created: ${created}, skipped (already exist): ${skipped}, failed: ${failed}`);
  if (failed > 0) warn('Failed users will need to sign up manually or you can invite them from Supabase dashboard');

  return users;
}

// ── Step 2: Migrate Table Data ────────────────────────────────

async function migrateTable(table) {
  let rows;
  try {
    rows = await fetchAll(oldDb, table);
  } catch (err) {
    warn(`${table}: ${err.message} (table may not exist in old project — skipping)`);
    return;
  }

  if (rows.length === 0) {
    log(`${c.dim}${table}: 0 rows (empty)${c.reset}`);
    return;
  }

  // Clear existing data in new project for this table (to avoid conflicts)
  const { error: delErr } = await newDb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) warn(`${table}: could not clear (${delErr.message}) — will try inserting anyway`);

  try {
    const count = await insertBatch(newDb, table, rows);
    ok(`${table}: ${count} row(s) migrated`);
  } catch (err) {
    fail(`${table}: ${err.message}`);
  }
}

// ── Step 3: Fix profiles (update with old data) ───────────────

async function fixProfiles() {
  section('Step 2 — Profiles (sync with auth users)');

  const rows = await fetchAll(oldDb, 'profiles');
  if (rows.length === 0) { warn('No profiles in old project'); return; }

  let updated = 0, failed = 0;
  for (const row of rows) {
    const { error } = await newDb.from('profiles').upsert(row, { onConflict: 'id' });
    if (error) { fail(`  Profile ${row.id}: ${error.message}`); failed++; }
    else updated++;
  }
  ok(`Profiles → upserted: ${updated}, failed: ${failed}`);
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log(`\n${c.bold}${c.cyan}╔═══════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   OMR+ Database Migration              ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   Old → New Supabase Project           ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚═══════════════════════════════════════╝${c.reset}`);
  console.log(`\n  Old: ${c.dim}${OLD_URL}${c.reset}`);
  console.log(`  New: ${c.dim}${NEW_URL}${c.reset}`);

  const startTime = Date.now();

  // 1. Auth users (must come first — profiles FK depends on auth.users)
  await migrateAuthUsers();

  // 2. Profiles (upsert to handle trigger-created rows)
  await fixProfiles();

  // 3. All other tables in order
  section('Step 3 — Table Data');
  const tablesToMigrate = TABLES.filter(t => t !== 'profiles');
  for (const table of tablesToMigrate) {
    await migrateTable(table);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${c.green}${c.bold}✅ Migration complete in ${elapsed}s${c.reset}`);
  console.log(`\n${c.yellow}⚠  IMPORTANT — After migration:${c.reset}`);
  console.log(`   1. Send password reset emails to all users:`);
  console.log(`      Supabase Dashboard → Authentication → Users → select all → Send reset email`);
  console.log(`   2. Verify your app works: npm run dev`);
  console.log(`   3. Check the admin dashboard to confirm all data is visible\n`);
}

main().catch(err => {
  console.error(`\n${c.red}FATAL ERROR:${c.reset}`, err.message);
  process.exit(1);
});
