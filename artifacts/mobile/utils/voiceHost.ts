import * as Speech from 'expo-speech';

export type VoiceEvent =
  | 'gameStart'
  | 'roundStart'
  | 'turnStart'
  | 'clueReveal'
  | 'correct'
  | 'incorrect'
  | 'skip'
  | 'next'
  | 'pressure'
  | 'roundEnd'
  | 'gameEnd'
  | 'soloStart'
  | 'answerReveal'
  | 'streak'
  | 'freshPrompt'
  | 'resurface'
  | 'repeat'
  | 'reveal';

export type GameKey =
  | 'alphabetShowdown'
  | 'whatAmI'
  | 'categoryDash'
  | 'forbiddenWord'
  | 'wouldYouRather'
  | 'rapidFire'
  | 'guessTheSound'
  | 'thisOrThat'
  | 'riddles'
  | 'global';

type VoiceContext = {
  playerName?: string;
  teamName?: string;
  round?: number;
  totalRounds?: number;
  clueNumber?: number;
  totalClues?: number;
  points?: number;
  category?: string;
  letter?: string;
  answer?: string;
  gameName?: string;
  streak?: number;
  score?: number;
};

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const fillTemplate = (line: string, ctx: VoiceContext = {}) =>
  line
    .replaceAll('{playerName}', ctx.playerName ?? 'Player')
    .replaceAll('{teamName}', ctx.teamName ?? 'Team')
    .replaceAll('{round}', String(ctx.round ?? 1))
    .replaceAll('{totalRounds}', String(ctx.totalRounds ?? ''))
    .replaceAll('{clueNumber}', String(ctx.clueNumber ?? 1))
    .replaceAll('{totalClues}', String(ctx.totalClues ?? 5))
    .replaceAll('{points}', String(ctx.points ?? ''))
    .replaceAll('{category}', ctx.category ?? 'your category')
    .replaceAll('{letter}', ctx.letter ?? 'your letter')
    .replaceAll('{answer}', ctx.answer ?? 'the answer')
    .replaceAll('{gameName}', ctx.gameName ?? 'the game')
    .replaceAll('{streak}', String(ctx.streak ?? 0))
    .replaceAll('{score}', String(ctx.score ?? 0));

const LINES: Record<GameKey, Partial<Record<VoiceEvent, string[]>>> = {
  global: {
    freshPrompt: [
      'Fresh one. Let us see how you go.',
      'New one. Never been asked before.',
      'This one is fresh. Go for it.',
    ],
    resurface: [
      "You have not seen this one in a while.",
      "It has been a while. Welcome back.",
      "This one is making a return.",
    ],
    repeat: [
      "Alright, this one is making a comeback.",
      "A classic. Let's go again.",
      "Back by popular demand.",
    ],
    correct: [
      'Nice. Suspiciously fast.',
      'That was either skill or luck.',
      'Point awarded. Glory temporary.',
      'Correct. Very respectable.',
      'Strong work.',
    ],
    incorrect: [
      'Not quite. Have another think.',
      'Close, maybe. Try again.',
      'Interesting guess. Not the answer though.',
      'Nope. But we respect the confidence.',
    ],
    skip: [
      'A strategic retreat.',
      "We'll pretend that never happened.",
      'Skipped. Probably for the best.',
      'Moving on before anyone overthinks it.',
    ],
    next: [
      "Still anyone's game.",
      'The plot thickens.',
      'This could go either way.',
      'Alright. Next one.',
    ],
    pressure: [
      'Clock is ticking.',
      "We're thinking. We're thinking.",
      'No rush. But also, yes, rush.',
      'You might want to lock something in soon.',
    ],
    gameEnd: [
      'Game over. Honour mostly intact.',
      'Victory has been claimed.',
      'Family harmony is mostly intact.',
      "Nobody flipped the table, so technically a success.",
    ],
    soloStart: [
      "Solo mode. Just you, the clock, and your brain. Good luck.",
      "Flying solo today. No judgement. Well, a little judgement.",
      "Solo challenge. Let's see what you've got.",
    ],
    streak: [
      "{streak} in a row! Impressive.",
      "That's {streak} consecutive. You're on fire.",
      "{streak} streak! Keep it going.",
    ],
    answerReveal: [
      "The answer was {answer}.",
      "It was {answer}. Of course it was.",
      "And the answer: {answer}.",
    ],
  },

  alphabetShowdown: {
    gameStart: [
      "Alright. Alphabet Showdown is live. I'll give you a category and a letter. Take turns naming something that fits. No repeats. Mild panic is acceptable. Let's go.",
    ],
    soloStart: [
      "Solo Alphabet Showdown. Name something for each letter before the timer. Go.",
      "Just you and the alphabet. Let's see how many you can get.",
    ],
    roundStart: [
      'New round. Category: {category}. Starting letter: {letter}.',
      'Round {round}. Your category is {category}. Your letter is {letter}.',
      'Here we go. {category}. Starting with {letter}.',
    ],
    turnStart: [
      "{playerName}, you're up.",
      '{playerName}, your turn.',
      'Over to you, {playerName}.',
    ],
    correct: [
      'Good one.',
      'That counts. Moving on.',
      'Nice answer.',
      "We'll allow it.",
    ],
    streak: [
      "{streak} in a row! Keep going.",
      "That's {streak} straight. Impressive.",
    ],
    roundEnd: [
      'Round complete. Some strong answers. Some creative interpretations.',
      'That round is done. Honour remains questionable.',
      'Nice work. Next round coming in.',
    ],
  },

  whatAmI: {
    gameStart: [
      "Welcome to What Am I. I'll reveal clues one by one. The earlier you guess it, the more points you get. Let's see who's paying attention.",
    ],
    soloStart: [
      "Solo What Am I. Guess the mystery as early as you can. Points drop with each clue.",
      "Just you and the clues. How sharp are you today?",
    ],
    roundStart: [
      'New mystery. Clue one.',
      'Round {round}. New mystery incoming.',
      'Alright. New one. Stay sharp.',
    ],
    clueReveal: [
      'Clue {clueNumber}.',
      'Here comes clue {clueNumber}.',
      'Clue {clueNumber}. This one might help.',
    ],
    correct: [
      'Correct. That came together nicely.',
      'Yes. Strong work.',
      'That is correct. Very suspiciously clever.',
    ],
    incorrect: [
      'Not quite. Keep thinking.',
      'That was a guess. Not the right one. Try again.',
      'Nope. Another clue might help.',
    ],
    answerReveal: [
      'The answer was {answer}.',
      'It was {answer}. Well played regardless.',
    ],
    skip: [
      'Alright, revealing next clue.',
      'No guess yet. Let us keep going.',
      'Fair enough. Next clue.',
    ],
    roundEnd: [
      'Round done. Next mystery loading.',
      'Mystery solved. Or survived.',
      'That one is finished. Moving on.',
    ],
  },

  categoryDash: {
    gameStart: [
      "Category Dash. I'll give you a letter and a set of categories. Think fast. Say something that fits. Let's begin.",
    ],
    soloStart: [
      "Solo Category Dash. Five categories, one letter. Think fast.",
    ],
    roundStart: [
      'Letter: {letter}. Think fast.',
      'Round {round}. Letter {letter}. Think fast.',
      'New dash. Letter {letter}. No pressure. Except there absolutely is.',
    ],
    pressure: [
      'Keep going.',
      'Time is moving.',
      "Don't let the silence win.",
    ],
    roundEnd: [
      "And stop. That was either impressive or chaotic.",
      "Round complete. Let's score it.",
      "Time's up. Some answers may require legal review.",
    ],
  },

  forbiddenWord: {
    gameStart: [
      "Forbidden Word. One player describes the word. But you cannot say the forbidden words. This will go well. Probably.",
    ],
    soloStart: [
      "Forbidden Word solo practice. Read the word and forbidden list. Think about how you'd describe it.",
    ],
    turnStart: [
      "{playerName}, you're describing. Your word is ready.",
      "{playerName}, you're up. Avoid the forbidden words.",
      "Over to {playerName}. Try not to say the obvious thing.",
    ],
    correct: [
      'Got it. Nice teamwork.',
      'Correct. Very smooth.',
      'Nice. Communication has occurred.',
    ],
    skip: [
      'Skipping. A strategic decision.',
      'Moving on. No shame. Well, maybe a little.',
      'Skipped. That word was clearly cursed.',
    ],
    roundEnd: [
      "Time's up. That was either smooth or slightly stressful.",
      'Round done. Everyone breathe.',
      "That's the round. Words were used. Mostly legal ones.",
    ],
  },

  wouldYouRather: {
    gameStart: [
      "Would You Rather. Two options. No escape. Defend your choice if challenged.",
      "Welcome to Would You Rather. There are no wrong answers. Only questionable ones. Let's begin.",
    ],
    soloStart: [
      "Would You Rather, solo edition. Pick one. Then tell yourself why.",
      "Just you and two impossible choices. Good luck.",
    ],
    roundStart: [
      "Here's one that might cause disagreements.",
      "This one could divide the room.",
      "No wrong answers. Probably.",
      "Think carefully. Or don't. Either works.",
    ],
    correct: [
      "Interesting choice. Defend it if necessary.",
      "Bold. We respect that.",
      "That's a choice. Moving on.",
    ],
    skip: [
      "Can't decide? Fair enough.",
      "A non-answer. Still valid.",
      "Moving to the next dilemma.",
    ],
    roundEnd: [
      "Opinions noted. Relationships tested.",
      "Round done. Nobody has to agree.",
      "That revealed a lot about everyone here.",
    ],
    gameEnd: [
      "And that's Would You Rather. Character revealed.",
      "Game over. You now know too much about each other.",
      "Finished. Family dynamics may never be the same.",
    ],
  },

  rapidFire: {
    gameStart: [
      "Rapid Fire. Name as many as you can before the timer ends. Go fast. Don't think. Just say things.",
      "Let's see how fast you are. Rapid Fire starts now.",
    ],
    soloStart: [
      "Rapid Fire solo. How many can you get? Count them up.",
      "Just you and the clock. Name them fast.",
    ],
    roundStart: [
      "Ready? Three. Two. One. Go.",
      "Here we go. Fast as you can.",
      "Timer starts now. No hesitations.",
    ],
    pressure: [
      "Keep going.",
      "Don't stop.",
      "More. Faster.",
      "Come on, keep them coming.",
    ],
    roundEnd: [
      "And stop. Count them up.",
      "Time. How many did you get?",
      "That's the round. Impressive, probably.",
    ],
    correct: [
      "Nice one.",
      "That counts.",
      "Keep going.",
    ],
    gameEnd: [
      "Rapid Fire complete. Brains officially warmed up.",
      "That's the game. Words were said. Many of them.",
    ],
  },

  guessTheSound: {
    gameStart: [
      "Guess the Sound. I will describe a sound. First one to guess what makes it wins the round.",
      "Listen carefully. What makes this sound?",
    ],
    soloStart: [
      "Guess the Sound, solo mode. Think it through.",
      "Solo sound guessing. How many can you get?",
    ],
    roundStart: [
      "Listen carefully.",
      "What makes this sound?",
      "Here's a sound. What is it?",
      "Identify the source of this sound.",
    ],
    correct: [
      "That's it. Well heard.",
      "Correct. Good ears.",
      "Yes. Exactly right.",
    ],
    incorrect: [
      "Not quite. Think again.",
      "Close, but no. Try once more.",
      "Nope. Listen again.",
    ],
    answerReveal: [
      "The answer was {answer}.",
      "It was {answer}.",
    ],
    skip: [
      "Moving on. The sound remains a mystery.",
      "Next sound coming up.",
    ],
    roundEnd: [
      "Round complete. Moving to the next sound.",
      "Sound identified. Or not. Moving on.",
    ],
    gameEnd: [
      "And that's Guess the Sound. Ears have been tested.",
      "Game complete. Your ears did their best.",
    ],
  },

  thisOrThat: {
    gameStart: [
      "This or That. Two options. No thinking. Just choose. Ready? Go.",
      "This or That. Fast decisions only. Let's see who agrees.",
    ],
    soloStart: [
      "This or That, solo. Tap your choice. Build a streak.",
      "Just you and two options. Quick.",
    ],
    roundStart: [
      "No thinking. Just choose.",
      "Quick.",
      "This or that. Go.",
      "Instant answer only.",
      "No deliberating.",
    ],
    correct: [
      "Chosen.",
      "Noted.",
      "Moving on.",
      "Bold call.",
    ],
    streak: [
      "{streak} fast choices. Keep it up.",
      "On a roll. {streak} in a row.",
    ],
    skip: [
      "Skip accepted. Barely.",
      "Moving on.",
    ],
    roundEnd: [
      "Next one.",
      "Keep going.",
    ],
    gameEnd: [
      "That's This or That. Decisions were made.",
      "Game over. You now have opinions about everything.",
    ],
  },

  riddles: {
    gameStart: [
      "Riddles. I'll read one out. First to answer correctly gets the point. Think before you speak.",
      "Welcome to Riddles. Here's a tricky one to start with.",
    ],
    soloStart: [
      "Solo Riddles. Think it through. Take your time.",
      "Riddles, solo mode. Guess it, skip it, or reveal it.",
    ],
    roundStart: [
      "Here's a tricky one.",
      "Think carefully.",
      "This one requires some thought.",
      "Ready for a riddle?",
      "Here it comes.",
    ],
    correct: [
      "Correct. Nicely done.",
      "That's it. Well reasoned.",
      "Right. Sharp thinking.",
    ],
    incorrect: [
      "Not quite. Think again.",
      "Close, but no. Another guess?",
      "Nope. The answer might surprise you.",
    ],
    answerReveal: [
      "The answer is {answer}.",
      "It was {answer}. Of course.",
    ],
    reveal: [
      "Revealing the answer now.",
      "Here it is.",
    ],
    skip: [
      "Skipped. The riddle wins this round.",
      "Moving on. The mystery lives on.",
    ],
    roundEnd: [
      "Next riddle loading.",
      "Moving to the next one.",
      "Round done. Brain still intact, hopefully.",
    ],
    gameEnd: [
      "Riddles complete. Brain sufficiently exercised.",
      "That's the game. Riddles: 1, Family: also probably 1.",
    ],
  },
};

export function getVoiceLine(gameKey: GameKey, event: VoiceEvent, ctx: VoiceContext = {}): string {
  const gameLines = LINES[gameKey]?.[event];
  const globalLines = LINES.global?.[event];
  const selected =
    gameLines?.length ? randomFrom(gameLines) :
    globalLines?.length ? randomFrom(globalLines) : '';
  return fillTemplate(selected, ctx);
}

export function speakHost(
  gameKey: GameKey,
  event: VoiceEvent,
  ctx: VoiceContext = {},
  opts?: { rate?: number; pitch?: number; autoStop?: boolean },
): void {
  const text = getVoiceLine(gameKey, event, ctx);
  if (!text) return;
  if (opts?.autoStop !== false) Speech.stop();
  Speech.speak(text, { rate: opts?.rate ?? 0.92, pitch: opts?.pitch ?? 1.03 });
}

export function speakText(
  text: string,
  opts?: { rate?: number; pitch?: number; autoStop?: boolean },
): void {
  if (!text) return;
  if (opts?.autoStop !== false) Speech.stop();
  Speech.speak(text, { rate: opts?.rate ?? 0.92, pitch: opts?.pitch ?? 1.03 });
}

export function stopHostVoice(): void {
  Speech.stop();
}

export async function isHostSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export function getVoiceGameKey(gameId: string): GameKey {
  switch (gameId) {
    case 'alphabet-showdown': return 'alphabetShowdown';
    case 'what-am-i': return 'whatAmI';
    case 'category-dash': return 'categoryDash';
    case 'forbidden-word': return 'forbiddenWord';
    case 'would-you-rather': return 'wouldYouRather';
    case 'rapid-fire': return 'rapidFire';
    case 'guess-the-sound': return 'guessTheSound';
    case 'this-or-that': return 'thisOrThat';
    case 'riddles': return 'riddles';
    default: return 'global';
  }
}
