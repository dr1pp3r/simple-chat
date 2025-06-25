# Simple Chat

This is a simple chatbot application built using "everyone's" favorite current stack. It currently uses OpenAI models and comes equipped with a Rock Paper Scissors (Roboflow) and Web Search (Exa) tool.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **AI**: Vercel AI SDK with OpenAI integration
- **Authentication**: Better Auth with anonymous and email/password support
- **UI**: Tailwind CSS v4 and shadcn/ui
- **Search**: Exa API for web search functionality
- **Camera**: WebRTC API for Rock Paper Scissors gesture capture

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 10.12.1+
- Docker (for Supabase local development)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rf-docs-chat
pnpm install
```

### 2. Local Environment Setup

For speed purposes, the project currently uses a local Supabase instance for development. However, this can likely be replaced with any local Postgres instance. See [this guide](https://supabase.com/docs/guides/local-development/overview) to setup before proceeding.

Create a `.env` file in the root directory for database migrations:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

In the `apps/web` Next project, create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Exa Search API
EXA_API_KEY="your-exa-api-key"

# Roboflow (for gesture recognition)
ROBOFLOW_API_KEY="your-roboflow-api-key"
```

### 3. Start Supabase Local Development

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Start Supabase services
supabase start
```

This will start:
- PostgreSQL database on `localhost:54322`
- Supabase Studio on `localhost:54323`
- API server on `localhost:54321`

### 4. Database Setup

Generate and run migrations:

```bash
# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 📂 Project Structure

```
rf-docs-chat/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/           # App router pages
│       │   ├── components/    # React components
│       │   └── lib/          # Utilities and configurations
│       └── package.json
├── packages/
│   └── db/                    # Database package
│       ├── schemas/          # Drizzle schemas
│       └── index.ts
├── drizzle/                   # Database migrations
├── supabase/                  # Supabase configuration
└── scripts/                   # Utility scripts
```

## 🗄️ Database Schema

The application uses the following main tables:

- **`users`**: User authentication and profile data
- **`chats`**: Chat session metadata
- **`chat_messages`**: Individual chat messages with AI responses
- **`user_message_counts`**: Usage tracking and basic rate limiting

## 🧪 Development

### Database Changes

1. Modify schemas in `packages/db/schemas/`
2. Generate migration: `pnpm db:generate`
3. Run migration: `pnpm db:migrate`

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure Supabase is running: `supabase status`
- Check DATABASE_URL in `.env`

**Camera Not Working**
- Ensure HTTPS in production (camera requires secure context)
- Check browser permissions for camera access

**API Rate Limits**
- Check your OpenAI and Exa API usage
- Implement appropriate rate limiting for production
