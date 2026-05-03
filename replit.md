# Game Host — Family Game App

A polished Expo React Native mobile app for hosting family-friendly games during car trips, dinner tables, and waiting rooms.

## Architecture

- **Framework**: Expo (React Native) with expo-router file-based navigation
- **Package**: `@workspace/mobile` in the pnpm monorepo at `artifacts/mobile/`
- **State**: React Context (`GameContext`) + AsyncStorage (via `@react-native-async-storage/async-storage`)
- **No backend** — fully offline, no API calls

## Structure

```
artifacts/mobile/
├── app/
│   ├── _layout.tsx          # Root layout: fonts, providers, Stack nav
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Simple Slot (no tab bar)
│   │   └── index.tsx        # Home screen
│   ├── games.tsx            # Game picker with filters
│   ├── setup.tsx            # Game setup (players, options)
│   ├── play.tsx             # Active game screen (all 4 game UIs)
│   ├── end.tsx              # End-game summary + scores
│   └── packs.tsx            # Future packs teaser
├── components/
│   ├── ErrorBoundary.tsx
│   ├── FilterChip.tsx
│   ├── GameCard.tsx
│   ├── PrimaryButton.tsx
│   ├── ScoreBoard.tsx
│   └── Timer.tsx
├── constants/
│   └── colors.ts            # Design tokens (cream bg, coral, teal)
├── context/
│   └── GameContext.tsx      # Game session state + actions
├── data/
│   ├── alphabetCategories.ts  # 50 categories for Alphabet Showdown
│   ├── categoryDash.ts        # 40 rounds for Category Dash
│   ├── forbiddenWord.ts       # 50 cards for Forbidden Word
│   ├── gameColors.ts          # Per-game color palette
│   ├── games.ts               # Game metadata + pack previews
│   └── whatAmI.ts             # 50 mystery items for What Am I?
├── hooks/
│   └── useColors.ts
└── utils/
    ├── gameEngine.ts          # Session creation, state transitions, host lines
    └── storage.ts             # AsyncStorage helpers (recent games, player names)
```

## The 4 Games

| Game | ID | Engine |
|------|-----|--------|
| Alphabet Showdown | `alphabet-showdown` | Letter + category, tap to score any player |
| What Am I? | `what-am-i` | 5 clues revealed one by one, scoring decreases |
| Category Dash | `category-dash` | Letter + 5 categories, race format |
| Forbidden Word | `forbidden-word` | Target word + 5 forbidden words, reader-based |

## Design Tokens

- Background: `#FFF8F0` (warm cream)
- Primary: `#FF6B35` (coral)
- Secondary: `#4ECDC4` (teal)
- Per-game colors: alphabet=coral, whatAmI=teal, categoryDash=amber, forbiddenWord=purple

## Navigation Flow

Home (`/`) → Games picker (`/games`) → Setup (`/setup?gameId=&quick=`) → Play (`/play`) → End (`/end`)

## Workflow

- **Dev**: `artifacts/mobile: expo` workflow via `pnpm --filter @workspace/mobile run dev`
- Access via `$REPLIT_EXPO_DEV_DOMAIN`
