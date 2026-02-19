/**
 * Mock storage adapter with the same interface as Supabase operations.
 * Used when Supabase credentials are not available.
 * Data persists in-memory only (for MVP; AsyncStorage can be added later).
 */
import {
  Profile, Trip, TripMember, TripItem,
  ItinerarySlot, ItineraryItem, ActivityLogEntry, Message,
} from '../types';
import { generateId, generateInviteCode } from '../utils/ids';

// In-memory stores
let profiles: Profile[] = [];
let trips: Trip[] = [];
let tripMembers: TripMember[] = [];
let tripItems: TripItem[] = [];
let itinerarySlots: ItinerarySlot[] = [];
let itineraryItems: ItineraryItem[] = [];
let activityLog: ActivityLogEntry[] = [];
let messages: Message[] = [];

// Current user (mock auth)
let currentUser: Profile | null = null;

function now(): string {
  return new Date().toISOString();
}

// ─── Auth ───
export const mockAuth = {
  getCurrentUser: (): Profile | null => currentUser,

  signUp: (email: string, name: string): Profile => {
    const existing = profiles.find(p => p.email === email);
    if (existing) {
      currentUser = existing;
      return existing;
    }
    const profile: Profile = {
      id: generateId(),
      email,
      name,
      avatar_url: null,
      created_at: now(),
    };
    profiles.push(profile);
    currentUser = profile;
    return profile;
  },

  signIn: (email: string): Profile | null => {
    const profile = profiles.find(p => p.email === email);
    if (profile) {
      currentUser = profile;
      return profile;
    }
    return null;
  },

  signOut: (): void => {
    currentUser = null;
  },

  ensureUser: (): Profile => {
    if (!currentUser) {
      return mockAuth.signUp('demo@zeitgeist.app', 'Demo User');
    }
    return currentUser;
  },
};

// ─── Profiles ───
export const mockProfiles = {
  getById: (id: string): Profile | undefined => profiles.find(p => p.id === id),
  getByEmail: (email: string): Profile | undefined => profiles.find(p => p.email === email),
  update: (id: string, data: Partial<Profile>): Profile | undefined => {
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    profiles[idx] = { ...profiles[idx], ...data };
    return profiles[idx];
  },
};

// ─── Trips ───
export const mockTrips = {
  create: (data: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Trip => {
    const trip: Trip = {
      ...data,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    trips.push(trip);
    // Auto-create owner membership
    tripMembers.push({
      id: generateId(),
      trip_id: trip.id,
      user_id: data.owner_id,
      invited_email: null,
      role: 'owner',
      status: 'active',
      invite_code: null,
      created_at: now(),
    });
    return trip;
  },

  getById: (id: string): Trip | undefined => trips.find(t => t.id === id),

  getForUser: (userId: string): Trip[] => {
    const memberTripIds = tripMembers
      .filter(m => m.user_id === userId && m.status === 'active')
      .map(m => m.trip_id);
    return trips.filter(t => memberTripIds.includes(t.id) && !t.is_archived);
  },

  update: (id: string, data: Partial<Trip>): Trip | undefined => {
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    trips[idx] = { ...trips[idx], ...data, updated_at: now() };
    return trips[idx];
  },

  delete: (id: string): boolean => {
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return false;
    trips.splice(idx, 1);
    // Cascade delete
    tripMembers = tripMembers.filter(m => m.trip_id !== id);
    const itemIds = tripItems.filter(i => i.trip_id === id).map(i => i.id);
    tripItems = tripItems.filter(i => i.trip_id !== id);
    const slotIds = itinerarySlots.filter(s => s.trip_id === id).map(s => s.id);
    itinerarySlots = itinerarySlots.filter(s => s.trip_id !== id);
    itineraryItems = itineraryItems.filter(i => !slotIds.includes(i.slot_id));
    activityLog = activityLog.filter(a => a.trip_id !== id);
    messages = messages.filter(m => m.trip_id !== id);
    return true;
  },

  clone: (tripId: string, newOwnerId: string): Trip | undefined => {
    const original = trips.find(t => t.id === tripId);
    if (!original) return undefined;

    const newTrip = mockTrips.create({
      owner_id: newOwnerId,
      destination: original.destination,
      city_code: original.city_code,
      start_date: original.start_date,
      end_date: original.end_date,
      hero_image_key: original.hero_image_key,
      vibe_tags: [...original.vibe_tags],
      is_archived: false,
      cloned_from_trip_id: original.id,
    });

    // Clone items
    const originalItems = tripItems.filter(i => i.trip_id === tripId);
    const itemIdMap = new Map<string, string>();
    for (const item of originalItems) {
      const newItem = mockTripItems.create({
        trip_id: newTrip.id,
        created_by: newOwnerId,
        title: item.title,
        item_type: item.item_type,
        blurb: item.blurb,
        notes: item.notes,
        link: item.link,
        est_minutes: item.est_minutes,
        est_cost: item.est_cost,
        board_column: item.board_column,
      });
      itemIdMap.set(item.id, newItem.id);
    }

    // Clone itinerary
    const originalSlots = itinerarySlots.filter(s => s.trip_id === tripId);
    for (const slot of originalSlots) {
      const newSlot = mockItinerary.createSlot({
        trip_id: newTrip.id,
        slot_date: slot.slot_date,
        period: slot.period,
      });
      const slotItems = itineraryItems.filter(i => i.slot_id === slot.id);
      for (const si of slotItems) {
        const newItemId = itemIdMap.get(si.trip_item_id);
        if (newItemId) {
          mockItinerary.addItem({
            slot_id: newSlot.id,
            trip_item_id: newItemId,
            position: si.position,
            scheduled_time: si.scheduled_time,
          });
        }
      }
    }

    return newTrip;
  },
};

// ─── Trip Members ───
export const mockTripMembers = {
  getForTrip: (tripId: string): TripMember[] =>
    tripMembers.filter(m => m.trip_id === tripId),

  invite: (tripId: string, email: string, role: 'editor' | 'viewer' = 'editor'): TripMember => {
    const code = generateInviteCode();
    const existingProfile = profiles.find(p => p.email === email);
    const member: TripMember = {
      id: generateId(),
      trip_id: tripId,
      user_id: existingProfile?.id ?? null,
      invited_email: email,
      role,
      status: existingProfile ? 'active' : 'invited',
      invite_code: code,
      created_at: now(),
    };
    tripMembers.push(member);
    return member;
  },

  createInviteLink: (tripId: string, role: 'editor' | 'viewer' = 'editor'): TripMember => {
    const code = generateInviteCode();
    const member: TripMember = {
      id: generateId(),
      trip_id: tripId,
      user_id: null,
      invited_email: null,
      role,
      status: 'invited',
      invite_code: code,
      created_at: now(),
    };
    tripMembers.push(member);
    return member;
  },

  joinByCode: (code: string, userId: string): TripMember | undefined => {
    const idx = tripMembers.findIndex(
      m => m.invite_code === code && m.status === 'invited'
    );
    if (idx === -1) return undefined;
    tripMembers[idx] = {
      ...tripMembers[idx],
      user_id: userId,
      status: 'active',
    };
    return tripMembers[idx];
  },

  leave: (tripId: string, userId: string): boolean => {
    const idx = tripMembers.findIndex(
      m => m.trip_id === tripId && m.user_id === userId && m.role !== 'owner'
    );
    if (idx === -1) return false;
    tripMembers[idx] = { ...tripMembers[idx], status: 'left' };
    return true;
  },

  getMemberRole: (tripId: string, userId: string): string | null => {
    const member = tripMembers.find(
      m => m.trip_id === tripId && m.user_id === userId && m.status === 'active'
    );
    return member?.role ?? null;
  },
};

// ─── Trip Items ───
export const mockTripItems = {
  create: (data: Omit<TripItem, 'id' | 'created_at' | 'updated_at'>): TripItem => {
    const item: TripItem = {
      ...data,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    tripItems.push(item);
    return item;
  },

  getForTrip: (tripId: string): TripItem[] =>
    tripItems.filter(i => i.trip_id === tripId),

  getById: (id: string): TripItem | undefined =>
    tripItems.find(i => i.id === id),

  update: (id: string, data: Partial<TripItem>): TripItem | undefined => {
    const idx = tripItems.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    tripItems[idx] = { ...tripItems[idx], ...data, updated_at: now() };
    return tripItems[idx];
  },

  delete: (id: string): boolean => {
    const idx = tripItems.findIndex(i => i.id === id);
    if (idx === -1) return false;
    tripItems.splice(idx, 1);
    itineraryItems = itineraryItems.filter(i => i.trip_item_id !== id);
    return true;
  },

  moveColumn: (id: string, column: TripItem['board_column']): TripItem | undefined => {
    return mockTripItems.update(id, { board_column: column });
  },
};

// ─── Itinerary ───
export const mockItinerary = {
  createSlot: (data: Omit<ItinerarySlot, 'id' | 'created_at'>): ItinerarySlot => {
    // Check if slot already exists
    const existing = itinerarySlots.find(
      s => s.trip_id === data.trip_id && s.slot_date === data.slot_date && s.period === data.period
    );
    if (existing) return existing;

    const slot: ItinerarySlot = {
      ...data,
      id: generateId(),
      created_at: now(),
    };
    itinerarySlots.push(slot);
    return slot;
  },

  getSlotsForTrip: (tripId: string): ItinerarySlot[] =>
    itinerarySlots.filter(s => s.trip_id === tripId),

  getSlotsForDate: (tripId: string, date: string): ItinerarySlot[] =>
    itinerarySlots.filter(s => s.trip_id === tripId && s.slot_date === date),

  addItem: (data: Omit<ItineraryItem, 'id' | 'created_at'>): ItineraryItem => {
    const item: ItineraryItem = {
      ...data,
      id: generateId(),
      created_at: now(),
    };
    itineraryItems.push(item);
    return item;
  },

  getItemsForSlot: (slotId: string): ItineraryItem[] =>
    itineraryItems
      .filter(i => i.slot_id === slotId)
      .sort((a, b) => a.position - b.position),

  removeItem: (id: string): boolean => {
    const idx = itineraryItems.findIndex(i => i.id === id);
    if (idx === -1) return false;
    itineraryItems.splice(idx, 1);
    return true;
  },

  reorderItems: (slotId: string, orderedItemIds: string[]): void => {
    orderedItemIds.forEach((id, index) => {
      const idx = itineraryItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        itineraryItems[idx] = { ...itineraryItems[idx], position: index };
      }
    });
  },

  isItemScheduled: (tripItemId: string): boolean =>
    itineraryItems.some(i => i.trip_item_id === tripItemId),

  getScheduledItemIds: (tripId: string): string[] => {
    const slotIds = itinerarySlots.filter(s => s.trip_id === tripId).map(s => s.id);
    return itineraryItems
      .filter(i => slotIds.includes(i.slot_id))
      .map(i => i.trip_item_id);
  },
};

// ─── Activity Log ───
export const mockActivityLog = {
  add: (tripId: string, action: string, payload: Record<string, unknown> = {}): ActivityLogEntry => {
    const entry: ActivityLogEntry = {
      id: generateId(),
      trip_id: tripId,
      actor_id: currentUser?.id ?? null,
      action,
      payload,
      created_at: now(),
    };
    activityLog.push(entry);
    return entry;
  },

  getForTrip: (tripId: string): ActivityLogEntry[] =>
    activityLog
      .filter(a => a.trip_id === tripId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
};

// ─── Messages ───
export const mockMessages = {
  send: (tripId: string, text: string): Message | undefined => {
    if (!currentUser) return undefined;
    const msg: Message = {
      id: generateId(),
      trip_id: tripId,
      sender_id: currentUser.id,
      text,
      created_at: now(),
    };
    messages.push(msg);
    return msg;
  },

  getForTrip: (tripId: string): Message[] =>
    messages
      .filter(m => m.trip_id === tripId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
};
