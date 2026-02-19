-- ============================================================
-- Zeitgeist Trip Planner — Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is user an active member of trip? ───
CREATE OR REPLACE FUNCTION is_trip_member(p_trip_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = p_trip_id
      AND user_id = p_user_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_trip_editor(p_trip_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = p_trip_id
      AND user_id = p_user_id
      AND status = 'active'
      AND role IN ('owner', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_trip_owner(p_trip_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = p_trip_id
      AND user_id = p_user_id
      AND status = 'active'
      AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── Profiles ───
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ─── Trips ───
CREATE POLICY "Members can view trips"
  ON trips FOR SELECT USING (is_trip_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create trips"
  ON trips FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update trips"
  ON trips FOR UPDATE USING (is_trip_owner(id, auth.uid()));

CREATE POLICY "Owners can delete trips"
  ON trips FOR DELETE USING (is_trip_owner(id, auth.uid()));

-- ─── Trip Members ───
CREATE POLICY "Members can view trip members"
  ON trip_members FOR SELECT USING (is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Owners/editors can invite"
  ON trip_members FOR INSERT WITH CHECK (is_trip_editor(trip_id, auth.uid()));

CREATE POLICY "Members can update own membership (leave)"
  ON trip_members FOR UPDATE USING (user_id = auth.uid());

-- Allow joining via invite code (special case handled in app logic)

-- ─── Trip Items ───
CREATE POLICY "Members can view items"
  ON trip_items FOR SELECT USING (is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Editors can create items"
  ON trip_items FOR INSERT WITH CHECK (is_trip_editor(trip_id, auth.uid()));

CREATE POLICY "Editors can update items"
  ON trip_items FOR UPDATE USING (is_trip_editor(trip_id, auth.uid()));

CREATE POLICY "Editors can delete items"
  ON trip_items FOR DELETE USING (is_trip_editor(trip_id, auth.uid()));

-- ─── Itinerary Slots ───
CREATE POLICY "Members can view slots"
  ON itinerary_slots FOR SELECT USING (is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Editors can manage slots"
  ON itinerary_slots FOR INSERT WITH CHECK (is_trip_editor(trip_id, auth.uid()));

CREATE POLICY "Editors can delete slots"
  ON itinerary_slots FOR DELETE USING (is_trip_editor(trip_id, auth.uid()));

-- ─── Itinerary Items ───
CREATE POLICY "Members can view itinerary items"
  ON itinerary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_slots s
      WHERE s.id = itinerary_items.slot_id
        AND is_trip_member(s.trip_id, auth.uid())
    )
  );

CREATE POLICY "Editors can manage itinerary items"
  ON itinerary_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itinerary_slots s
      WHERE s.id = itinerary_items.slot_id
        AND is_trip_editor(s.trip_id, auth.uid())
    )
  );

CREATE POLICY "Editors can update itinerary items"
  ON itinerary_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_slots s
      WHERE s.id = itinerary_items.slot_id
        AND is_trip_editor(s.trip_id, auth.uid())
    )
  );

CREATE POLICY "Editors can delete itinerary items"
  ON itinerary_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_slots s
      WHERE s.id = itinerary_items.slot_id
        AND is_trip_editor(s.trip_id, auth.uid())
    )
  );

-- ─── Activity Log ───
CREATE POLICY "Members can view activity"
  ON activity_log FOR SELECT USING (is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Members can log activity"
  ON activity_log FOR INSERT WITH CHECK (is_trip_member(trip_id, auth.uid()));

-- ─── Messages ───
CREATE POLICY "Members can view messages"
  ON messages FOR SELECT USING (is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Members can send messages"
  ON messages FOR INSERT WITH CHECK (is_trip_member(trip_id, auth.uid()) AND sender_id = auth.uid());
