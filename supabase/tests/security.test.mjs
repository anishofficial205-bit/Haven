import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
import path from 'node:path';

// Loads supabase/migrations into an in-memory Postgres (with Supabase's roles and
// auth.uid() stubbed) and checks the security rules. Run with: npm run test:db
const MIG = process.argv[2] ?? path.join(import.meta.dirname, '..', 'migrations');
const db = new PGlite({ extensions: { pgcrypto } });
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + ' ' + extra); }
};
const q = async (sql, params) => (await db.query(sql, params)).rows;
const as = async (uid, role = 'authenticated') => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${role};`);
};
const root = async () => { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); };
const denied = async (name, sql) => {
  try { await db.exec(sql); ok(name, false, '(was allowed)'); }
  catch (e) { ok(name, true); }
};

// --- Supabase stub -------------------------------------------------------
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create schema extensions;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text unique, raw_user_meta_data jsonb, encrypted_password text, updated_at timestamptz);
  create table auth.sessions (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users (id) on delete cascade);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, extensions to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`);

for (const f of fs.readdirSync(MIG).sort()) {
  try { await db.exec(fs.readFileSync(path.join(MIG, f), 'utf8')); console.log('ran ' + f); }
  catch (e) { console.log('ERROR in ' + f + ': ' + e.message); process.exit(1); }
}
// seed twice = idempotent
await db.exec(fs.readFileSync(path.join(MIG, '0004_seed.sql'), 'utf8'));
ok('seed is re-runnable: 6 spaces', (await q('select count(*)::int n from spaces'))[0].n === 6);
ok('18 seed posts', (await q('select count(*)::int n from posts'))[0].n === 18);
ok('6 weekly questions', (await q('select count(*)::int n from weekly_questions'))[0].n === 6);
ok('6 professionals', (await q('select count(*)::int n from professionals'))[0].n === 6);

const signup = async (username, band = '18_22', email) => (await q(
  `insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`,
  [email ?? username.toLowerCase() + '@users.invalid', { username, age_band: band, avatar_id: 3 }]))[0].id;

console.log('\naccounts');
const A = await signup('Asha_01'), B = await signup('bela'), C = await signup('chirag'), D = await signup('dev_x'), M = await signup('mod_one');
await db.exec(`update profiles set role='moderator' where username='mod_one'`);
for (const [n, fn] of [
  ['real email refused', () => signup('realmail', '18_22', 'someone@gmail.com')],
  ['blocked username refused', () => signup('xx_chutiya_xx')],
  ['reserved username refused', () => signup('the_admin')],
  ['taken username (case-insensitive) refused', () => signup('ASHA_01')],
  ['under-16 band refused', () => signup('kiddo', 'under_16')],
  ['bad format refused', () => signup('a b')],
]) { try { await fn(); ok(n, false); } catch { ok(n, true); } }

await as(null, 'anon');
ok('anon: username_available ok', (await q(`select username_available('fresh_name') v`))[0].v === 'ok');
ok('anon: taken', (await q(`select username_available('BELA') v`))[0].v === 'taken');
ok('anon: blocked', (await q(`select username_available('randi99') v`))[0].v === 'blocked');
ok('anon: invalid', (await q(`select username_available('no') v`))[0].v === 'invalid');
ok('anon: can read spaces', (await q(`select count(*)::int n from spaces`))[0].n === 6);
ok('anon: can read professionals', (await q(`select count(*)::int n from professionals`))[0].n === 6);
await denied('anon: cannot read posts', `select * from posts`);
await denied('anon: cannot call feed', `select * from feed_confessions()`);
await denied('anon: cannot read profiles', `select id from profiles`);
await denied('anon: cannot read moderation_terms', `select * from moderation_terms`);

console.log('\nposting');
await as(A);
const p1 = (await q(`insert into posts (kind, body, tags) values ('confession', 'My friend shared my chat without asking and I froze.', '{digital}') returning id, status`))[0];
ok('clean confession is published', p1.status === 'published');
const p2 = (await q(`insert into posts (kind, body, tags) values ('confession', 'call me on 98765 43210 please', '{other}') returning status, moderation_reason`))[0];
ok('phone number -> pending/personal_info', p2.status === 'pending' && p2.moderation_reason === 'personal_info');
const p3 = (await q(`insert into posts (kind, body, tags) values ('confession', 'Some days I just want to die honestly', '{other}') returning status, moderation_reason, priority`))[0];
ok('self-harm -> pending + priority', p3.status === 'pending' && p3.priority === true && p3.moderation_reason === 'self_harm');
for (const [txt, why] of [['find me at coolkid@gmail.com', 'email'], ['my insta id is whatever', 'insta'], ['see www.example.com now', 'link'], ['you are such a chutiya', 'slur'], ['hit up @some.handle', 'handle']]) {
  const r = (await q(`insert into posts (kind, body, tags) values ('confession', $1, '{other}') returning status`, [txt]))[0];
  ok(`filter catches ${why}`, r.status === 'pending');
}
const clean = (await q(`insert into posts (kind, body, tags) values ('confession', 'I said no 3 times in 2023 and my class of 60 people heard. Scunthorpe assessment.', '{other}') returning status`))[0];
ok('no false positive on ordinary text', clean.status === 'published');
await denied('client cannot set status', `insert into posts (kind, body, tags, status) values ('confession', 'x', '{other}', 'published')`);
await denied('client cannot set author_id', `insert into posts (kind, body, tags, author_id) values ('confession', 'x', '{other}', '${B}')`);
await denied('client cannot set featured_on', `insert into posts (kind, body, tags, featured_on) values ('confession', 'x', '{other}', current_date)`);
await denied('client cannot update a post', `update posts set status='published' where id='${p1.id}'`);
await denied('confession needs a tag', `insert into posts (kind, body) values ('confession', 'x')`);
await denied('unknown tag refused', `insert into posts (kind, body, tags) values ('confession', 'x', '{nope}')`);
await denied('confession over 1000 chars refused', `insert into posts (kind, body, tags) values ('confession', repeat('a', 1001), '{other}')`);

console.log('\nanonymity (user B looking at user A)');
await as(B);
ok('B reads 0 rows from posts directly', (await q(`select * from posts`)).length === 0);
const feed = await q(`select * from feed_confessions()`);
ok('B feed has A\'s 2 published confessions only', feed.length === 2 && feed.every(r => r.status === 'published'));
ok('feed row has no author_id / username', feed.every(r => !('author_id' in r) && !('username' in r)));
ok('feed is_mine false for B', feed.every(r => r.is_mine === false));
ok('feed moderation_reason hidden from B', feed.every(r => r.moderation_reason === null));
ok('B profiles: only own row', (await q(`select id, username from profiles`)).length === 1);
await denied('B cannot read recovery_code_hash', `select recovery_code_hash from profiles`);
await denied('B cannot make themself moderator', `update profiles set role='moderator' where id='${B}'`);
await denied('B cannot change username', `update profiles set username='hacker' where id='${B}'`);
await denied('B cannot un-ban themself', `update profiles set banned_until=null where id='${B}'`);
ok('B reads 0 reactions of others', (await q(`select * from reactions`)).length === 0);
ok('B cannot see moderation terms', (await q(`select * from moderation_terms`)).length === 0);
ok('B is not moderator', (await q(`select is_moderator() v`))[0].v === false);
await db.exec(`update profiles set consent_version='1' where id='${B}'`);
ok('consent_at set by database', (await q(`select consent_at from profiles`))[0].consent_at !== null);
ok('B cannot update A profile (0 rows)', (await db.query(`update profiles set avatar_id=5 where id='${A}'`)).affectedRows === 0);

console.log('\nreplies + reactions');
const r1 = (await q(`insert into replies (post_id, kind, body) values ($1, 'solidarity', 'Same thing happened to me. You are not overreacting.') returning id, status`, [p1.id]))[0];
ok('reply starts pending', r1.status === 'pending');
await denied('client cannot set reply status', `insert into replies (post_id, kind, body, status) values ('${p1.id}', 'advice', 'x', 'approved')`);
await denied('client cannot set highlighted', `insert into replies (post_id, kind, body, highlighted) values ('${p1.id}', 'advice', 'x', true)`);
await denied('client cannot update reply', `update replies set status='approved' where id='${r1.id}'`);
ok('B sees own pending reply', (await q(`select * from list_replies($1)`, [p1.id])).length === 1);
await db.exec(`insert into reactions (target_type, target_id, emoji) values ('post', '${p1.id}', 'hug')`);
await db.exec(`insert into reactions (target_type, target_id, emoji) values ('post', '${p1.id}', 'love') on conflict (user_id, target_type, target_id) do update set emoji = excluded.emoji`);
await denied('unknown emoji refused', `insert into reactions (target_type, target_id, emoji) values ('post', '${feed[1].id}', 'thumbs_down')`);
await as(A);
ok('A does NOT see B\'s pending reply', (await q(`select * from list_replies($1)`, [p1.id])).length === 0);
const d = (await q(`select * from post_detail($1)`, [p1.id]))[0];
ok('reaction toggled to one "love"', d.reaction_total === 1 && d.reaction_counts.love === 1 && d.my_reaction === null);
ok('A sees is_mine on own post', d.is_mine === true);
ok('A feed includes own pending posts', (await q(`select * from feed_confessions()`)).some(r => r.status === 'pending'));
ok('my_posts returns all own', (await q(`select * from my_posts()`)).length === 9);
await root();
await db.exec(`update replies set status='approved', kind='advice' where id='${r1.id}'`);
await as(A);
const rr = await q(`select * from list_replies($1)`, [p1.id]);
ok('approved reply visible, no author fields', rr.length === 1 && !('author_id' in rr[0]) && rr[0].is_mine === false);
ok('advice sort finds it', (await q(`select * from feed_confessions(null, 'advice')`)).length === 1);
ok('tag filter', (await q(`select * from feed_confessions('digital')`)).length === 1);

console.log('\nspaces');
await as(C);
const sp = (await q(`select id from spaces where slug='family-pressure'`))[0].id;
ok('space feed shows 3 seed posts', (await q(`select * from feed_space($1)`, [sp])).length === 3);
await db.exec(`insert into space_members (space_id) values ('${sp}')`);
ok('joined', (await q(`select * from space_members`)).length === 1);
const sp1 = (await q(`insert into posts (kind, space_id, post_type, body) values ('space_post', $1, 'rant', 'Why is everything my fault at home') returning status`, [sp]))[0];
ok('space post published', sp1.status === 'published');
const wq = (await q(`select id, question from weekly_questions where space_id=$1`, [sp]))[0];
ok('weekly question readable', !!wq);
await denied('created_by not readable', `select created_by from weekly_questions`);
await denied('non-mod cannot add weekly question', `insert into weekly_questions (space_id, question, week_start) values ('${sp}', 'q', '2030-01-07')`);
await db.exec(`insert into replies (question_id, kind, body) values ('${wq.id}', 'solidarity', 'I held one small boundary')`);
ok('question reply pending, visible to self', (await q(`select * from list_replies(null, $1)`, [wq.id])).length === 1);
await db.exec(`insert into saves (post_id) values ('${p1.id}')`);
ok('saved_posts', (await q(`select * from saved_posts()`)).length === 1);
await db.exec(`insert into scenario_progress (scenario_id, current_node, path) values ('family-hug', 'n2', '["n1"]')`);
await db.exec(`update scenario_progress set current_node='n3' where scenario_id='family-hug'`);
ok('scenario progress saved', (await q(`select current_node from scenario_progress`))[0].current_node === 'n3');
await as(M);
await db.exec(`insert into weekly_questions (space_id, question, week_start) values ('${sp}', 'next week q', '2030-01-07')`);
ok('moderator can add weekly question', true);
ok('moderator reads terms', (await q(`select * from moderation_terms`)).length > 20);
await denied('bad regex term refused', `insert into moderation_terms (pattern, category, is_word) values ('(((', 'block', false)`);

console.log('\nreports + blocking');
for (const u of [B, C]) { await as(u); await db.exec(`insert into reports (target_type, target_id, reason) values ('post', '${p1.id}', 'spam')`); }
await denied('same user cannot report twice', `insert into reports (target_type, target_id, reason) values ('post', '${p1.id}', 'other')`);
await as(D);
ok('2 reports: still visible', (await q(`select * from post_detail($1)`, [p1.id])).length === 1);
await db.exec(`insert into reports (target_type, target_id, reason) values ('post', '${p1.id}', 'hateful')`);
ok('3 reports: hidden from others', (await q(`select * from post_detail($1)`, [p1.id])).length === 0);
ok('D sees only own report', (await q(`select * from reports`)).length === 1);
ok('replies of hidden post not listed', (await q(`select * from list_replies($1)`, [p1.id])).length === 0);
const before = (await q(`select * from feed_confessions()`)).length;
await db.exec(`select block_author('post', '${clean ? feed.find(f => f.id !== p1.id).id : ''}')`);
ok('after block, A\'s posts vanish for D', before === 1 && (await q(`select * from feed_confessions()`)).length === 0);
await denied('blocked_id not readable', `select blocked_id from blocks`);
const bl = await q(`select id, created_at from blocks`);
ok('D lists own block', bl.length === 1);
await denied('cannot insert block directly', `insert into blocks (blocker_id, blocked_id) values ('${D}', '${B}')`);
await db.exec(`delete from blocks where id='${bl[0].id}'`);
ok('unblock works', (await q(`select * from feed_confessions()`)).length === 1);
await as(B);
ok('B cannot see D\'s blocks', (await q(`select id from blocks`)).length === 0);

console.log('\nbans');
await root();
await db.exec(`update profiles set banned_until = now() + interval '1 day' where id='${C}'`);
await as(C);
await denied('banned: cannot post', `insert into posts (kind, body, tags) values ('confession', 'hello', '{other}')`);
await denied('banned: cannot reply', `insert into replies (post_id, kind, body) values ('${p1.id}', 'advice', 'x')`);
await denied('banned: cannot react', `insert into reactions (target_type, target_id, emoji) values ('post', '${feed[1].id}', 'hug')`);

console.log('\nhelp requests');
await as(A);
const prof = (await q(`select id from professionals limit 1`))[0].id;
const hr = (await q(`insert into help_requests (professional_id, type, topic, message, language, time_window) values ($1, 'therapist', 'Family', 'I need to talk', 'English', 'Evenings') returning id, status`, [prof]))[0];
ok('request sent', hr.status === 'sent');
await db.exec(`insert into help_messages (request_id, body) values ('${hr.id}', 'hello?')`);
await denied('user cannot pose as staff', `insert into help_messages (request_id, body, sender) values ('${hr.id}', 'x', 'staff')`);
ok('user cannot change status (0 rows)', (await db.query(`update help_requests set status='closed' where id='${hr.id}'`)).affectedRows === 0);
await as(B);
ok('B cannot see A\'s request', (await q(`select * from help_requests`)).length === 0);
ok('B cannot see A\'s messages', (await q(`select * from help_messages`)).length === 0);
await denied('B cannot write into A\'s thread', `insert into help_messages (request_id, body) values ('${hr.id}', 'intruder')`);
await as(M);
await db.exec(`insert into help_messages (request_id, body) values ('${hr.id}', 'Hi, we are here.')`);
await db.exec(`update help_requests set status='accepted' where id='${hr.id}'`);
await as(A);
const msgs = await q(`select sender from help_messages order by created_at`);
ok('thread: user then staff', msgs.length === 2 && msgs[0].sender === 'user' && msgs[1].sender === 'staff');
ok('status accepted', (await q(`select status from help_requests`))[0].status === 'accepted');

console.log('\nrecovery codes');
await as(B);
const code = (await q(`select create_recovery_code() v`))[0].v;
ok('code is 12 chars from the safe alphabet', /^[A-HJKMNP-Z2-9]{12}$/.test(code), code);
await denied('hash still unreadable by owner', `select recovery_code_hash from profiles`);
await root();
await db.exec(`insert into auth.sessions (user_id) values ('${B}')`);
const stored = (await q(`select recovery_code_hash h from profiles where id='${B}'`))[0].h;
ok('only a hash is stored', stored && stored !== code && stored.startsWith('$2'));
await as(null, 'anon');
await denied('anon cannot create a code', `select create_recovery_code()`);
const reset = async (u, c, p) => (await q(`select reset_password_with_recovery_code($1,$2,$3) v`, [u, c, p]))[0].v;
ok('unknown username -> invalid', await reset('nobody_here', code, 'longenough1') === 'invalid');
ok('wrong code -> invalid', await reset('bela', 'AAAAAAAAAAAA', 'longenough1') === 'invalid');
ok('short password -> weak', await reset('bela', code, 'short') === 'weak');
ok('right code, any formatting/case -> ok', await reset('BELA', code.toLowerCase().replace(/(.{4})/g, '$1-'), 'my new password') === 'ok');
await root();
const u = (await q(`select encrypted_password p, extensions.crypt('my new password', encrypted_password) = encrypted_password good from auth.users where id='${B}'`))[0];
ok('password replaced with a bcrypt hash', u.good === true && u.p.startsWith('$2'));
ok('old sessions signed out', (await q(`select count(*)::int n from auth.sessions where user_id='${B}'`))[0].n === 0);
await as(null, 'anon');
for (let i = 0; i < 5; i++) await reset('bela', 'WRONGWRONG22', 'longenough1');
ok('locked after 5 wrong codes, even with the right one', await reset('bela', code, 'longenough1') === 'locked');
await root();
await db.exec(`update profiles set recovery_locked_until = now() - interval '1 minute' where id='${B}'`);
await as(null, 'anon');
ok('works again after the lock expires', await reset('bela', code, 'longenough1') === 'ok');
await as(D);
ok('account with no code set -> invalid', await reset('dev_x', '', 'longenough1') === 'invalid');

console.log('\ndelete account');
await root();
await db.exec(`delete from auth.users where id='${A}'`);
const left = (await q(`select
  (select count(*) from posts where not is_seed and kind='confession')::int posts,
  (select count(*) from replies where post_id is not null)::int replies,
  (select count(*) from reactions)::int reactions,
  (select count(*) from reports)::int reports,
  (select count(*) from help_requests)::int reqs,
  (select count(*) from help_messages)::int msgs`))[0];
ok('everything of A is gone (and what hung off it)', Object.values(left).every(n => n === 0), JSON.stringify(left));
await as(null, 'anon');
ok('username free again', (await q(`select username_available('asha_01') v`))[0].v === 'ok');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
