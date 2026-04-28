-- ============================================================
-- TARZI APP - SUPABASE SCHEMA
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  phone text default '',
  city text default 'Dubai',
  area text default '',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MEASUREMENTS
-- ============================================================
create table if not exists public.measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'My Measurements',
  gender text not null check (gender in ('male', 'female')),
  chest numeric,
  waist numeric,
  hips numeric,
  shoulder_width numeric,
  arm_length numeric,
  neck numeric,
  inseam numeric,
  thigh numeric,
  height numeric,
  weight numeric,
  notes text,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.measurements enable row level security;

create policy "Users manage own measurements"
  on public.measurements for all
  using (auth.uid() = user_id);

-- ============================================================
-- TAILORS
-- ============================================================
create table if not exists public.tailors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  area text not null,
  distance_km numeric not null default 0,
  experience_years integer not null default 0,
  expertise text[] not null default '{}',
  specialties text[] not null default '{}',
  rating numeric not null default 0,
  review_count integer not null default 0,
  availability text not null default '',
  availability_hours text not null default '',
  avatar_url text,
  phone text not null default '',
  is_available boolean not null default true,
  created_at timestamptz default now()
);

-- Tailors are public-readable
alter table public.tailors enable row level security;
create policy "Anyone can view tailors" on public.tailors for select using (true);

-- ============================================================
-- TAILOR REVIEWS
-- ============================================================
create table if not exists public.tailor_reviews (
  id uuid primary key default uuid_generate_v4(),
  tailor_id uuid references public.tailors(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now()
);

alter table public.tailor_reviews enable row level security;
create policy "Anyone can view reviews" on public.tailor_reviews for select using (true);
create policy "Auth users can insert reviews" on public.tailor_reviews for insert with check (auth.uid() = user_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tailor_id uuid references public.tailors(id),
  tailor_name text not null default '',
  service_type text not null check (service_type in ('alterations', 'from_scratch', 'upcycling')),
  garment_type text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','in_progress','ready','delivered','cancelled')),
  gender text not null check (gender in ('male', 'female')),
  comments text,
  measurement_id uuid references public.measurements(id),
  image_urls text[] default '{}',
  price numeric,
  pickup_date date,
  pickup_time text,
  pickup_address text,
  expected_delivery date,
  order_number text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;
create policy "Users manage own orders" on public.orders for all using (auth.uid() = user_id);

-- Auto-generate order number
create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substring(new.id::text, 1, 6);
  return new;
end;
$$ language plpgsql;

create trigger set_order_number
  before insert on public.orders
  for each row execute procedure generate_order_number();

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid not null,
  sender_type text not null check (sender_type in ('user', 'tailor')),
  sender_name text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;
create policy "Order participants can read messages"
  on public.chat_messages for select
  using (
    auth.uid() = sender_id or
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Auth users can send messages"
  on public.chat_messages for insert
  with check (auth.uid() = sender_id);

-- Realtime for chat
alter publication supabase_realtime add table public.chat_messages;

-- ============================================================
-- USER ADDRESSES
-- ============================================================
create table if not exists public.user_addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  city text not null default 'Dubai',
  area text not null,
  street text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.user_addresses enable row level security;
create policy "Users manage own addresses" on public.user_addresses for all using (auth.uid() = user_id);

-- ============================================================
-- SAVED TAILORS
-- ============================================================
create table if not exists public.saved_tailors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tailor_id uuid references public.tailors(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, tailor_id)
);

alter table public.saved_tailors enable row level security;
create policy "Users manage saved tailors" on public.saved_tailors for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('garment-images', 'garment-images', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('tailor-work', 'tailor-work', true);

-- ============================================================
-- SEED TAILORS (sample Dubai tailors)
-- ============================================================
insert into public.tailors (id, name, location, area, distance_km, experience_years, expertise, specialties, rating, review_count, availability, availability_hours, phone, is_available)
values
  ('11111111-1111-1111-1111-111111111111', 'Lujain Tailoring', 'Al Khawaneej 1', 'Al Khawaneej', 0.2, 30, ARRAY['Abayas','Dresses','Evening Gowns','Alterations'], ARRAY['alterations','from_scratch'], 4.9, 127, 'Monday – Saturday', '10:00 AM – 12:00 PM & 4:00 PM – 10:00 PM', '+971 50 234 5678', true),
  ('22222222-2222-2222-2222-222222222222', 'Al Najma Tailoring', 'Mizhar 1', 'Mizhar', 1.0, 12, ARRAY['Kandooras','Suits','Thobes','Shirts'], ARRAY['alterations','from_scratch'], 4.7, 89, 'Sunday – Friday', '9:00 AM – 9:00 PM', '+971 55 876 5432', true),
  ('33333333-3333-3333-3333-333333333333', 'Raha Fashion Studio', 'Mirdif City Centre Area', 'Mirdif', 1.8, 8, ARRAY['Bridal Wear','Jalabiyas','Blouses','Skirts'], ARRAY['from_scratch','upcycling'], 4.6, 54, 'Monday – Sunday', '10:00 AM – 8:00 PM', '+971 52 111 3344', true),
  ('44444444-4444-4444-4444-444444444444', 'Emirates Stitch House', 'Deira, Al Rigga', 'Deira', 3.5, 20, ARRAY['Kandooras','Suits','Jackets','Trousers'], ARRAY['alterations','from_scratch'], 4.8, 203, 'Sunday – Thursday', '8:00 AM – 10:00 PM', '+971 4 295 6677', false),
  ('55555555-5555-5555-5555-555555555555', 'Couture Arabesque', 'Jumeirah 1', 'Jumeirah', 5.2, 15, ARRAY['Abayas','Evening Gowns','Upcycling','Bespoke'], ARRAY['from_scratch','upcycling'], 4.9, 176, 'Monday – Saturday', '10:00 AM – 7:00 PM', '+971 56 900 8821', true),
  ('66666666-6666-6666-6666-666666666666', 'Sharif & Sons Tailors', 'Karama', 'Karama', 4.1, 25, ARRAY['Suits','Vests','Trousers','Shirts','Alterations'], ARRAY['alterations','from_scratch'], 4.5, 312, 'Sunday – Saturday', '9:00 AM – 11:00 PM', '+971 4 334 2211', true)
on conflict (id) do nothing;
