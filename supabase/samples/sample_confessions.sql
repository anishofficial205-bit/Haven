-- Sample confessions so the Read deck has something to swipe through.
-- Draft copy, written for testing. Each one is marked is_seed and shows a "Sample" label in the app.
-- Safe to run twice: it does nothing if sample confessions already exist.
-- To remove them later:  delete from public.posts where is_seed and kind = 'confession';

insert into public.posts (author_id, kind, body, tags, trigger_warnings, status, is_seed, created_at)
select null, 'confession', c.body, c.tags::text[], c.warnings::text[], 'published', true,
       now() - (c.hours_ago || ' hours')::interval
from (values
  ('I said yes because saying no felt rude. I still think about it.',
   '{boundaries}', '{}', 2),
  ('My cousin reads my chats whenever I leave my phone lying around. Nobody at home thinks it''s a big deal. I''ve started taking my phone to the bathroom.',
   '{family,digital}', '{}', 5),
  ('I kept asking after she said maybe. I get now that maybe wasn''t a yes. I''m sorry and I don''t know how to say it.',
   '{relationships}', '{}', 8),
  ('My friend posted our photo after I asked her not to. I laughed it off in the group. I wasn''t laughing.',
   '{friendships,digital}', '{}', 14),
  ('I don''t know how to tell him I''m not ready without it becoming a fight.',
   '{relationships,boundaries}', '{}', 20),
  ('Sir keeps messaging me at night about "work". I reply because I''m scared of what happens to my internals if I don''t.',
   '{college_work}', '{harassment}', 26),
  ('Every wedding, the same aunty pulls my cheeks and comments on my weight. Everyone laughs. I''ve started dreading weddings.',
   '{family}', '{body}', 31),
  ('He shares his location with me and expects mine back. I turned mine off for one evening and got eleven missed calls.',
   '{relationships,digital}', '{}', 38),
  ('I told my roommate I needed one evening alone in the room. She said okay and actually meant it. I didn''t know asking could be that easy.',
   '{friendships,boundaries}', '{}', 46),
  ('My best friend told the whole class who I like. She says it was a joke. I haven''t told her anything since.',
   '{friendships}', '{}', 55),
  ('I get a knot in my stomach every time my phone buzzes after 11. I know who it is and I know I''ll reply.',
   '{relationships}', '{anxiety}', 63),
  ('I hugged my friend when she was crying and she went stiff. I never asked. Now I ask first, every time.',
   '{friendships,boundaries}', '{}', 72)
) as c (body, tags, warnings, hours_ago)
where not exists (select 1 from public.posts where is_seed and kind = 'confession');

-- A few approved sample replies, so reply counts are not all zero.
insert into public.replies (post_id, author_id, kind, body, status, is_seed, created_at)
select p.id, null, r.kind, r.body, 'approved', true, p.created_at + interval '40 minutes'
from (values
  ('I said yes because%', 'solidarity', 'You weren''t rude. You were being careful. That counts.'),
  ('I said yes because%', 'advice', 'Next time try "let me think about it". It buys you time.'),
  ('My cousin reads my chats%', 'solidarity', 'It is a big deal. Your chats are yours.'),
  ('My cousin reads my chats%', 'advice', 'A screen lock nobody else knows is not rude. It''s normal.'),
  ('I kept asking after%', 'advice', 'Tell her exactly what you wrote here. Then leave the next step to her.'),
  ('I don''t know how to tell him%', 'solidarity', 'Same place right now. You''re not the only one.'),
  ('I don''t know how to tell him%', 'advice', 'Say it when things are calm, not in the moment. "I''m not ready" is a full sentence.'),
  ('He shares his location%', 'solidarity', 'Eleven calls for one evening would scare me too.'),
  ('My best friend told%', 'solidarity', 'That wasn''t a joke, that was your secret. It makes sense that you went quiet.')
) as r (starts, kind, body)
join public.posts p on p.is_seed and p.kind = 'confession' and p.body like r.starts
where not exists (
  select 1 from public.replies x join public.posts xp on xp.id = x.post_id
  where x.is_seed and xp.kind = 'confession'
);
