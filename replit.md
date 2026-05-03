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
│   ├── games.tsx            # Game picker with filters/sort (9 games)
│   ├── setup.tsx            # Game setup (players, options)
│   ├── play.tsx             # Active game screen (all 9 game UIs, ~1800 lines)
│   ├── end.tsx              # End-game summary + scores
│   └── packs.tsx            # Future packs teaser
├── components/
│   ├── AnimatedPressable.tsx
│   ├── ErrorBoundary.tsx
│   ├── FilterChip.tsx
│   ├── GameCard.tsx
│   ├── HostMessageBanner.tsx
│   ├── PrimaryButton.tsx
│   ├── ScoreBoard.tsx
│   └── Timer.tsx
├── constants/
│   └── colors.ts            # Design tokens + per-game color tokens
├── context/
│   └── GameContext.tsx      # Game session state + actions (12 actions)
├── data/
│   ├── alphabetCategories.ts  # 50 categories for Alphabet Showdown
│   ├── categoryDash.ts        # 40 rounds for Category Dash
│   ├── contentRelease.ts      # Weekly content release schedule
│   ├── forbiddenWord.ts       # 50 cards for Forbidden Word
│   ├── gameColors.ts          # Per-game color palette (9 keys)
│   ├── games.ts               # Game metadata for all 9 games + pack previews
│   ├── guessTheSound.ts       # 20 sound items for Guess the Sound
│   ├── rapidFire.ts           # 25 prompts for Rapid Fire
│   ├── riddles.ts             # 25 riddles for Riddles
│   ├── thisOrThat.ts          # 30 cards for This or That
│   ├── whatAmI.ts             # 50 mystery items for What Am I?
│   └── wouldYouRather.ts      # 30 cards (3 modes) for Would You Rather
├── hooks/
│   └── useColors.ts
└── utils/
    ├── aiPromptEngine.ts      # AI prompt generation layer (mock + stats)
    ├── contentMemory.ts       # Seen-prompt tracking (AsyncStorage)
    ├── contentRelease.ts      # Weekly new content detection
    ├── freshPrompt.ts         # Smart freshness-weighted prompt selection
    ├── gameEngine.ts          # Session creation, state for all 9 games, transitions
    ├── promptDeduper.ts       # Deduplication utilities
    ├── promptSafety.ts        # Content safety checks
    ├── promptVariation.ts     # Variation engine (decorators, template generation)
    ├── progression.ts         # Family stats + XP
    ├── storage.ts             # AsyncStorage helpers (recent games, player names)
    └── voiceHost.ts           # TTS voice host with per-game lines (9 game keys)
```

## The 9 Games

| Game | ID | Energy | Solo | Color |
|------|----|--------|------|-------|
| Alphabet Showdown | `alphabet-showdown` | Medium | ✅ | Coral |
| What Am I? | `what-am-i` | Calm | ✅ | Teal |
| Category Dash | `category-dash` | Chaotic | ✅ | Lavender |
| Forbidden Word | `forbidden-word` | Chaotic | ❌ | Amber |
| Would You Rather | `would-you-rather` | Calm | ✅ | Rose |
| Rapid Fire | `rapid-fire` | Chaotic | ✅ | Red |
| Guess the Sound | `guess-the-sound` | Calm | ✅ | Emerald |
| This or That | `this-or-that` | Medium | ✅ | Blue |
| Riddles | `riddles` | Calm | ✅ | Purple |

## Game Engine State (gameEngine.ts)

Each game has its own typed state interface on `GameSession`:
- `alphabetState`, `whatAmIState`, `categoryDashState`, `forbiddenWordState`
- `wouldYouRatherState`, `rapidFireState`, `guessSoundState`, `thisOrThatState`, `riddleState`

## Freshness Engine

- `contentMemory.ts` — `recordPromptSeen()`, `getSeenMap()` persisted to AsyncStorage
- `freshPrompt.ts` — `selectFreshPrompt()` prioritises unseen → oldest seen → resurface after 7d
- `promptVariation.ts` — decorates prompts with qualifiers, twists, inversions
- `contentRelease.ts` — weekly content drop schedule, `getNewThisWeekCount()`
- Freshness badge + voice lines on every round change in play.tsx

## GameContext Actions

`startGame`, `addPlayerScore`, `advanceRound`, `advancePlayer`, `newLetter`, `newCategory`,
`revealClue`, `finishGame`, `resetGame`, `bumpStreak`, `breakStreak`,
`selectWYROption`, `bumpTotStreak`, `addRapidFireCount`

## Design Tokens

- Background: `#FFF8F0` (warm cream)
- Primary: `#FF6B35` (coral)
- Secondary: `#4ECDC4` (teal)
- Per-game: alphabet=coral, whatAmI=teal, categoryDash=lavender, forbiddenWord=amber,
  wouldYouRather=rose, rapidFire=red, guessTheSound=emerald, thisOrThat=blue, riddles=purple

## Navigation Flow

Home (`/`) → Games picker (`/games`) → Setup (`/setup?gameId=&quick=`) → Play (`/play`) → End (`/end`)

## Workflow

- **Dev**: `artifacts/mobile: expo` workflow via `pnpm --filter @workspace/mobile run dev`
- Access via `$REPLIT_EXPO_DEV_DOMAIN`

## Total Local Prompts

~421 across all 9 games:
- Alphabet Showdown: 50 categories
- What Am I?: 50 items
- Category Dash: 40 rounds
- Forbidden Word: 50 cards
- Would You Rather: 30 cards
- Rapid Fire: 25 prompts
- Guess the Sound: 20 items
- This or That: 30 cards
- Riddles: 25 riddles
