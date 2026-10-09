-- 0004_seed.sql
-- Starter content. Everything here is a FIRST DRAFT for the designer and the
-- expert to review before testing with participants.
--   * seed posts have is_seed = true (delete them with:
--       delete from public.posts where is_seed;)
--   * professionals have placeholder = true and obviously made-up names
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Spaces
-- ---------------------------------------------------------------------------
insert into public.spaces (slug, name, description, rules, sort_order) values
  ('relationships', 'Relationships',
   'Dating, partners, and the grey areas in between',
   E'Talk about your own experience, not someone else''s business.\nNo names, no handles, no details that could identify anyone.\nNobody here owes anyone an explanation for their "no".\nDisagree kindly. No shaming, no "you should have".', 1),
  ('digital-boundaries', 'Digital Boundaries',
   'Chats, screenshots, tags, DMs and everything online',
   E'Never post screenshots, usernames or links.\nDescribe what happened in your own words.\nNo tips on getting into someone else''s account or phone.\nDisagree kindly.', 2),
  ('family-pressure', 'Family Pressure',
   'When "log kya kahenge" meets your boundaries',
   E'Families are complicated. No one here has to pick a side.\nNo names or details that could identify your family.\n"Just cut them off" is rarely useful advice. Offer what you would actually try.\nDisagree kindly.', 3),
  ('college-workplace', 'College & Workplace',
   'Seniors, professors, bosses and saying no to power',
   E'Don''t name colleges, companies, professors or bosses.\nShare what happened and how it felt, not who did it.\nIf you are in danger or being threatened, use the Help tab.\nDisagree kindly.', 4),
  ('lgbtq', 'LGBTQ+',
   'Experiences and support, in a space that gets it',
   E'Never out anyone, and never guess at who someone is.\nNo debating whether someone''s identity is real.\nNo names or identifying details.\nDisagree kindly.', 5),
  ('just-talk', 'Just Talk',
   'Anything else on your mind',
   E'Anything goes, as long as it is kind.\nNo names, handles or identifying details.\nIf something feels unsafe, report it.', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- This week's pinned question for each space
-- ---------------------------------------------------------------------------
insert into public.weekly_questions (space_id, question, week_start, created_by)
select s.id, q.question, date_trunc('week', now() at time zone 'Asia/Kolkata')::date, null
from (values
  ('relationships',      'What''s one thing you wish a partner had asked you before assuming?'),
  ('digital-boundaries', 'Has someone ever shared your chat or photo without asking? What did you do?'),
  ('family-pressure',    'What''s a boundary you''ve managed to hold at home, even a small one?'),
  ('college-workplace',  'Have you ever said yes to a senior because no felt too risky?'),
  ('lgbtq',              'What does feeling safe with someone look like for you?'),
  ('just-talk',          'What''s something about boundaries nobody taught you, that you had to work out yourself?')
) as q (slug, question)
join public.spaces s on s.slug = q.slug
on conflict (space_id, week_start) do nothing;

-- ---------------------------------------------------------------------------
-- Sample posts, 3 per space (draft copy, marked as seed)
-- ---------------------------------------------------------------------------
insert into public.posts (author_id, kind, space_id, post_type, body, tags, status, is_seed, created_at)
select null, 'space_post', s.id, p.post_type, p.body, p.tags::text[], 'published', true,
       now() - (p.hours_ago || ' hours')::interval
from (values
  ('relationships', 'question',
   'We''ve been together a year and he checks my phone "because we have nothing to hide". I don''t hide anything, but I still hate it. Is that weird?',
   '{relationships,boundaries}', 5),
  ('relationships', 'story',
   'I told my girlfriend I wasn''t ready to meet her parents yet. I was sure she''d be upset. She just said okay, tell me when you are. Didn''t know it could be that simple.',
   '{relationships}', 28),
  ('relationships', 'rant',
   'Why is "but I did so much for you" still a thing people say when you say no to something. A favour is not a loan.',
   '{relationships,boundaries}', 50),

  ('digital-boundaries', 'story',
   'A friend put a screenshot of my late-night rant on her close friends story. Only 12 people, she said. It was still mine to share, not hers.',
   '{digital,friendships}', 3),
  ('digital-boundaries', 'question',
   'How do you ask someone to take down a photo of you without it turning into a whole drama? It''s not even a bad photo. I just didn''t want it up.',
   '{digital}', 20),
  ('digital-boundaries', 'rant',
   'Being added to a group chat with 60 strangers without anyone asking should count as a crime, honestly.',
   '{digital}', 44),

  ('family-pressure', 'story',
   'At my cousin''s wedding I did a namaste instead of hugging an uncle I barely know. My mom glared at me. Later she said "you could have just adjusted". I didn''t want to adjust.',
   '{family,boundaries}', 7),
  ('family-pressure', 'question',
   'My parents read my messages whenever they want because "we pay for the phone". Has anyone actually managed to talk to their parents about this?',
   '{family,digital}', 31),
  ('family-pressure', 'rant',
   'Log kya kahenge. Log are not the ones who have to live my life, but okay.',
   '{family}', 60),

  ('college-workplace', 'story',
   'A senior kept asking me to stay back after practice to "discuss my role". I started bringing a friend along every time. He stopped asking. I still think about why I had to do that.',
   '{college_work,boundaries}', 9),
  ('college-workplace', 'question',
   'First internship. My manager texts me at 11pm and gets cold the next day if I don''t reply. Is this normal or am I allowed to not reply?',
   '{college_work}', 26),
  ('college-workplace', 'rant',
   'Said no to one after-work dinner and now I''m "not a team player". Cool.',
   '{college_work}', 52),

  ('lgbtq', 'story',
   'Told one friend. Just one. She asked "who else knows, so I don''t slip up?" and I nearly cried. That''s all I ever wanted someone to ask.',
   '{friendships,boundaries}', 6),
  ('lgbtq', 'question',
   'How do you handle relatives asking "koi hai kya?" at every single function when the honest answer isn''t one you can give yet?',
   '{family}', 30),
  ('lgbtq', 'rant',
   'Someone guessing about you out loud, in front of other people, is not them being supportive. It''s them taking a decision that was yours.',
   '{boundaries}', 48),

  ('just-talk', 'question',
   'Does anyone else say "it''s fine" on autopilot and only realise two hours later that it was not fine?',
   '{boundaries}', 4),
  ('just-talk', 'story',
   'Said no to a plan today without giving a reason. Nobody died. Ten out of ten, would do again.',
   '{boundaries,friendships}', 22),
  ('just-talk', 'rant',
   'Nobody told me that "no" is a full sentence until I was 19. Feels like that should have been in a textbook somewhere.',
   '{other}', 40)
) as p (slug, post_type, body, tags, hours_ago)
join public.spaces s on s.slug = p.slug
where not exists (select 1 from public.posts where is_seed and kind = 'space_post');

-- ---------------------------------------------------------------------------
-- Professionals: PLACEHOLDERS. Replace with real, consenting professionals
-- before any public use.
-- ---------------------------------------------------------------------------
insert into public.professionals
  (type, name, bio, qualifications, languages, focus_areas, availability_note, placeholder)
select * from (values
  ('therapist', 'Dr. Sample Therapist One',
   'Placeholder profile. Works with young adults on anxiety, family pressure and relationships.',
   'Placeholder: M.Phil. Clinical Psychology',
   array['English', 'Hindi'], array['Anxiety', 'Family', 'Relationships'],
   'Usually replies within 2 days', true),
  ('therapist', 'Ms. Sample Therapist Two',
   'Placeholder profile. Works with students on boundaries, self-worth and breakups.',
   'Placeholder: M.A. Counselling Psychology',
   array['English', 'Hindi', 'Gujarati'], array['Boundaries', 'Breakups', 'Self-worth'],
   'Usually replies within 2 days', true),
  ('intimacy_coach', 'Sample Intimacy Coach One',
   'Placeholder profile. Helps with talking about consent, comfort and communication with a partner.',
   'Placeholder: Certified intimacy and relationship coach',
   array['English', 'Hindi'], array['Consent', 'Communication', 'First relationships'],
   'Usually replies within 3 days', true),
  ('intimacy_coach', 'Sample Intimacy Coach Two',
   'Placeholder profile. A judgement-free space for questions you can''t ask anyone else.',
   'Placeholder: Certified sexuality educator',
   array['English', 'Gujarati'], array['Consent', 'Body image', 'LGBTQ+'],
   'Usually replies within 3 days', true),
  ('legal_advisor', 'Adv. Sample Legal Advisor One',
   'Placeholder profile. Explains your options in plain language for harassment and online abuse.',
   'Placeholder: LL.B., practising advocate',
   array['English', 'Hindi'], array['Online harassment', 'Workplace harassment', 'Your rights'],
   'Usually replies within 3 days', true),
  ('legal_advisor', 'Adv. Sample Legal Advisor Two',
   'Placeholder profile. Helps you understand what reporting involves before you decide anything.',
   'Placeholder: LL.M., practising advocate',
   array['English', 'Hindi', 'Gujarati'], array['Leaked images', 'Stalking', 'College complaints'],
   'Usually replies within 3 days', true)
) as v
where not exists (select 1 from public.professionals where placeholder);

-- ---------------------------------------------------------------------------
-- Automatic filter: starter list. Add to it from the mod tools as you see
-- what testers actually write.
-- ---------------------------------------------------------------------------
insert into public.moderation_terms (pattern, category, reason, is_word) values
  -- Personal identifiers: blocked to protect anonymity
  ('[0-9](?:[\s.-]?[0-9]){9,}',                              'block', 'personal_info', false),
  ('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',         'block', 'personal_info', false),
  ('(?:^|\s)@[A-Za-z0-9._]{3,}',                             'block', 'personal_info', false),
  ('(?:https?://|www\.)\S+',                                 'block', 'personal_info', false),
  ('\m[a-z0-9-]+\.(?:com|in|net|org|me|co|io|app|ly|gg)\M',  'block', 'personal_info', false),
  ('\m(?:insta|instagram|ig|snap|snapchat|telegram|discord|whats\s?app)\s*(?:id|handle|username|user)\M',
                                                             'block', 'personal_info', false),
  ('\m(?:dm|message|text|add|follow)\s+me\s+(?:on|at)\M',    'block', 'personal_info', false),

  -- Self-harm: never blocked. Reviewed first, and the author is shown helplines.
  ('suicide',                        'self_harm', 'self_harm', true),
  ('suicidal',                       'self_harm', 'self_harm', true),
  ('kill\s+myself',                  'self_harm', 'self_harm', true),
  ('end\s+my\s+life',                'self_harm', 'self_harm', true),
  ('end\s+it\s+all',                 'self_harm', 'self_harm', true),
  ('want\s+to\s+die',                'self_harm', 'self_harm', true),
  ('wanna\s+die',                    'self_harm', 'self_harm', true),
  ('better\s+off\s+dead',            'self_harm', 'self_harm', true),
  ('no\s+reason\s+to\s+live',        'self_harm', 'self_harm', true),
  ('self[\s-]?harm',                 'self_harm', 'self_harm', true),
  ('cut(?:ting)?\s+myself',          'self_harm', 'self_harm', true),
  ('hurt(?:ing)?\s+myself',          'self_harm', 'self_harm', true),
  ('khudkushi',                      'self_harm', 'self_harm', true),
  ('aatmahatya',                     'self_harm', 'self_harm', true),
  ('mar\s+jau?n',                    'self_harm', 'self_harm', true),
  ('marna\s+chaht[ai]',              'self_harm', 'self_harm', true),
  ('jeena\s+nahi',                   'self_harm', 'self_harm', true),

  -- Abuse and slurs (English and Hinglish)
  ('bitch(?:es)?',     'block', 'harassment', true),
  ('slut',             'block', 'harassment', true),
  ('whore',            'block', 'harassment', true),
  ('bastard',          'block', 'harassment', true),
  ('asshole',          'block', 'harassment', true),
  ('fuck\s*(?:you|off|er)', 'block', 'harassment', true),
  ('motherfucker',     'block', 'harassment', true),
  ('retard(?:ed)?',    'block', 'hateful',    true),
  ('faggot',           'block', 'hateful',    true),
  ('tranny',           'block', 'hateful',    true),
  ('chakka',           'block', 'hateful',    true),
  ('randi',            'block', 'harassment', true),
  ('chutiya',          'block', 'harassment', true),
  ('madarchod',        'block', 'harassment', true),
  ('behenchod',        'block', 'harassment', true),
  ('bhenchod',         'block', 'harassment', true),
  ('bhosdi(?:ke)?',    'block', 'harassment', true),
  ('gaandu',           'block', 'harassment', true),
  ('harami',           'block', 'harassment', true),
  ('kutiya',           'block', 'harassment', true),
  ('kys',              'block', 'harassment', true),
  ('go\s+die',         'block', 'harassment', true),
  ('kill\s+you',       'block', 'harassment', true),
  ('rape\s+you',       'block', 'harassment', true),

  -- Crude sexual content. Talking about sex is fine here; these go to review.
  ('send\s+nudes?',    'review', 'sexual_content', true),
  ('dick\s*pic',       'review', 'sexual_content', true),
  ('horny',            'review', 'sexual_content', true),

  -- Usernames only: don't let anyone pose as staff
  ('admin',            'block', 'reserved', true),
  ('moderator',        'block', 'reserved', true),
  ('official',         'block', 'reserved', true),
  ('support',          'block', 'reserved', true),
  ('staff',            'block', 'reserved', true),
  ('anonymous',        'block', 'reserved', true)
on conflict (pattern) do nothing;
