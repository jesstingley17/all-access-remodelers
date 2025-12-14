# All Access Remodelers

A professional business website for All Access Remodelers, offering construction, property management, and cleaning services. Built with React, TypeScript, Express, and Vite.

## Features

- Multi-page marketing website
- Service information pages
- Project gallery
- Quote estimation tool
- AI-powered chatbot assistant
- Privacy policy and terms & conditions
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite
- **AI**: OpenAI API integration

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL database (optional for local dev)
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd All-Access-Remodelers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations (if using PostgreSQL):
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Build for Production

```bash
npm run build
npm start
```

## Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to preview:
```bash
vercel
```

4. Deploy to production:
```bash
vercel --prod
```

### Environment Variables

Configure these environment variables in your Vercel project settings:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `SESSION_SECRET` - Random string for session encryption (generate with `openssl rand -base64 32`)
- `NODE_ENV` - Set to `production`

### Database Setup

For production, you'll need a PostgreSQL database. Recommended providers:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)

After connecting your database, run migrations:
```bash
npm run db:push
```

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database interface
│   └── openai.ts        # OpenAI integration
├── shared/              # Shared code between client/server
│   └── schema.ts        # Database schema
└── dist/                # Production build output
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## License

MIT
