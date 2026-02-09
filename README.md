# Photography Equipment Marketplace

A peer-to-peer marketplace for buying and selling used photography equipment in South Africa.

**Status**: MVP - Frontend deploying to Vercel, Backend running on Railway
**Target Launch**: Q1 2026

## Project Overview

GearHub (placeholder name) is a co-branded marketplace by CameraStuff that connects photographers across South Africa to buy, sell, and trade used camera gear including:
- Cameras and lenses
- Lighting equipment
- Tripods and accessories
- Other photography gear

## Tech Stack

### Frontend
- Next.js 14+ with React 18
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Axios for API calls

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication

### Services
- **Cloudinary**: Image storage and optimization
- **Resend**: Transactional email
- **Tradesafe.co.za**: Payment escrow (Phase 2)

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: PostgreSQL on Railway

## Project Structure

```
camerastuff-marketplace-v2/
├── backend/              # Express API (TypeScript)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── types/
│   │   └── config/
│   └── prisma/
│       └── schema.prisma
├── frontend/             # Next.js app (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── types/
│   │   └── styles/
│   └── public/
├── docs/                 # Documentation
└── .github/              # GitHub workflows (to be added)
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Cloudinary account (free tier)
- Resend account (free tier)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Update .env with your configuration

npm install
npm run db:migrate
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Update .env.local with your configuration

npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Development

See individual README files in `/backend` and `/frontend` directories for detailed development instructions.

### Common Commands

**Backend**:
```bash
cd backend
npm run dev          # Start dev server
npm run db:migrate   # Apply database migrations
npm run db:seed      # Seed with test data
npm run build        # Build for production
```

**Frontend**:
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

## MVP Features (Phase 1)

### User Management
- [x] Database schema designed
- [ ] Signup/Login with NextAuth.js
- [ ] Email verification (Resend)
- [ ] User profiles
- [ ] Password reset

### Listings
- [ ] Create listings with Cloudinary image uploads
- [ ] Edit and delete own listings
- [ ] Browse all listings
- [ ] View listing details

### Search & Discovery
- [ ] Full-text search on listings
- [ ] Filter by category, location, price, condition
- [ ] Featured/promoted listings (paid feature)
- [ ] Homepage with featured listings

### Messaging
- [ ] Send messages between buyers and sellers
- [ ] View message threads
- [ ] Mark messages as read
- [ ] Email notifications for new messages

### Admin
- [ ] Basic content moderation
- [ ] Flag inappropriate listings
- [ ] User management

## Phase 2 Features (Post-MVP)

- Payment integration with Tradesafe.co.za
- Transaction management and escrow
- Reviews and seller ratings
- Real-time messaging with WebSockets
- Wishlist/Favorites
- Advanced buyer protection

## Phase 3 Features (Future)

- Advanced search with Elasticsearch
- Recommendation engine
- Mobile app (React Native)
- Analytics dashboard
- Saved searches and alerts
- Community forums

## Legal & Compliance

**Parallel Track** (2-3 weeks):
- [ ] Legal consultation on POPIA, CPA, FICA
- [ ] Terms of Service (legal review)
- [ ] Privacy Policy (POPIA compliance)
- [ ] Seller verification requirements finalized
- [ ] Platform liability insurance (if required)

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
RESEND_API_KEY=your-key
```

## Contributing

This is an internal CameraStuff project. For development guidelines, see `CLAUDE.md`.

## Timeline

- **Weeks 1-2**: Infrastructure setup (auth, database, basic CRUD)
- **Weeks 3-4**: Listings and search functionality
- **Weeks 5-6**: Messaging system and refinements
- **Weeks 7-8**: Testing, deployment, launch preparation
- **Parallel**: Legal research and compliance review (2-3 weeks)

## Support & Questions

For development questions, see the CLAUDE.md file for guidance to future Claude Code instances.

---

**Brand Note**: This is a co-branded initiative leveraging CameraStuff's reputation in the photography equipment market. The marketplace will operate independently from the main CameraStuff retail business.
