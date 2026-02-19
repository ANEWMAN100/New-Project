import { create } from 'zustand';
import {
  Profile, Trip, TripMember, TripItem,
  ItinerarySlot, ItineraryItem, ActivityLogEntry, Message,
  BoardColumn, Period, VibeTag, ItemType,
} from '../types';
import {
  auth, tripsApi, tripMembersApi, tripItemsApi,
  itineraryApi, activityLogApi, messagesApi,
} from '../data';

// ─── Auth Store ───
interface AuthState {
  user: Profile | null;
  isReady: boolean;
  signUp: (email: string, name: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  ensureUser: () => Profile;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,
  signUp: (email, name) => {
    const user = auth.signUp(email, name);
    set({ user, isReady: true });
  },
  signIn: (email) => {
    const user = auth.signIn(email);
    set({ user, isReady: true });
  },
  signOut: () => {
    auth.signOut();
    set({ user: null });
  },
  ensureUser: () => {
    const user = auth.ensureUser();
    set({ user, isReady: true });
    return user;
  },
}));

// ─── Trips Store ───
interface TripsState {
  trips: Trip[];
  currentTripId: string | null;
  members: TripMember[];
  loadTrips: () => void;
  createTrip: (data: {
    destination: string;
    start_date: string;
    end_date: string;
    hero_image_key: string;
    vibe_tags: VibeTag[];
    city_code?: string;
  }) => Trip | null;
  setCurrentTrip: (tripId: string | null) => void;
  loadMembers: (tripId: string) => void;
  deleteTrip: (tripId: string) => boolean;
  leaveTrip: (tripId: string) => boolean;
  cloneTrip: (tripId: string) => Trip | undefined;
  updateTrip: (tripId: string, data: Partial<Trip>) => void;
  inviteByEmail: (tripId: string, email: string) => TripMember;
  createInviteLink: (tripId: string) => TripMember;
  joinByCode: (code: string) => TripMember | undefined;
  getCurrentTrip: () => Trip | undefined;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  currentTripId: null,
  members: [],

  loadTrips: () => {
    const user = useAuthStore.getState().ensureUser();
    const trips = tripsApi.getForUser(user.id);
    set({ trips });
  },

  createTrip: (data) => {
    const user = useAuthStore.getState().user;
    if (!user) return null;
    const trip = tripsApi.create({
      owner_id: user.id,
      destination: data.destination,
      city_code: data.city_code ?? null,
      start_date: data.start_date,
      end_date: data.end_date,
      hero_image_key: data.hero_image_key,
      vibe_tags: data.vibe_tags,
      is_archived: false,
      cloned_from_trip_id: null,
    });
    activityLogApi.add(trip.id, 'create_trip', { destination: data.destination });
    get().loadTrips();
    return trip;
  },

  setCurrentTrip: (tripId) => {
    set({ currentTripId: tripId });
    if (tripId) get().loadMembers(tripId);
  },

  loadMembers: (tripId) => {
    const members = tripMembersApi.getForTrip(tripId);
    set({ members });
  },

  deleteTrip: (tripId) => {
    const result = tripsApi.delete(tripId);
    if (result) {
      get().loadTrips();
      set({ currentTripId: null });
    }
    return result;
  },

  leaveTrip: (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;
    const result = tripMembersApi.leave(tripId, user.id);
    if (result) get().loadTrips();
    return result;
  },

  cloneTrip: (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return undefined;
    const trip = tripsApi.clone(tripId, user.id);
    if (trip) {
      activityLogApi.add(trip.id, 'clone_trip', { from: tripId });
      get().loadTrips();
    }
    return trip;
  },

  updateTrip: (tripId, data) => {
    tripsApi.update(tripId, data);
    get().loadTrips();
  },

  inviteByEmail: (tripId, email) => {
    const member = tripMembersApi.invite(tripId, email);
    activityLogApi.add(tripId, 'invite_member', { email });
    get().loadMembers(tripId);
    return member;
  },

  createInviteLink: (tripId) => {
    const member = tripMembersApi.createInviteLink(tripId);
    get().loadMembers(tripId);
    return member;
  },

  joinByCode: (code) => {
    const user = useAuthStore.getState().user;
    if (!user) return undefined;
    const member = tripMembersApi.joinByCode(code, user.id);
    if (member) {
      activityLogApi.add(member.trip_id, 'join_trip', { userId: user.id });
      get().loadTrips();
    }
    return member;
  },

  getCurrentTrip: () => {
    const { trips, currentTripId } = get();
    return trips.find(t => t.id === currentTripId) ?? tripsApi.getById(currentTripId ?? '');
  },
}));

// ─── Board Store ───
interface BoardState {
  items: TripItem[];
  loadItems: (tripId: string) => void;
  addItem: (data: {
    trip_id: string;
    title: string;
    item_type: ItemType;
    blurb?: string;
    notes?: string;
    link?: string;
    est_minutes?: number;
    est_cost?: string;
    board_column: BoardColumn;
  }) => TripItem;
  moveItem: (itemId: string, column: BoardColumn) => void;
  updateItem: (itemId: string, data: Partial<TripItem>) => void;
  deleteItem: (itemId: string) => void;
  getColumnItems: (column: BoardColumn) => TripItem[];
  getUnscheduledItems: (tripId: string) => TripItem[];
}

export const useBoardStore = create<BoardState>((set, get) => ({
  items: [],

  loadItems: (tripId) => {
    const items = tripItemsApi.getForTrip(tripId);
    set({ items });
  },

  addItem: (data) => {
    const user = useAuthStore.getState().user;
    const item = tripItemsApi.create({
      trip_id: data.trip_id,
      created_by: user?.id ?? null,
      title: data.title,
      item_type: data.item_type,
      blurb: data.blurb ?? '',
      notes: data.notes ?? '',
      link: data.link ?? '',
      est_minutes: data.est_minutes ?? null,
      est_cost: data.est_cost ?? null,
      board_column: data.board_column,
    });
    activityLogApi.add(data.trip_id, 'add_item', { title: data.title });
    get().loadItems(data.trip_id);
    return item;
  },

  moveItem: (itemId, column) => {
    const item = tripItemsApi.moveColumn(itemId, column);
    if (item) get().loadItems(item.trip_id);
  },

  updateItem: (itemId, data) => {
    const item = tripItemsApi.update(itemId, data);
    if (item) get().loadItems(item.trip_id);
  },

  deleteItem: (itemId) => {
    const item = tripItemsApi.getById(itemId);
    if (item) {
      tripItemsApi.delete(itemId);
      get().loadItems(item.trip_id);
    }
  },

  getColumnItems: (column) => {
    return get().items.filter(i => i.board_column === column);
  },

  getUnscheduledItems: (tripId) => {
    const scheduledIds = itineraryApi.getScheduledItemIds(tripId);
    return get().items.filter(i => !scheduledIds.includes(i.id));
  },
}));

// ─── Itinerary Store ───
interface ItineraryState {
  slots: ItinerarySlot[];
  slotItems: Record<string, ItineraryItem[]>;
  loadSlots: (tripId: string) => void;
  ensureSlot: (tripId: string, date: string, period: Period) => ItinerarySlot;
  addItemToSlot: (slotId: string, tripItemId: string) => void;
  removeItemFromSlot: (itineraryItemId: string) => void;
  reorderSlotItems: (slotId: string, orderedIds: string[]) => void;
  getSlotItems: (slotId: string) => (ItineraryItem & { tripItem?: TripItem })[];
  getSlotsForDate: (tripId: string, date: string) => ItinerarySlot[];
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  slots: [],
  slotItems: {},

  loadSlots: (tripId) => {
    const slots = itineraryApi.getSlotsForTrip(tripId);
    const slotItems: Record<string, ItineraryItem[]> = {};
    for (const slot of slots) {
      slotItems[slot.id] = itineraryApi.getItemsForSlot(slot.id);
    }
    set({ slots, slotItems });
  },

  ensureSlot: (tripId, date, period) => {
    const slot = itineraryApi.createSlot({ trip_id: tripId, slot_date: date, period });
    get().loadSlots(tripId);
    return slot;
  },

  addItemToSlot: (slotId, tripItemId) => {
    const existing = itineraryApi.getItemsForSlot(slotId);
    itineraryApi.addItem({
      slot_id: slotId,
      trip_item_id: tripItemId,
      position: existing.length,
      scheduled_time: null,
    });
    // Find trip_id from slot
    const slot = get().slots.find(s => s.id === slotId);
    if (slot) {
      activityLogApi.add(slot.trip_id, 'schedule_item', { tripItemId });
      get().loadSlots(slot.trip_id);
    }
  },

  removeItemFromSlot: (itineraryItemId) => {
    itineraryApi.removeItem(itineraryItemId);
    // Reload
    const { slots } = get();
    if (slots.length > 0) {
      get().loadSlots(slots[0].trip_id);
    }
  },

  reorderSlotItems: (slotId, orderedIds) => {
    itineraryApi.reorderItems(slotId, orderedIds);
    const slot = get().slots.find(s => s.id === slotId);
    if (slot) get().loadSlots(slot.trip_id);
  },

  getSlotItems: (slotId) => {
    const items = get().slotItems[slotId] ?? [];
    return items.map(i => ({
      ...i,
      tripItem: tripItemsApi.getById(i.trip_item_id),
    }));
  },

  getSlotsForDate: (tripId, date) => {
    return get().slots.filter(s => s.trip_id === tripId && s.slot_date === date);
  },
}));

// ─── Activity Store ───
interface ActivityState {
  entries: ActivityLogEntry[];
  loadEntries: (tripId: string) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  entries: [],
  loadEntries: (tripId) => {
    const entries = activityLogApi.getForTrip(tripId);
    set({ entries });
  },
}));

// ─── Chat Store ───
interface ChatState {
  messages: Message[];
  loadMessages: (tripId: string) => void;
  sendMessage: (tripId: string, text: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loadMessages: (tripId) => {
    const msgs = messagesApi.getForTrip(tripId);
    set({ messages: msgs });
  },
  sendMessage: (tripId, text) => {
    messagesApi.send(tripId, text);
    const msgs = messagesApi.getForTrip(tripId);
    set({ messages: msgs });
  },
}));
