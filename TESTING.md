# Testing Guide - Camera Equipment Marketplace MVP

## Pre-Testing Setup

### 1. Environment Configuration

**Backend (.env)**:
```bash
cd backend
cp .env.example .env
```

Fill in `.env` with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace_dev
JWT_SECRET=your-secret-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
NEXTAUTH_SECRET=your-nextauth-secret
```

**Frontend (.env.local)**:
```bash
cd frontend
cp .env.example .env.local
```

Fill in `.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
RESEND_API_KEY=your-resend-api-key
```

### 2. Database Setup

```bash
cd backend
npm run db:migrate    # Create tables
npm run db:seed       # Populate test data
```

Test credentials:
- `seller1@example.com` / `password123`
- `seller2@example.com` / `password123`
- `buyer@example.com` / `password123`

### 3. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Should show: ✓ Server running on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Should show: ▲ Ready in 2.1s
# Open http://localhost:3000
```

---

## Testing Scenarios

### Test 1: User Authentication

**Signup Flow**:
1. ✅ Navigate to `http://localhost:3000/auth/signup`
2. ✅ Fill in form:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Password: testpass123
3. ✅ Check Terms checkbox
4. ✅ Click "Sign Up"
5. ✅ Should redirect to `/email-verification`
6. ✅ Should see verification message
7. ✅ Verify user created in database: `SELECT * FROM "User" WHERE email='testuser@example.com';`

**Login Flow**:
1. ✅ Navigate to `/auth/login`
2. ✅ Enter credentials: `seller1@example.com` / `password123`
3. ✅ Click "Sign In"
4. ✅ Should redirect to `/listings`
5. ✅ Should see user authenticated (check NextAuth session)

**Session Persistence**:
1. ✅ After login, refresh page - should stay logged in
2. ✅ Close and reopen browser - should remain logged in
3. ✅ Logout should clear session

### Test 2: Browse Listings

**Initial Page Load**:
1. ✅ Navigate to `/listings` (no login required)
2. ✅ Should see list of sample listings (3 from seed)
3. ✅ Each listing shows: image, title, price, condition, views
4. ✅ Should not have 404 or console errors

**Listing Detail**:
1. ✅ Click on any listing
2. ✅ Should see full details: title, description, specs, seller info
3. ✅ View count should increment (check in detail page)
4. ✅ Should see "Send Message" button for non-owners
5. ✅ For listing owner, should see "Edit" and "Delete" buttons

**Filters & Search**:
1. ✅ Filter by category - should show only that category
2. ✅ Filter by condition - should show only that condition
3. ✅ Price range - should filter correctly
4. ✅ Location search - should find listings
5. ✅ Search box - should find by title/description
6. ✅ Pagination - should navigate between pages

### Test 3: Messaging System

**Send Message** (Login required):
1. ✅ Login as `buyer@example.com` / `password123`
2. ✅ Go to listing by `seller1@example.com`
3. ✅ Click "Send Message to Seller"
4. ✅ Should navigate to `/messages?listing_id=...&user_id=...`
5. ✅ Should see conversation with seller
6. ✅ Type message and click "Send"
7. ✅ Message should appear in chat

**View Conversations**:
1. ✅ Go to `/messages`
2. ✅ Should see list of conversations
3. ✅ Unread count should show for new messages
4. ✅ Click on conversation - should open chat
5. ✅ Messages should be marked as read automatically

**Pagination**:
1. ✅ Send multiple messages (10+)
2. ✅ Should scroll through message history
3. ✅ Timestamps should be displayed correctly

### Test 4: Create Listing (When Implemented)

**TODO**: This feature requires Cloudinary integration and is not yet implemented.

Expected flow:
1. Login as seller
2. Click "Create Listing"
3. Upload images to Cloudinary
4. Fill listing details
5. Submit to backend
6. Should appear in listings

### Test 5: API Response Handling

**Backend Error Handling**:
1. ✅ Try invalid email login - should show error
2. ✅ Try SQL injection attempt - should be prevented
3. ✅ Try accessing protected endpoints without auth - should get 401
4. ✅ Try updating other user's listing - should get 403

**Network Error Handling**:
1. ✅ Stop backend server
2. ✅ Try to load `/listings` - should show connection error gracefully
3. ✅ Frontend should not crash

---

## Known Issues & Fixes Applied

### Issue #1: JWT Token Not Sent to Backend ✅ FIXED
- **Problem**: API client wasn't including JWT token in requests
- **Solution**: Updated NextAuth JWT callback to store token in session, API client now extracts and sends it
- **Files Modified**:
  - `frontend/src/app/api/auth/[...nextauth]/route.ts` - Updated jwt and session callbacks
  - `frontend/src/lib/api.ts` - Fixed request interceptor

### Issue #2: Missing Error Messages
- **Status**: Monitor for user-facing errors
- **Solution**: Implement error boundaries and toast notifications (Phase 2)

---

## Test Results Template

Date: _______________
Tester: _______________

| Test Scenario | Status | Notes |
|---|---|---|
| Signup | ⬜ | |
| Login | ⬜ | |
| Browse Listings | ⬜ | |
| View Listing Detail | ⬜ | |
| Filter/Search | ⬜ | |
| Send Message | ⬜ | |
| View Conversations | ⬜ | |
| Mark as Read | ⬜ | |
| Error Handling | ⬜ | |
| **Overall Status** | ⬜ | |

---

## Performance Testing

### Metrics to Monitor

1. **Page Load Times**:
   - Homepage: < 2s
   - Listings page: < 3s
   - Listing detail: < 2s
   - Messages page: < 3s

2. **API Response Times**:
   - Login: < 1s
   - List listings: < 1.5s
   - Send message: < 0.5s

3. **Database Queries**:
   - Ensure no N+1 queries
   - Check query performance with `EXPLAIN`

---

## Browser Compatibility

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile browsers (iPhone Safari, Chrome Android)

---

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Form labels properly associated
- ✅ Color contrast meets WCAG AA
- ✅ Images have alt text
- ✅ Focus indicators visible

---

## Security Testing

- ✅ HTTPS enforced in production
- ✅ Passwords hashed with bcrypt
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (Next.js built-in)
- ✅ JWT tokens validated on every protected request
- ⚠️  TODO: Rate limiting on auth endpoints
- ⚠️  TODO: Content Security Policy headers

---

## Deployment Testing

Before production launch:
1. ✅ Test on staging environment
2. ✅ Verify environment variables
3. ✅ Test database migrations on production database
4. ✅ Verify image uploads to production Cloudinary
5. ✅ Test email service (Resend) in production
6. ✅ Monitor error logs (Sentry)
7. ✅ Load test with 100 concurrent users
8. ✅ Backup production database strategy

---

## Regression Test Checklist

After any code changes, verify:
- [ ] All auth endpoints work
- [ ] All listing endpoints work
- [ ] All message endpoints work
- [ ] Frontend loads without console errors
- [ ] No broken links or 404s
- [ ] Responsive design on mobile
- [ ] Database queries are optimized

---

## Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Ready for production deployment
- [ ] Performance acceptable
- [ ] Security baseline met

Approved by: _____________ Date: _____________
