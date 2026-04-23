# Smart Timetable Assistant

A modern web application that intelligently manages your schedule by integrating with Google Calendar and Google Tasks. Powered by AI, it helps you detect conflicts, find free slots, generate study plans, and get personalized reminders.

## Features

### 🗓️ Calendar Integration
- Sync with Google Calendar to view your events
- Real-time calendar data fetching
- Visual calendar view with FullCalendar

### ⚠️ Conflict Detection
- Automatically detects overlapping events
- Highlights conflicting events in red on the calendar
- Provides detailed conflict information

### 🕒 Free Slots Finder
- Identifies available time slots in your schedule
- Shows gaps of 1 hour or more between events
- Helps you plan new activities

### 📋 Task Management
- Integrates with Google Tasks
- Displays pending tasks
- Syncs with your calendar for better planning

### 📊 Analytics Dashboard
- Weekly and monthly event statistics
- Busiest days and hours analysis
- Event duration tracking
- Visual insights into your schedule patterns

### 🤖 AI-Powered Features
- **Smart Chat Assistant**: Ask questions about your schedule using natural language
- **Study Plan Generator**: Creates personalized study schedules based on available free time
- **Intelligent Reminders**: AI-generated motivational reminders for upcoming events

### 🔐 Secure Authentication
- Google OAuth 2.0 integration
- Secure access to Calendar and Tasks APIs
- Session management with NextAuth

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Calendar**: FullCalendar (React)
- **AI**: Groq API (Llama 3.3 model)
- **Authentication**: NextAuth.js with Google Provider
- **APIs**: Google Calendar API, Google Tasks API

## Prerequisites

- Node.js 18+
- Google Cloud Console account (for API keys)
- Groq API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-timetable-assistant/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI API
GROQ_API_KEY=your_groq_api_key
```

4. Configure Google Cloud Console:
- Create a new project or select existing one
- Enable Google Calendar API and Google Tasks API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs (for local development: `http://localhost:3000/api/auth/callback/google`)

## Getting Started

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Sign in with your Google account

4. Grant permissions for Calendar and Tasks access

5. Start exploring your smart timetable!

## Usage

### Basic Navigation
- **Calendar Tab**: View your events and conflicts
- **Conflicts Tab**: See detailed conflict information
- **Free Slots Tab**: Find available time slots
- **Tasks Tab**: View your Google Tasks
- **Analytics Tab**: Get insights about your schedule
- **Study Tab**: Generate AI-powered study plans

### AI Chat
Ask the assistant questions like:
- "What's my schedule for tomorrow?"
- "Do I have any conflicts this week?"
- "When is my next meeting?"

### Study Planning
1. Enter the subject you want to study
2. Specify the number of hours needed
3. The AI will create a personalized study plan using your free slots

### Reminders
Click "Get Reminder" to receive AI-generated motivational messages about your upcoming events.

## API Endpoints

- `GET /api/calendar` - Fetch calendar events
- `GET /api/conflicts` - Detect event conflicts
- `GET /api/freeslots` - Find free time slots
- `GET /api/tasks` - Fetch Google Tasks
- `GET /api/analytics` - Get schedule analytics
- `POST /api/chat` - AI chat with schedule context
- `POST /api/studyplan` - Generate study plans
- `POST /api/notify` - Get AI reminders

## Project Structure

```
frontend/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── calendar/       # Calendar integration
│   │   ├── conflicts/      # Conflict detection
│   │   ├── freeslots/      # Free slots finder
│   │   ├── tasks/          # Tasks integration
│   │   ├── analytics/      # Analytics
│   │   ├── chat/           # AI chat
│   │   ├── studyplan/      # Study planning
│   │   └── notify/         # Reminders
│   ├── components/         # React components
│   │   └── FullCalendarView.tsx
│   ├── types/              # TypeScript types
│   └── globals.css         # Global styles
├── public/                 # Static assets
└── package.json            # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
