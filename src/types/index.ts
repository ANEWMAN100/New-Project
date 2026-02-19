export type VibeTag =
  | 'Foodie' | 'Museums' | 'Nightlife' | 'Outdoors'
  | 'Family-friendly' | 'Adventure' | 'Relaxation' | 'Shopping';

export type ItemType =
  | 'Restaurant' | 'Activity' | 'Museum' | 'Nightlife'
  | 'Outdoor' | 'Lodging' | 'Transport' | 'Other';

export type BoardColumn = 'must' | 'nice' | 'time' | 'food';

export type Period = 'morning' | 'afternoon' | 'evening';

export type MemberRole = 'owner' | 'editor' | 'viewer';

export type MemberStatus = 'invited' | 'active' | 'left';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  owner_id: string;
  destination: string;
  city_code: string | null;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  hero_image_key: string;
  vibe_tags: VibeTag[];
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  cloned_from_trip_id: string | null;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string | null;
  invited_email: string | null;
  role: MemberRole;
  status: MemberStatus;
  invite_code: string | null;
  created_at: string;
}

export interface TripItem {
  id: string;
  trip_id: string;
  created_by: string | null;
  title: string;
  item_type: ItemType;
  blurb: string;
  notes: string;
  link: string;
  est_minutes: number | null;
  est_cost: string | null;
  board_column: BoardColumn;
  created_at: string;
  updated_at: string;
}

export interface ItinerarySlot {
  id: string;
  trip_id: string;
  slot_date: string; // ISO date
  period: Period;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  slot_id: string;
  trip_item_id: string;
  position: number;
  scheduled_time: string | null;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  trip_id: string;
  actor_id: string | null;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Message {
  id: string;
  trip_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

// Derived types
export interface TripWithMembers extends Trip {
  members: TripMember[];
}

export interface ItinerarySlotWithItems extends ItinerarySlot {
  items: (ItineraryItem & { tripItem: TripItem })[];
}
