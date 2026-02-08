# Photography Equipment Marketplace - Backend

Express.js + TypeScript + Prisma + PostgreSQL

## Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Cloudinary account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: A strong secret key for JWT signing
- `CLOUDINARY_*`: Your Cloudinary API credentials
- `FRONTEND_URL`: URL of your Next.js frontend (default: http://localhost:3000)

### Database Setup

1. Run Prisma migrations to create tables:
```bash
npm run db:migrate
```

2. (Optional) Seed database with test data:
```bash
npm run db:seed
```

3. (Optional) Open Prisma Studio to view/edit data:
```bash
npm run db:studio
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Building

Build TypeScript to JavaScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── config/
│   │   └── env.ts           # Environment configuration
│   ├── middleware/
│   │   └── auth.ts          # JWT authentication middleware
│   ├── routes/              # API routes (to be created)
│   ├── controllers/         # Business logic (to be created)
│   ├── services/            # External API integrations (to be created)
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example             # Environment variables template
└── package.json
```

## API Routes (TODO)

- `/api/listings` - Listing CRUD operations
- `/api/messages` - Messaging system
- `/api/users` - User profile management
- `/health` - Health check endpoint

## Technologies

- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: ORM for database
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **Cloudinary**: Image storage
- **bcrypt**: Password hashing
- **Zod**: Schema validation

## Environment Variables

See `.env.example` for all required environment variables.

## Notes

- The backend validates JWT tokens from NextAuth.js frontend
- CORS is configured to accept requests from the frontend URL
- Sensitive data should never be logged or exposed in responses
