/**
 * Data layer abstraction.
 * Uses Supabase if EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.
 * Otherwise falls back to mock in-memory storage.
 */
import Constants from 'expo-constants';
import {
  mockAuth,
  mockProfiles,
  mockTrips,
  mockTripMembers,
  mockTripItems,
  mockItinerary,
  mockActivityLog,
  mockMessages,
} from './mockStorage';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const useSupabase = !!(supabaseUrl && supabaseKey);

if (useSupabase) {
  console.log('[Data] Supabase credentials detected — Supabase adapter not yet implemented, using mock storage');
}

// Export unified API (mock for now)
export const auth = mockAuth;
export const profilesApi = mockProfiles;
export const tripsApi = mockTrips;
export const tripMembersApi = mockTripMembers;
export const tripItemsApi = mockTripItems;
export const itineraryApi = mockItinerary;
export const activityLogApi = mockActivityLog;
export const messagesApi = mockMessages;

export { useSupabase };
