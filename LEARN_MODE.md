# 🧠 Learn Mode - Adaptive Learning Algorithm

Learn Mode is an intelligent, Quizlet-inspired study mode that uses adaptive algorithms to help users master flashcards efficiently through spaced repetition and dynamic prioritization.

## Overview

Learn Mode differs from standard flashcard review by:
- **Requiring typed answers** instead of passive flipping
- **Tracking mastery** for each card individually
- **Adapting dynamically** based on user performance
- **Using spaced repetition** to optimize retention
- **Persisting progress** so users can resume sessions

## Algorithm Details

### Card State Tracking

Each flashcard maintains the following state during a learn session:

```typescript
{
  correctStreak: number;      // Consecutive correct answers
  totalCorrect: number;       // Total correct attempts
  totalIncorrect: number;     // Total incorrect attempts
  mastered: boolean;          // Has reached mastery goal
  lastSeen: Date | null;      // Last time shown
  priority: number;           // Selection weight (higher = more likely)
}
```

### Adaptive Scheduling

The algorithm uses **weighted random selection** to choose the next card:

1. **Priority Calculation**
   - Base priority: `100`
   - **+50** for each incorrect answer (emphasize weak cards)
   - **-20** for each consecutive correct answer (de-emphasize strong cards)
   - **-10** for each total correct (reduce frequency)
   - **×0.3** if seen within last 2 minutes (short-term spacing)

2. **Card Selection**
   - Only unmastered cards are eligible
   - Cards with higher priority have higher selection probability
   - Weighted random ensures variety while prioritizing weak cards

3. **Mastery Rules**
   - Default mastery goal: **2 consecutive correct answers**
   - Incorrect answer **resets the streak** to 0
   - Session completes when **all cards are mastered**

### Answer Checking

Answers are normalized before comparison:
- Convert to lowercase
- Trim whitespace
- Remove punctuation
- This allows flexible matching (e.g., "photosynthesis" = "Photosynthesis!")

## User Flow

### 1. Starting Learn Mode

From a study set page, click **"🧠 Learn Mode"**:

```
Study Set Page
  ↓
Click "Learn Mode"
  ↓
Create/Resume Learn Session
  ↓
Initialize progress for all cards
```

### 2. Answering Cards

```
[Show Question]
  ↓
User types answer
  ↓
Submit → Check correctness
  ↓
[Show Feedback]
  ├─ ✅ Correct → Update streak, reduce priority
  └─ ❌ Wrong → Reset streak, increase priority
  ↓
Continue → Select next card (weighted random)
```

### 3. Progress Tracking

Real-time progress bar shows:
- **X of Y mastered** (e.g., "5 of 20 mastered")
- **Percentage completion** (e.g., "25%")

Individual card indicators:
- **🟡 Needs practice** - Has incorrect attempts
- **🟢 Streak: X** - Current consecutive correct count

### 4. Session Completion

When all cards are mastered:
```
[Completion Screen]
  - Total cards mastered
  - Overall accuracy percentage
  - Total attempts
  - Motivational corgi message
  
Options:
  - 🔄 Learn Again (restart with new session)
  - 📚 Back to Set
```

## Database Schema

### LearnSession
Tracks an individual learning session for a study set:

```prisma
model LearnSession {
  id            String          @id @default(cuid())
  userId        String
  studySetId    String
  isCompleted   Boolean         @default(false)
  masteryGoal   Int             @default(2)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  learnProgress LearnProgress[]
}
```

### LearnProgress
Tracks progress for each flashcard in a session:

```prisma
model LearnProgress {
  id              String       @id @default(cuid())
  sessionId       String
  flashcardId     String
  correctStreak   Int          @default(0)
  totalCorrect    Int          @default(0)
  totalIncorrect  Int          @default(0)
  mastered        Boolean      @default(false)
  lastSeen        DateTime?
  priority        Int          @default(100)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([sessionId, flashcardId])
}
```

## API Endpoints

### POST `/api/learn-sessions`
Creates or resumes a learn session for a study set.

**Request:**
```json
{
  "studySetId": "cuid",
  "masteryGoal": 2
}
```

**Response:**
```json
{
  "id": "session_cuid",
  "userId": "user_cuid",
  "studySetId": "set_cuid",
  "isCompleted": false,
  "masteryGoal": 2,
  "learnProgress": [...]
}
```

### PATCH `/api/learn-sessions/[id]`
Updates progress for a card or marks session complete.

**Request (update progress):**
```json
{
  "progressId": "progress_cuid",
  "isCorrect": true
}
```

**Request (mark complete):**
```json
{
  "isCompleted": true
}
```

### DELETE `/api/learn-sessions/[id]`
Deletes a learn session (used for restart).

## Key Features

### ✅ Implemented

1. **Adaptive Card Selection**
   - Weighted random based on performance
   - Prioritizes weak cards
   - Short-term spacing (2-minute cooldown)

2. **Mastery Tracking**
   - Configurable mastery goal (default: 2)
   - Streak-based progression
   - Individual card state

3. **Typed Answer Input**
   - Text input field
   - Normalized answer checking
   - Immediate feedback

4. **Progress Persistence**
   - Resume incomplete sessions
   - Database-backed state
   - Cross-session continuity

5. **Visual Feedback**
   - Real-time progress bar
   - Correct/incorrect indicators
   - Streak badges
   - Completion celebration

### 🚀 Future Enhancements

1. **Multiple-Choice Mode**
   - Generate distractors from other cards
   - Toggle between typed/MC

2. **Confidence Ratings**
   - "I'm sure" vs "I kind of know this"
   - Adjust priority based on confidence

3. **Advanced Spaced Repetition**
   - Leitner system implementation
   - SM-2 algorithm integration
   - Cross-session scheduling

4. **Analytics Dashboard**
   - Historical performance graphs
   - Difficult cards report
   - Study time tracking

5. **Smart Hints**
   - First letter hints
   - Progressive reveal
   - Related cards suggestions

## Usage Tips

1. **Type exact answers** - The algorithm normalizes punctuation, but be precise with spelling
2. **Don't guess randomly** - Incorrect answers increase priority significantly
3. **Complete sessions** - Mastery resets if you restart
4. **Use Learn Mode first** - Master new cards before using standard review
5. **Combine with Study Mode** - Use Learn for mastery, Study for maintenance

## Technical Implementation

### Core Algorithm Class

```typescript
class LearnModeAlgorithm {
  // Select next card using weighted random
  selectNextCard(cards: LearnCard[]): LearnCard | null

  // Calculate selection weight based on progress
  calculateWeight(progress: CardProgress): number

  // Update progress after user answers
  updateProgress(progress: CardProgress, isCorrect: boolean): CardProgress

  // Calculate overall session progress
  calculateProgress(cards: LearnCard[]): ProgressStats

  // Check if session is complete
  isSessionComplete(cards: LearnCard[]): boolean

  // Normalize and compare answers
  checkAnswer(userAnswer: string, correctAnswer: string): boolean
}
```

### React Components

1. **LearnModePage** - Main page, manages session state
2. **LearnModeCard** - Individual card with input and feedback
3. **LearnComplete** - Completion screen with stats

### State Management

- Session state stored in database
- Client-side algorithm handles card selection
- Optimistic UI updates with server sync

## Performance Considerations

- **Weighted selection** is O(n) where n = unmastered cards
- **Progress updates** are single database writes
- **Session queries** include related data (single round-trip)
- **Client-side algorithm** reduces server load

## Accessibility

- Keyboard navigation (Tab, Enter)
- Focus management on card transitions
- High contrast feedback colors
- Screen reader friendly labels

---

**Learn Mode** represents a significant leap in PupLearn's educational value, transforming passive flashcard review into an active, adaptive learning experience that optimizes for both speed and retention. 🐶🧠

