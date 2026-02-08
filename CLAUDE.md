# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Photography Equipment Marketplace** - A South African P2P marketplace for buying and selling used photography equipment (cameras, lenses, lighting, etc.). Co-branded by CameraStuff, with planned Tradesafe.co.za integration for secure payments in Phase 2.

**Current Status**: MVP development (Phase 1)
**Target Users**: Photographers in South Africa
**Stack**: Node.js/Express (backend) + Next.js (frontend), PostgreSQL, Cloudinary, Resend

## Repository Structure

```
camerastuff-marketplace-v2/
├── backend/                      # Express.js API (TypeScript)
│   ├── src/
│   │   ├── index.ts             # Main app entry
│   │   ├── config/env.ts        # Environment config
│   │   ├── middleware/auth.ts   # JWT auth middleware
│   │   ├── routes/              # API endpoints (listings, messages, etc.)
│   │   ├── controllers/         # Business logic
│   │   ├── services/            # External integrations
│   │   └── types/               # TypeScript types
│   ├── prisma/schema.prisma     # Database schema
│   ├── .env.example             # Environment template
│   └── package.json
│
├── frontend/                     # Next.js app (TypeScript)
│   ├── src/
│   │   ├── app/                 # Routes and pages
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── auth/            # Auth pages
│   │   │   ├── listings/        # Listing pages
│   │   │   └── profile/         # User profile
│   │   ├── components/          # React components
│   │   ├── lib/api.ts          # Backend API client
│   │   ├── types/              # TS types
│   │   └── styles/globals.css  # Tailwind styles
│   ├── next.config.js
│   ├── .env.example
│   └── package.json
│
├── CLAUDE.md                     # This file
├── README.md                     # Project overview
└── .gitignore
```

## Development Commands

### Backend
```bash
cd backend

npm run dev              # Start dev server (ts-node with hot reload)
npm run build           # Compile TypeScript
npm run start           # Run compiled JavaScript
npm run db:migrate      # Apply Prisma migrations
npm run db:seed         # Seed database with test data
npm run db:studio       # Open Prisma Studio (visual DB editor)
```

### Frontend
```bash
cd frontend

npm run dev             # Start Next.js dev server (http://localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
```

## Database Schema (Prisma)

**Key Models**:
- **User**: Authentication, profiles, verification status
  - Fields: id, email, password_hash, first_name, last_name, profile_image_url, bio, phone_number, location
  - Verification: email_verified, phone_verified, id_verified, verification_documents (flexible for legal requirements)

- **Listing**: Equipment for sale
  - Fields: id, user_id (seller), title, description, category_id, condition, price_zar, location, image_urls, specifications (JSON), is_active, status
  - Monetization: is_featured, is_promoted, featured_until, promoted_until
  - Relations: user, category, messages, transactions, reviews

- **Message**: Buyer-seller communication
  - Fields: id, listing_id, sender_id, recipient_id, message_body, read_at, created_at
  - Relations: listing, sender (User), recipient (User)

- **Category**: Equipment types (camera, lens, lighting, tripod, bags, accessories)

- **Transaction**: Phase 2 - Payment handling with Tradesafe
  - Fields: id, listing_id, buyer_id, seller_id, amount_zar, platform_fee_zar, tradesafe_transaction_id, status
  - Status: pending, completed, disputed, refunded, cancelled

- **Review**: Phase 2 - Buyer/seller ratings

**Database Indexes**: Full-text search on listings.title and listings.description, indexes on user_id, category_id, location

## Key Technical Decisions

1. **NextAuth.js** for authentication (simpler than Passport, native Next.js integration)
2. **Prisma ORM** for type-safe database access
3. **PostgreSQL fulltext search** for MVP (no Elasticsearch needed)
4. **Cloudinary** for image storage and optimization
5. **Resend** for transactional emails (3k/month free tier)
6. **Flexible verification system** - start with email-only, modular to add phone/ID later based on legal requirements

## Authentication Flow

1. **Frontend**: NextAuth.js handles user signup/login/logout
2. **Backend**: Express validates JWT tokens from NextAuth using `verifyAuth` middleware
3. **Tokens**: JWT stored in NextAuth sessions, passed in Authorization header to backend
4. **Environment**: `NEXTAUTH_SECRET` must match between frontend and backend for token verification

## API Endpoints (To Be Implemented)

### Listings
- `GET /api/listings` - List all with filters (category, location, price, condition, search)
- `GET /api/listings/:id` - Get listing detail
- `POST /api/listings` - Create (authenticated)
- `PUT /api/listings/:id` - Update (authenticated, owner only)
- `DELETE /api/listings/:id` - Delete (authenticated, owner only)

### Messages
- `GET /api/messages?listing_id=` - Get threads for listing
- `POST /api/messages` - Send message (authenticated)
- `PUT /api/messages/:id/read` - Mark as read (authenticated)

### Users
- `GET /api/users/:id` - Get profile
- `PUT /api/users/:id` - Update profile (authenticated, owner only)

### Search
- `GET /api/search?q=` - Full-text search on listings

## Common Development Tasks

### Add a new API endpoint
1. Create route file in `backend/src/routes/`
2. Define controller in `backend/src/controllers/`
3. Import route in `backend/src/index.ts`
4. Update `CLAUDE.md` if adding new patterns

### Create a new frontend page
1. Create file in `frontend/src/app/[route]/page.tsx`
2. Use components from `frontend/src/components/`
3. Call backend API using `api` client from `frontend/src/lib/api.ts`

### Update database schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:migrate -- --name description_of_change`
3. Commit migration files

### Add environment variable
1. Add to `.env.example` (with description)
2. Add to actual `.env` (with real value)
3. Add to `backend/src/config/env.ts` or `frontend/.env.example`
4. Use in code via `process.env.VARIABLE_NAME`

## Frontend File Patterns

- **Pages**: `src/app/[route]/page.tsx` - Separate page per route
- **Components**: `src/components/ComponentName.tsx` - Reusable UI components
- **Hooks**: `src/hooks/useCustomHook.ts` - Custom React hooks
- **Types**: `src/types/index.ts` - Shared TypeScript interfaces
- **API Client**: `src/lib/api.ts` - Axios instance for backend calls

## Backend File Patterns

- **Routes**: `src/routes/feature.ts` - Define API endpoints
- **Controllers**: `src/controllers/featureController.ts` - Handle request/response
- **Services**: `src/services/externalService.ts` - External API integrations (Cloudinary, Resend, etc.)
- **Middleware**: `src/middleware/auth.ts` - Request interceptors
- **Types**: `src/types/index.ts` - TypeScript interfaces
- **Config**: `src/config/env.ts` - Environment variables

## Important Notes

### Verification System
- Currently MVP requires **email verification only** (via Resend)
- Database has flexible fields (`email_verified`, `phone_verified`, `id_verified`, `verification_documents`)
- **LEGAL RESEARCH PENDING**: Exact verification requirements for sellers based on POPIA, CPA, FICA, goods dealing regulations
- Architecture allows easy expansion of verification requirements post-legal-review

### Monetization
- **Phase 1**: Infrastructure only - paid listing upgrades (featured/promoted) - database ready
- **Phase 2**: Transaction fees (3-5%) + Tradesafe escrow integration
- Transactions table exists in schema but not implemented in Phase 1

### Seller Verification Legal Track
- Parallel to development (2-3 weeks)
- Consult SA commercial lawyer on:
  - POPIA compliance
  - Consumer Protection Act applicability
  - FICA requirements (for Tradesafe Phase 2)
  - Second-hand goods dealer regulations
  - Platform operator liability
  - SARS reporting requirements

### Image Handling
- Store **Cloudinary URLs only** in database (never raw file uploads)
- Use Cloudinary for image optimization, CDN delivery, transformations
- Frontend displays via `<Image>` from `next/image` with Cloudinary remote patterns configured

### Email Service (Resend)
- Free tier: 3,000 emails/month (sufficient for MVP)
- Used for: verification, password reset, message notifications, status updates
- Templates configured in `frontend/src/lib/resend.ts` (to be created)

## Known Limitations & Future Work

- **Phase 1**: No real-time messaging (polling acceptable)
- **Phase 1**: No advanced search (PostgreSQL fulltext, no Elasticsearch)
- **Phase 2**: Tradesafe integration required for secure payments
- **Phase 3**: Consider mobile app (React Native), analytics, recommendation engine

## Debugging Tips

1. **Backend not responding**: Check `DATABASE_URL`, ensure PostgreSQL is running
2. **Frontend can't reach backend**: Check `NEXT_PUBLIC_API_URL` and CORS configuration
3. **Prisma errors**: Run `npm run db:studio` to inspect database state
4. **NextAuth issues**: Verify `NEXTAUTH_SECRET` matches between frontend and backend
5. **Cloudinary not working**: Check `CLOUDINARY_*` environment variables

## Testing Strategy

- Focus on critical paths: authentication, listings CRUD, messaging
- Use backend unit tests for business logic
- Frontend integration tests for key flows
- End-to-end tests before launch

## Deployment Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied to production
- [ ] SSL/HTTPS enforced
- [ ] CORS properly configured
- [ ] Error logging enabled (Sentry recommended)
- [ ] Performance monitoring active (Vercel Analytics)
- [ ] Legal compliance verified (Terms, Privacy Policy, etc.)

## Useful Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js Docs**: https://next-auth.js.org
- **Express Docs**: https://expressjs.com
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Resend Docs**: https://resend.com/docs

## Questions or Issues?

Refer to the plan file at `.claude/plans/gleaming-popping-cupcake.md` for high-level architecture decisions and feature phases.
