# MyFitt (Fittwiz)

MyFitt is a comprehensive fitness tracking application designed to help users achieve their health goals through personalized workout routines, nutrition tracking, and AI-powered coaching.

![MyFitt Logo](public/pwa-192x192.png)

## Features

- **Personalized Workouts**: Create and manage custom workout routines.
- **AI Coach**: Get AI-generated workout plans and advice tailored to your goals.
- **Nutrition Tracking**: Log meals, track macros, and monitor your daily intake.
- **Progress Statistics**: Visualize your progress with detailed charts and stats.
- **Social Sharing**: Share your workout achievements with friends.
- **Pro Membership**: Unlock advanced features like unlimited AI generations and deep analytics.
- **PWA Support**: Install the app on your device for a native-like experience.

## Tech Stack

### Frontend

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: React Context / Hooks
- **Routing**: React Router v7
- **UI Components**:
  - Lucide React (Icons)
  - @dnd-kit (Drag and Drop)
  - clsx / tailwind-merge (Utility classes)
- **PWA**: vite-plugin-pwa

### Backend / Services

- **Firebase**: Authentication, Firestore Database, Cloud Functions
- **AI Integration**: Custom AI functions (located in `functions/`)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (Package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd MyFitt
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   Also install dependencies for Firebase Functions if you plan to work on the backend:

   ```bash
   cd functions
   pnpm install
   cd ..
   ```

### Environment Variables

#### Frontend (.env)

Create a `.env` file in the root directory.

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_APPCHECK_KEY=your_recaptcha_site_key  # Optional, for App Check
```

#### Backend (functions/.env)

Create a `.env` file in the `functions` directory.

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
GEMINI_API_KEY=your_gemini_api_key
PRO_AI_MONTHLY_QUOTA=100
FREE_AI_WEEKLY_QUOTA=5
FITMANUAL_APP_ID=fitmanual-default
WEB_ORIGIN=http://localhost:5173
```

### Running the App

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

To build the application for production:

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

### Linting & Type Checking

Run ESLint:

```bash
pnpm lint
```

Run TypeScript type checking:

```bash
pnpm typecheck
```
