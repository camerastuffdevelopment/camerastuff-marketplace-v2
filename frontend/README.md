# Photography Equipment Marketplace - Frontend

Next.js 14 + React 18 + TypeScript + Tailwind CSS

## Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running (http://localhost:5000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
- `NEXT_PUBLIC_API_URL`: URL of your backend API (default: http://localhost:5000)
- `NEXTAUTH_URL`: URL of your Next.js app (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: A random secret for NextAuth (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY`: Your Resend email service API key

## Development

Start the development server:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with NextAuth provider
│   │   ├── page.tsx         # Homepage
│   │   ├── auth/            # Authentication pages (to be created)
│   │   ├── listings/        # Listing pages (to be created)
│   │   └── profile/         # User profile pages (to be created)
│   ├── components/          # Reusable components (to be created)
│   ├── lib/
│   │   └── api.ts          # API client for backend communication
│   ├── hooks/              # Custom React hooks (to be created)
│   ├── styles/
│   │   └── globals.css     # Global Tailwind styles
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── public/                 # Static assets
├── .env.example           # Environment variables template
└── package.json
```

## Key Technologies

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **NextAuth.js**: Authentication framework
- **Axios**: HTTP client for API calls
- **Zod**: Schema validation
- **Zustand**: State management (optional)
- **Resend**: Email service integration

## Features (In Development)

- User authentication (signup/login)
- Browse and search listings
- Create and manage listings
- Messaging system
- User profiles and ratings
- Payment integration (Tradesafe)

## Environment Variables

### Required
- `NEXTAUTH_SECRET`: Secret key for NextAuth (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your app URL

### Optional
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000)
- `RESEND_API_KEY`: Email service key

## NextAuth Configuration

NextAuth.js pages will be created in `src/app/api/auth/` directory. Configuration includes:
- Email & Password authentication
- NextAuth database provider for user sessions
- Custom callbacks for role-based access

## Notes

- The frontend connects to the backend API for data
- JWT tokens are managed by NextAuth.js
- Cloudinary images are displayed directly from URLs stored in database
- CORS is handled by backend configuration
