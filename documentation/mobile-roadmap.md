# TeqBook Mobile Roadmap

## Executive Summary

TeqBook will adopt a **Progressive Web App (PWA)** approach for mobile, maximizing code reuse with the existing Next.js codebase while delivering a native-like experience.

---

## MVP Feature Set

### Core Features (Must Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Booking View** | View today's and upcoming bookings | P0 |
| **Quick Actions** | Complete, cancel, no-show buttons | P0 |
| **Customer Lookup** | Search and view customer details | P0 |
| **Schedule View** | See employee schedules | P0 |
| **Push Notifications** | Booking reminders, new bookings | P0 |
| **Offline Viewing** | View cached bookings offline | P1 |

### Secondary Features (Nice to Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **New Booking** | Create booking from mobile | P1 |
| **Customer Notes** | Add notes to customers | P1 |
| **Calendar Sync** | View synced calendar events | P2 |
| **Reports Summary** | Quick revenue/booking stats | P2 |
| **Team Chat** | Simple team communication | P3 |

---

## Implementation Phases

### Phase 1: PWA Foundation

**Goal:** Make the existing web app installable

**Tasks:**
1. Create `manifest.json` with app metadata
2. Add PWA meta tags to layout
3. Create basic service worker for app shell caching
4. Add install prompt component
5. Configure Lighthouse PWA audit

**Deliverables:**
- Installable PWA on iOS and Android
- Offline app shell (navigation, loading states)
- App icons and splash screens

**Technical Requirements:**
```typescript
// next.config.js additions
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});
```

---

### Phase 2: Mobile-Optimized UI

**Goal:** Touch-friendly, mobile-first experience

**Tasks:**
1. Create `MobileNav` bottom navigation component
2. Build mobile-specific booking cards with swipe actions
3. Implement pull-to-refresh on list views
4. Create mobile-optimized forms (larger touch targets)
5. Add gesture support (swipe to complete/cancel)

**Deliverables:**
- Bottom navigation bar
- Swipe actions on bookings
- Touch-optimized booking flow
- Mobile date/time pickers

**New Components:**
```
web/src/components/mobile/
├── MobileNav.tsx
├── MobileBookingCard.tsx
├── SwipeActions.tsx
├── PullToRefresh.tsx
└── MobileDatePicker.tsx
```

---

### Phase 3: Offline Support

**Goal:** Work without internet connection

**Tasks:**
1. Set up IndexedDB for local data storage
2. Implement background sync for offline actions
3. Create conflict resolution strategy
4. Add sync status indicators
5. Queue offline bookings for later sync

**Deliverables:**
- View bookings offline
- Create bookings offline (queued)
- Sync status indicator
- Data conflict resolution

**Database Schema (IndexedDB):**
```typescript
interface OfflineStore {
  bookings: {
    key: string;
    data: Booking;
    syncStatus: 'synced' | 'pending' | 'conflict';
    lastModified: number;
  };
  customers: {
    key: string;
    data: Customer;
    syncStatus: 'synced' | 'pending' | 'conflict';
    lastModified: number;
  };
  pendingActions: {
    id: string;
    type: 'create' | 'update' | 'delete';
    entity: string;
    payload: unknown;
    createdAt: number;
  };
}
```

---

### Phase 4: Push Notifications

**Goal:** Keep users informed in real-time

**Tasks:**
1. Create push notification service worker handler
2. Build subscription management UI
3. Set up VAPID keys for web push
4. Create notification preference settings
5. Implement deep linking from notifications

**Deliverables:**
- Push notification opt-in flow
- Notification for new bookings
- Notification for booking reminders
- Notification for cancellations
- Click-through to relevant screen

**API Endpoints:**
```
POST /api/push/subscribe - Save push subscription
DELETE /api/push/unsubscribe - Remove subscription
PUT /api/push/preferences - Update notification preferences
```

**Database Migration:**
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, endpoint)
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_booking BOOLEAN DEFAULT true,
  booking_reminder BOOLEAN DEFAULT true,
  booking_cancelled BOOLEAN DEFAULT true,
  daily_summary BOOLEAN DEFAULT false,
  reminder_hours_before INTEGER DEFAULT 24
);
```

---

## Technical Stack

### PWA Dependencies

```json
{
  "dependencies": {
    "next-pwa": "^5.6.0",
    "idb": "^8.0.0",
    "web-push": "^3.6.0"
  }
}
```

### Service Worker Libraries

- **Workbox**: For advanced caching strategies
- **idb**: IndexedDB wrapper for offline storage
- **web-push**: Server-side push notifications

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] PWA installable on iOS Safari
- [ ] PWA installable on Android Chrome
- [ ] Lighthouse PWA score > 90
- [ ] App shell loads in < 1 second

### Phase 2 Success Criteria
- [ ] Mobile Lighthouse performance > 80
- [ ] All touch targets > 44px
- [ ] Swipe actions work on iOS and Android
- [ ] No horizontal scroll on any view

### Phase 3 Success Criteria
- [ ] View bookings without network
- [ ] Queue booking changes offline
- [ ] Sync completes within 30s of reconnection
- [ ] No data loss during offline/online transition

### Phase 4 Success Criteria
- [ ] Push notifications work on iOS Safari
- [ ] Push notifications work on Android Chrome
- [ ] Notification delivery rate > 95%
- [ ] Deep links open correct screen

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari limitations | High | Test early, have fallbacks |
| IndexedDB storage limits | Medium | Implement data cleanup |
| Push notification permissions | Medium | Clear value proposition |
| Battery drain concerns | Low | Efficient sync intervals |

---

## Resource Requirements

### Development Team
- 1 Frontend Developer (familiar with React/Next.js)
- Part-time Backend Developer (for push notification endpoints)

### Infrastructure
- VAPID keys for web push
- Supabase Edge Function for sending notifications
- No additional servers needed

### Cost Estimate
- Development: Internal team time
- Infrastructure: $0 (existing Supabase)
- App Store: N/A (PWA)

---

## Future Considerations

### If Native App Needed

If PWA limitations become blocking (e.g., background GPS, Bluetooth):

1. **React Native** recommended (shared React/TypeScript skills)
2. Reuse business logic layer
3. Build native UI components
4. Estimated effort: 3-4 months for MVP

### Potential Native-Only Features
- Background location for mobile staff
- Bluetooth payment terminals
- Camera for document scanning
- Biometric authentication

---

## Appendix: PWA Compatibility

### iOS Safari Support (iOS 16.4+)
- ✅ Web App Manifest
- ✅ Service Worker
- ✅ Push Notifications (iOS 16.4+)
- ✅ Add to Home Screen
- ⚠️ Background Sync (limited)
- ❌ Badge API

### Android Chrome Support
- ✅ Web App Manifest
- ✅ Service Worker
- ✅ Push Notifications
- ✅ Add to Home Screen
- ✅ Background Sync
- ✅ Badge API
