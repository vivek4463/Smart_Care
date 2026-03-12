-- SMART CARE SUPABASE SCHEMA

-- 1. Profiles (Extends Supabase Auth users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. User Preferences (For RL and Personalization)
create table user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  q_table jsonb default '{}'::jsonb,
  preferred_genres text[] default '{}',
  music_tempo_pref float default 1.0,
  updated_at timestamp with time zone default now()
);

-- 3. Therapy Sessions (Legacy/Alternate)
create table therapy_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  initial_mood text,
  final_mood text,
  average_heart_rate float,
  satisfaction_score int,
  music_style_generated text,
  created_at timestamp with time zone default now()
);

-- 3b. Active Sessions Table (Used by App)
create table sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  face_emotion text,
  voice_emotion text,
  text_sentiment text,
  heart_rate float,
  final_emotion text,
  confidence float,
  created_at timestamp with time zone default now()
);

-- 4. Biometric Logs (Detailed data for analysis if needed)
create table biometric_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references therapy_sessions on delete cascade not null,
  timestamp timestamp with time zone default now(),
  heart_rate float,
  stress_level float,
  emotion_data jsonb
);

-- RLS (Row Level Security) POLICIES

alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table therapy_sessions enable row level security;
alter table biometric_logs enable row level security;

-- Profiles: Users can only see and edit their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Preferences: Users can only see and edit their own preferences
create policy "Users can manage own preferences" on user_preferences for all using (auth.uid() = user_id);

-- Sessions: Users can only see and edit their own sessions
create policy "Users can view own sessions" on therapy_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on therapy_sessions for insert with check (auth.uid() = user_id);

-- Biometrics: Linked to sessions
create policy "Users can view own biometric data" on biometric_logs for select 
using (exists (select 1 from therapy_sessions where therapy_sessions.id = session_id and therapy_sessions.user_id = auth.uid()));

-- Active Sessions: Users can only see and edit their own sessions
alter table sessions enable row level security;
create policy "Users can view own active sessions" on sessions for select using (auth.uid() = user_id);
create policy "Users can insert own active sessions" on sessions for insert with check (auth.uid() = user_id);

-- FUNCTIONS & TRIGGERS

-- Trigger to create profile and preferences on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
