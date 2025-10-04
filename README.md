# 🐕 PupLearn - Flashcard Learning App with User Accounts

A modern flashcard learning application with user authentication, study set organization, and a friendly corgi mascot! Built with Next.js, React, TypeScript, Prisma, and NextAuth.js.

## ✨ Features

### Authentication & User Accounts
- **Secure Sign Up/Login**: Email and password authentication with bcrypt hashing
- **Session Management**: Persistent sessions with NextAuth.js and JWT tokens
- **Protected Routes**: Secure access to user-specific data
- **User Isolation**: Each user can only see their own study sets and flashcards

### Study Sets Organization
- **Create Study Sets**: Organize flashcards by topic (e.g., "Biology Chapter 1", "Spanish Vocabulary")
- **Manage Sets**: Edit titles, descriptions, and delete entire sets
- **Card Count Tracking**: See how many cards are in each set
- **Personal Dashboard**: View all your study sets at a glance

### Flashcard Management
- **CRUD Operations**: Create, read, update, and delete flashcards within each study set
- **Rich Content**: Support for questions/terms and detailed answers
- **Inline Editing**: Edit cards directly from the list view
- **Quick Preview**: Show/hide answers without entering study mode
- **Bulk Import**: Paste text in multiple formats to create many flashcards at once
  - Supports Q:/A:, pipe (|), dash (-), colon (:), and numbered list formats
  - Preview and edit before importing
  - Intelligent format detection

### Study Mode
- **Interactive Cards**: Flip animations to reveal answers
- **Right/Wrong Tracking**: Mark each card as correct or incorrect
- **Keyboard Shortcuts**: 
  - `←` / `→` to navigate between cards
  - `Space` or `Enter` to flip cards
  - `1` for "Got it Right", `2` for "Got it Wrong"
- **Progress Tracking**: Visual progress bar and accuracy counter
- **Session Results**: Complete summary with accuracy percentage
- **Wrong Card Review**: Instantly restudy only the cards you got wrong
- **Corgi Encouragement**: Performance-based motivational messages
- **Session History**: All study sessions saved to database for analytics

### UI/UX Excellence
- **Blue & White Theme**: Clean, professional design with playful accents
- **Responsive Design**: Works beautifully on desktop and mobile
- **Smooth Animations**: Card flips, transitions, and hover effects
- **Corgi Mascot**: Custom SVG illustration throughout the app
- **Empty States**: Helpful guidance when getting started

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Initialize the database:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

For production, update `.env` with:
- PostgreSQL database URL
- Strong NEXTAUTH_SECRET (generate with: `openssl rand -base64 32`)
- Production NEXTAUTH_URL

## 📁 Project Structure

```
puplearn/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── signup/route.ts         # User registration
│   │   ├── study-sets/    # Study set CRUD
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   └── flashcards/    # Flashcard CRUD
│   ├── dashboard/         # User dashboard
│   ├── study-sets/        # Study set pages
│   │   └── [id]/
│   │       ├── page.tsx   # Flashcard management
│   │       └── study/page.tsx  # Study mode
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AuthForm.tsx       # Login/signup form
│   ├── CorgiMascot.tsx    # SVG mascot
│   ├── CorgiEncouragement.tsx  # Motivational messages
│   ├── CreateStudySetForm.tsx  # Modal form
│   ├── FlashcardForm.tsx  # Add/edit flashcard
│   ├── FlashcardItem.tsx  # Card display
│   ├── FlashcardList.tsx  # List view
│   ├── Header.tsx         # Navigation header
│   ├── Providers.tsx      # Auth provider wrapper
│   ├── StudyCard.tsx      # Study mode card
│   └── StudySetCard.tsx   # Dashboard card
├── lib/                   # Utilities
│   ├── auth.ts           # Password hashing
│   ├── prisma.ts         # Prisma client
│   └── types.ts          # TypeScript types
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── types/                # Type definitions
│   └── next-auth.d.ts    # NextAuth types
└── middleware.ts         # Route protection

```

## 🗄️ Database Schema

```prisma
model User {
  id           String      @id @default(cuid())
  name         String?
  email        String      @unique
  passwordHash String
  studySets    StudySet[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model StudySet {
  id          String      @id @default(cuid())
  title       String
  description String?
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  flashcards  Flashcard[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Flashcard {
  id         String    @id @default(cuid())
  question   String
  answer     String
  studySetId String
  studySet   StudySet  @relation(fields: [studySetId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

## 🎨 Color Theme

- Primary Blue: `#3b82f6` (Tailwind blue-500)
- Light Blue: `#dbeafe` (Tailwind blue-100)
- White: `#ffffff`
- Consistent gradients and accents throughout

## 🐾 Corgi Mascot

The friendly corgi appears throughout the app:
- Header logo and branding
- Dashboard welcome
- Study mode companion
- Encouraging popup messages after flipping cards
- Empty state illustrations

## 🔧 Technologies Used

- **Next.js 14+** - Full-stack React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety throughout
- **NextAuth.js** - Authentication with JWT sessions
- **Prisma ORM** - Type-safe database access
- **SQLite** - Local development database (PostgreSQL-ready)
- **bcryptjs** - Secure password hashing
- **Zod** - Runtime validation
- **TailwindCSS** - Utility-first styling

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based session tokens
- Protected API routes (server-side auth checks)
- User isolation (can't access other users' data)
- Input validation with Zod
- CSRF protection via NextAuth
- Secure HTTP-only cookies

## 📝 Usage Guide

### Creating an Account
1. Click "Sign Up" from the landing page
2. Enter your name, email, and password (min 6 characters)
3. You'll be automatically logged in and redirected to your dashboard

### Creating Study Sets
1. From the dashboard, click "+ New Study Set"
2. Enter a title and optional description
3. Click "Create Study Set"

### Adding Flashcards
1. Click "Manage Cards" on a study set
2. Fill in the question and answer fields
3. Click "Add Card"
4. Repeat to add more cards

### Bulk Import Flashcards
1. Click "Bulk Import" button on the study set page
2. Paste your text in any of these formats:
   ```
   Q: What is the capital of France?
   A: Paris
   
   What is 2+2? | 4
   
   Who wrote Hamlet? - Shakespeare
   
   1. Largest planet? - Jupiter
   ```
3. Click "Parse Flashcards" to detect format
4. Review and edit the preview table
5. Click "Create Flashcards" to import all at once

### Studying
1. Click "Study" on a study set with cards
2. Click cards or press Space/Enter to flip
3. Use arrow keys or buttons to navigate
4. Watch your progress bar fill up!

### Managing Content
- **Edit**: Click "Edit" on any study set or flashcard
- **Delete**: Click "Delete" with confirmation
- **Show/Hide**: Preview answers without entering study mode

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy!

### Database Migration for Production
```bash
# Update .env with PostgreSQL URL
DATABASE_URL="postgresql://user:password@host:port/database"

# Run migrations
npx prisma migrate deploy
```

## 🎯 Future Enhancements

- Google OAuth integration
- Shareable study sets (public/private)
- Study set categories and tags
- Search functionality
- Spaced repetition algorithm
- Progress analytics and stats
- Export/import as JSON
- Deck collaboration features
- Mobile app versions
- Dark mode theme

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

Built with modern web technologies, secure authentication practices, and a lot of ❤️ for learning!

---

**Happy studying with PupLearn! 🐕📚**
