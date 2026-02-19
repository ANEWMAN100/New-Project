# Zeitgeist Trip Planner

A standalone trip planning module built with Expo (React Native + Web), TypeScript, and Zustand.

## How to Run

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run web       # Web browser
npm run ios       # iOS simulator (macOS only)
npm run android   # Android emulator
```

## Supabase (Optional)

The app uses a local in-memory mock storage by default. To connect to Supabase:

1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and anon key
3. Run the SQL files in `supabase/schema.sql` then `supabase/rls.sql` against your database

```bash
cp .env.example .env
```

## Tech Stack

- **Expo** (React Native + Web) with Expo Router
- **TypeScript** (strict mode)
- **Zustand** for state management
- **Supabase** (Postgres + Auth) — optional, falls back to mock storage

## Project Structure

```
app/                        # Expo Router screens
  _layout.tsx               # Root layout
  (tabs)/                   # Bottom tab navigator
    _layout.tsx             # Tab bar configuration
    index.tsx               # Trips list (home)
    board.tsx               # Kanban board
    itinerary.tsx           # Day-by-day itinerary
    chat.tsx                # Trip chat (stub)
    profile.tsx             # User profile
  trip/
    [id].tsx                # Trip overview (hero, invite, actions)
    new.tsx                 # New trip wizard (3 steps)
  invite/
    [code].tsx              # Join trip via invite code
src/
  theme/index.ts            # Colors, gradients, typography, spacing
  types/index.ts            # TypeScript interfaces
  store/index.ts            # Zustand stores (auth, trips, board, itinerary, chat)
  data/
    index.ts                # Data layer abstraction
    mockStorage.ts          # In-memory mock storage with full CRUD
  components/
    common/                 # Reusable UI components
      GlassCard.tsx         # Glass-morphism card
      Button.tsx            # Primary/secondary/ghost/danger buttons
      Chip.tsx              # Tag chips (vibes, types)
      Avatar.tsx            # User avatar + avatar groups
      BottomSheet.tsx       # Modal bottom sheet
      Input.tsx             # Styled text input
      CalendarPicker.tsx    # Date range calendar
      EmptyState.tsx        # Empty state placeholder
  utils/
    dates.ts                # Date formatting and utilities
    ids.ts                  # UUID and invite code generation
supabase/
  schema.sql                # Full database schema
  rls.sql                   # Row Level Security policies
```

## Features

- **Trip CRUD**: Create, view, delete trips with destination, dates, hero image, and vibes
- **Trip Board**: Kanban-style board (Must Do / Nice To Have / If We Have Time / Food & Drinks)
- **Itinerary**: Day-by-day planner with Morning / Afternoon / Evening slots
- **Collaboration**: Invite by email or shareable invite code
- **Clone Trip**: Duplicate trips with all items and itinerary
- **Activity Feed**: Track who added, scheduled, or invited
- **Chat**: Simple trip chat thread
- **Profile**: View all trips, cloned trips, stats

## Data Model

See `supabase/schema.sql` for the full schema. Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts |
| `trips` | Trip metadata (destination, dates, vibes) |
| `trip_members` | Membership + invite codes |
| `trip_items` | Board items (restaurants, activities, etc.) |
| `itinerary_slots` | Day + period (morning/afternoon/evening) |
| `itinerary_items` | Items scheduled into slots |
| `activity_log` | Action history |
| `messages` | Trip chat messages |
