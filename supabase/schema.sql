-- ============================================================
-- Zeitgeist Trip Planner — Database Schema
-- Supabase (Postgres) migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ───
CREATE TABLE profiles (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text UNIQUE NOT NULL,
  name       text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Trips ───
CREATE TABLE trips (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  destination          text NOT NULL,
  city_code            text,
  start_date           date NOT NULL,
  end_date             date NOT NULL,
  hero_image_key       text NOT NULL DEFAULT 'default',
  vibe_tags            text[] NOT NULL DEFAULT '{}',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  is_archived          boolean NOT NULL DEFAULT false,
  cloned_from_trip_id  uuid REFERENCES trips(id) ON DELETE SET NULL
);

CREATE INDEX idx_trips_owner ON trips(owner_id);

-- ─── Trip Members ───
CREATE TABLE trip_members (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invited_email text,
  role          text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  status        text NOT NULL CHECK (status IN ('invited', 'active', 'left')) DEFAULT 'invited',
  invite_code   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_members_trip   ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user   ON trip_members(user_id);
CREATE INDEX idx_trip_members_code   ON trip_members(invite_code);

-- ─── Trip Items ───
CREATE TABLE trip_items (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title        text NOT NULL,
  item_type    text NOT NULL DEFAULT 'Other',
  blurb        text NOT NULL DEFAULT '',
  notes        text NOT NULL DEFAULT '',
  link         text NOT NULL DEFAULT '',
  est_minutes  int,
  est_cost     text,
  board_column text NOT NULL CHECK (board_column IN ('must', 'nice', 'time', 'food')) DEFAULT 'must',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_items_trip ON trip_items(trip_id);

-- ─── Itinerary Slots ───
CREATE TABLE itinerary_slots (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  slot_date  date NOT NULL,
  period     text NOT NULL CHECK (period IN ('morning', 'afternoon', 'evening')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, slot_date, period)
);

CREATE INDEX idx_itinerary_slots_trip ON itinerary_slots(trip_id);

-- ─── Itinerary Items ───
CREATE TABLE itinerary_items (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id        uuid NOT NULL REFERENCES itinerary_slots(id) ON DELETE CASCADE,
  trip_item_id   uuid NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
  position       int NOT NULL DEFAULT 0,
  scheduled_time text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_itinerary_items_slot ON itinerary_items(slot_id);

-- ─── Activity Log ───
CREATE TABLE activity_log (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  actor_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action     text NOT NULL,
  payload    jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_trip ON activity_log(trip_id);

-- ─── Messages (stub) ───
CREATE TABLE messages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_trip ON messages(trip_id);

-- ─── Updated-at trigger ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trip_items_updated_at
  BEFORE UPDATE ON trip_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
