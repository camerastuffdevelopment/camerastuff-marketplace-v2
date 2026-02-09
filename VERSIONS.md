# Project Versions & Dependencies

**Last Updated**: 2026-02-09
**Project**: Camera Stuff Marketplace v2
**Status**: MVP Phase 1

## Core Runtime

| Component | Version | Documentation |
|-----------|---------|----------------|
| **Node.js** | 22.22.0 | https://nodejs.org/docs/latest/api/ |
| **npm** | 10.9.4+ | https://docs.npmjs.com/ |
| **PostgreSQL** | 15+ (Railway) | https://www.postgresql.org/docs/ |

## Backend Stack

### Framework & ORM
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **Express.js** | ^5.2.1 | Framework | https://expressjs.com/en/api.html | Latest v5 |
| **Prisma** | ^7.3.0 | ORM | https://www.prisma.io/docs/orm/overview/introduction | **BREAKING CHANGES - See below** |
| **TypeScript** | ^5.9.3 | Language | https://www.typescriptlang.org/docs/ | Strict mode enabled |

### Authentication & Security
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **jsonwebtoken** | ^9.0.3 | JWT | https://github.com/auth0/node-jsonwebtoken | For backend token validation |
| **bcrypt** | ^6.0.0 | Password Hashing | https://github.com/kelektiv/node.bcrypt.js | Salting 10 rounds |

### Database
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **@prisma/client** | ^7.3.0 | Client | https://www.prisma.io/docs/orm/prisma-client | Uses prisma/config.ts |
| **@prisma/internals** | (implicit) | Generator | https://www.prisma.io/docs/orm/reference/prisma-schema-reference | For Prisma CLI |

### Utilities
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **Zod** | ^4.3.6 | Validation | https://zod.dev | Request validation schemas |
| **CORS** | ^2.8.6 | Middleware | https://github.com/expressjs/cors | Allow frontend cross-origin requests |
| **dotenv** | ^17.2.4 | Config | https://github.com/motdotla/dotenv | Load .env file |
| **Cloudinary** | ^2.9.0 | Image Storage | https://cloudinary.com/documentation | Image upload & optimization |

### Development
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **ts-node** | ^10.9.2 | Runtime | https://typestrong.org/ts-node/ | TypeScript execution for dev |
| **nodemon** | ^3.1.11 | Auto-reload | https://nodemon.io/ | Hot reload on file changes |
| **typescript-eslint** | ^8.54.0 | Linting | https://typescript-eslint.io/ | Linting TypeScript |

### Type Definitions
- @types/node: ^25.2.2
- @types/express: ^5.0.6
- @types/bcrypt: ^6.0.0
- @types/cors: ^2.8.17
- @types/jsonwebtoken: ^9.0.10

---

## Frontend Stack

### Framework & Rendering
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **Next.js** | ^14.2.35 | Framework | https://nextjs.org/docs | App router (not pages) |
| **React** | ^18.3.1 | Library | https://react.dev | 18.3.1 with concurrent features |
| **React DOM** | ^18.3.1 | Rendering | https://react.dev/reference/react-dom | Server/client rendering |
| **TypeScript** | ^5.9.3 | Language | https://www.typescriptlang.org/docs/ | Strict mode enabled |

### Authentication
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **next-auth** | ^4.24.13 | Auth Library | https://next-auth.js.org | Session management |

### Styling
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **Tailwind CSS** | ^4.1.18 | CSS Framework | https://tailwindcss.com/docs | v4 (major update) |
| **PostCSS** | ^8.5.6 | CSS Processor | https://postcss.org/ | Required for Tailwind |
| **autoprefixer** | ^10.4.24 | PostCSS Plugin | https://github.com/postcss/autoprefixer | Browser prefixes |

### API & Data
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **axios** | ^1.13.5 | HTTP Client | https://axios-http.com/docs/intro | Backend API calls |
| **Zod** | ^4.3.6 | Validation | https://zod.dev | Schema validation |
| **Resend** | ^6.9.1 | Email Service | https://resend.com/docs | Transactional emails |

### State Management
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **Zustand** | ^5.0.11 | State Store | https://github.com/pmndrs/zustand | Lightweight alternative to Redux |

### Utilities
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **clsx** | ^2.1.1 | Class Utilities | https://github.com/lukeed/clsx | Conditional CSS classes |

### Development
| Package | Version | Type | Documentation | Notes |
|---------|---------|------|---------------|-------|
| **ESLint** | ^9.39.2 | Linting | https://eslint.org | Code quality |
| **eslint-config-next** | ^16.1.6 | Config | https://nextjs.org/docs/app/building-your-application/configuring/eslint | Next.js ESLint rules |

### Type Definitions
- @types/node: ^25.2.2
- @types/react: ^19.2.13
- @types/react-dom: ^19.2.3

---

## External Services & APIs

| Service | Version/Tier | Documentation | Purpose |
|---------|------|---------------|---------|
| **Cloudinary** | Free/Pro | https://cloudinary.com/documentation/image_upload_api_reference | Image storage & CDN |
| **Resend** | Free Tier (3k/month) | https://resend.com/docs/api-reference/emails/send | Transactional emails |
| **Railway** | - | https://docs.railway.app | Deployment platform |
| **Vercel** | - | https://vercel.com/docs | Frontend hosting (planned) |
| **PostgreSQL (Railway)** | 15+ | https://www.postgresql.org/docs/current/ | Database |

---

## Critical Breaking Changes & Version Notes

### ⚠️ Prisma 7 (^7.3.0)

**Breaking Changes from Prisma 6:**
1. **`url` removed from schema** - No longer allowed in `datasource` block
   - OLD (Prisma 6): `url = env("DATABASE_URL")`
   - NEW (Prisma 7): Use `prisma/config.ts` or constructor options

2. **PrismaClient configuration changed**
   - OLD: `new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })`
   - NEW: Provide via `prisma/config.ts` or `adapter` option

3. **Migration command changes**
   - Use `prisma migrate dev` (same as before)
   - But DATABASE_URL must be in `prisma.config.ts`

4. **prisma.config.ts required** (for runtime URL configuration)
   ```typescript
   export default {
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
   };
   ```

**Reference**: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7

### ⚠️ Tailwind CSS 4 (^4.1.18)

**Breaking Changes from v3:**
1. CSS variable syntax changed
2. Configuration options restructured
3. Custom config patterns may need updates

**Reference**: https://tailwindcss.com/docs/upgrade-guide

### ⚠️ Express 5 (^5.2.1)

**Notable Changes from v4:**
1. Promise-based middleware support
2. Some callback patterns deprecated
3. Error handling improvements

**Reference**: https://expressjs.com/en/guide/migrating-5.html

### ⚠️ Next.js 14 (^14.2.35)

**Current Best Practices:**
1. Use App Router (not Pages Router)
2. Server components by default
3. Client components marked with `'use client'`

**Reference**: https://nextjs.org/docs/app

---

## Development Environment

### Node.js Version Management
- **Current**: 22.22.0 (LTS)
- **Railway**: Automatically uses 22.22.0 via Railpack
- **Local Development**: Use Node 22+ recommended

### Recommended Development Tools
- VS Code with TypeScript support
- Prisma VS Code extension
- ESLint plugin for VS Code
- Thunder Client or Postman for API testing

---

## Environment Variables Required

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development|production
PORT=5000
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Build & Deployment

### Backend Build Process
1. `npm ci` - Clean install dependencies
2. Postinstall: `prisma generate` - Generate Prisma client
3. `tsc` - Compile TypeScript to JavaScript
4. Output: `dist/` directory

### Frontend Build Process
1. `npm ci` - Clean install dependencies
2. `next build` - Build Next.js app
3. Output: `.next/` directory

### Database Migrations
```bash
npm run db:migrate          # Create & apply migration
npm run db:seed             # Seed test data
npm run db:studio          # Open Prisma Studio
```

---

## Version Update Strategy

### When to Update
- ✅ Security patches (x.y.Z) - Update immediately
- ✅ Minor versions (x.Y.z) - Review changelogs, test thoroughly
- ⚠️ Major versions (X.y.z) - Check breaking changes, plan migration

### How to Update
1. Check documentation/changelog for breaking changes
2. Update package.json version
3. Run `npm install` or `npm ci`
4. Test locally (`npm run dev`)
5. Run build (`npm run build`)
6. Commit changes with version details in message
7. Deploy to staging first, then production

### Before Coding with New Versions
**MUST DO:**
1. ✅ Read the official migration guide
2. ✅ Check for breaking changes documentation
3. ✅ Review examples in official docs
4. ✅ Test in local development first
5. ✅ Document any version-specific patterns in CLAUDE.md

---

## Useful Documentation Links

### Prisma 7
- Upgrade Guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Config Reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference
- Client Constructor: https://www.prisma.io/docs/orm/reference/prisma-client-reference

### Express 5
- Migration Guide: https://expressjs.com/en/guide/migrating-5.html
- API Docs: https://expressjs.com/en/api.html

### Next.js 14
- Upgrade Guide: https://nextjs.org/docs/getting-started/installation
- App Router: https://nextjs.org/docs/app

### TypeScript 5.9
- Release Notes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html

### Tailwind CSS 4
- Upgrade Guide: https://tailwindcss.com/docs/upgrade-guide
- v4 Features: https://tailwindcss.com/blog/tailwindcss-v4

---

## Notes for Future Maintainers

- **Check this file before updating any major version**
- **Always read official breaking changes documentation**
- **Test locally before deploying to production**
- **Keep this file updated when versions change**
- **Document any version-specific workarounds in CLAUDE.md**
