import { Platform } from 'react-native';

export const colors = {
  // Core palette
  bg: '#0F0A1A',
  bgCard: 'rgba(255,255,255,0.06)',
  bgCardSolid: '#1A1428',
  bgElevated: 'rgba(255,255,255,0.10)',
  bgInput: 'rgba(255,255,255,0.08)',

  // Glass
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassHover: 'rgba(255,255,255,0.14)',

  // Primary accent
  primary: '#7C5CFC',
  primaryLight: '#A78BFA',
  primaryDark: '#5B3FD6',
  primaryGlow: 'rgba(124,92,252,0.25)',

  // Secondary accent
  accent: '#F472B6',
  accentLight: '#F9A8D4',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textTertiary: 'rgba(255,255,255,0.40)',
  textInverse: '#0F0A1A',

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Vibe chips
  vibeColors: {
    Foodie: '#F59E0B',
    Museums: '#8B5CF6',
    Nightlife: '#EC4899',
    Outdoors: '#10B981',
    'Family-friendly': '#60A5FA',
    Adventure: '#EF4444',
    Relaxation: '#14B8A6',
    Shopping: '#F97316',
  } as Record<string, string>,

  // Board columns
  boardColumns: {
    must: '#7C5CFC',
    nice: '#60A5FA',
    time: '#FBBF24',
    food: '#F59E0B',
  },

  // Item types
  itemTypes: {
    Restaurant: '#F59E0B',
    Activity: '#10B981',
    Museum: '#8B5CF6',
    Nightlife: '#EC4899',
    Outdoor: '#34D399',
    Lodging: '#60A5FA',
    Transport: '#94A3B8',
    Other: '#A78BFA',
  } as Record<string, string>,
} as const;

export const gradients = {
  primary: ['#7C5CFC', '#A78BFA'] as [string, string],
  accent: ['#F472B6', '#A78BFA'] as [string, string],
  dark: ['#0F0A1A', '#1A1428'] as [string, string],
  card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as [string, string],
  hero: ['transparent', 'rgba(15,10,26,0.85)'] as [string, string],
  morning: ['#FCD34D', '#F59E0B'] as [string, string],
  afternoon: ['#60A5FA', '#3B82F6'] as [string, string],
  evening: ['#8B5CF6', '#6D28D9'] as [string, string],
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  button: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.3 },
  tabLabel: { fontSize: 10, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
    android: { elevation: 2 },
    web: { boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    android: { elevation: 4 },
    web: { boxShadow: '0 4px 16px rgba(0,0,0,0.25)' },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    android: { elevation: 8 },
    web: { boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
    default: {},
  }),
  glow: Platform.select({
    ios: { shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12 },
    android: { elevation: 6 },
    web: { boxShadow: '0 0 20px rgba(124,92,252,0.4)' },
    default: {},
  }),
};

export const HERO_IMAGES: Record<string, { uri: string; credit: string }> = {
  paris: { uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', credit: 'Unsplash' },
  tokyo: { uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', credit: 'Unsplash' },
  nyc: { uri: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', credit: 'Unsplash' },
  london: { uri: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', credit: 'Unsplash' },
  rome: { uri: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', credit: 'Unsplash' },
  barcelona: { uri: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80', credit: 'Unsplash' },
  bali: { uri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', credit: 'Unsplash' },
  dubai: { uri: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', credit: 'Unsplash' },
  default: { uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', credit: 'Unsplash' },
};

export const VIBE_OPTIONS = [
  'Foodie', 'Museums', 'Nightlife', 'Outdoors',
  'Family-friendly', 'Adventure', 'Relaxation', 'Shopping',
] as const;

export const ITEM_TYPES = [
  'Restaurant', 'Activity', 'Museum', 'Nightlife',
  'Outdoor', 'Lodging', 'Transport', 'Other',
] as const;

export const BOARD_COLUMNS = [
  { key: 'must' as const, label: 'Must Do', color: colors.boardColumns.must },
  { key: 'nice' as const, label: 'Nice To Have', color: colors.boardColumns.nice },
  { key: 'time' as const, label: 'If We Have Time', color: colors.boardColumns.time },
  { key: 'food' as const, label: 'Food & Drinks', color: colors.boardColumns.food },
] as const;

export const PERIODS = ['morning', 'afternoon', 'evening'] as const;

export const PERIOD_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export const PERIOD_ICONS: Record<string, string> = {
  morning: 'sunrise',
  afternoon: 'sun',
  evening: 'moon',
};
