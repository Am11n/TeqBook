# TeqBook Mobile Architecture

## Framework Decision

### Framework Comparison

| Criteria | React Native | Flutter | PWA |
|----------|--------------|---------|-----|
| **Code Reuse** | High (shares TypeScript/React skills) | Medium (new language - Dart) | Highest (same web codebase) |
| **Performance** | Near-native | Excellent | Good (depends on browser) |
| **Development Speed** | Fast (familiar stack) | Medium | Fastest |
| **Offline Support** | Good | Good | Service Worker based |
| **Push Notifications** | Native support | Native support | Web Push API |
| **App Store Presence** | Yes | Yes | No (limited) |
| **Installation** | App Store download | App Store download | Browser prompt |
| **Updates** | App Store review | App Store review | Instant |
| **Team Learning Curve** | Low (React/TS) | High (Dart) | None |
| **Cost** | $0 | $0 | $0 |

### Recommendation: Progressive Web App (PWA) First

**Rationale:**
1. **Maximum Code Reuse**: TeqBook is built with Next.js/React - PWA allows reusing existing components
2. **Instant Updates**: No App Store review process for bug fixes
3. **Lower Maintenance**: Single codebase for web and mobile
4. **Cost Effective**: No additional developer onboarding
5. **Adequate for Use Case**: Booking apps don't require native device features

**Future Path:** If native features are needed, migrate to React Native (shared React/TypeScript skills)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TeqBook PWA                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ App Shell   │  │ Service     │  │ IndexedDB       │ │
│  │ (Cached)    │  │ Worker      │  │ (Offline Data)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │              Responsive UI Layer                    ││
│  │  - Mobile-first components                          ││
│  │  - Touch-optimized interactions                     ││
│  │  - Bottom navigation                                ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │              Shared Business Logic                  ││
│  │  - Services (booking, customer, etc.)               ││
│  │  - Repositories (Supabase)                          ││
│  │  - Hooks (React Query)                              ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │              Supabase Backend                       ││
│  │  - Real-time subscriptions                          ││
│  │  - Edge Functions                                   ││
│  │  - Auth                                             ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## PWA Requirements

### 1. Web App Manifest

```json
{
  "name": "TeqBook",
  "short_name": "TeqBook",
  "description": "Salon booking management",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 2. Service Worker Strategy

| Resource Type | Caching Strategy |
|---------------|------------------|
| App Shell (HTML) | Cache First, Network Fallback |
| Static Assets (JS, CSS) | Cache First |
| API Responses | Network First, Cache Fallback |
| Images | Cache First with TTL |
| User Data | IndexedDB with Sync |

### 3. Offline Capabilities

**Read-Only Offline:**
- View upcoming bookings
- View customer list
- View schedule
- View services

**Queue for Sync:**
- Create booking (queued)
- Update booking status (queued)
- Add customer notes (queued)

**Requires Online:**
- New customer creation (needs verification)
- Payment processing
- Calendar sync

---

## Mobile-Specific Components

### Bottom Navigation

```typescript
interface MobileNavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

const mobileNavItems: MobileNavItem[] = [
  { icon: "calendar", label: "Bookings", href: "/bookings" },
  { icon: "users", label: "Customers", href: "/customers" },
  { icon: "plus-circle", label: "New", href: "/bookings/new" },
  { icon: "clock", label: "Schedule", href: "/schedule" },
  { icon: "menu", label: "More", href: "/menu" },
];
```

### Touch Interactions

- Swipe left on booking: Cancel/Reschedule
- Swipe right on booking: Mark Complete
- Pull to refresh on lists
- Long press for context menu

### Mobile Views

| Desktop View | Mobile Equivalent |
|--------------|-------------------|
| Dashboard with sidebar | Full-screen cards |
| Calendar grid | Agenda list view |
| Customer table | Customer cards |
| Settings tabs | Stacked sections |

---

## API Considerations

### Existing API Compatibility

All current Supabase endpoints work for mobile. No changes needed:
- Auth: Supabase Auth works in browsers
- Real-time: WebSocket subscriptions work
- Storage: Direct URLs work

### Optimizations for Mobile

1. **Pagination**: All list endpoints support `limit` and `offset`
2. **Field Selection**: Use `select` to reduce payload size
3. **Compression**: Supabase supports gzip
4. **Caching Headers**: Add `Cache-Control` for static data

### Push Notification Integration

```typescript
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Store in database
table: push_subscriptions
- id: uuid
- user_id: uuid (FK users)
- subscription: jsonb
- created_at: timestamp
- last_used_at: timestamp
```

---

## Security Considerations

### PWA Security

1. **HTTPS Required**: Already enforced
2. **CSP Headers**: Already configured
3. **Token Storage**: Use `localStorage` with encryption
4. **Session Timeout**: Match web session (30 days)

### Offline Data Security

1. **Encrypt IndexedDB**: Use Web Crypto API
2. **Clear on Logout**: Wipe all cached data
3. **Pin/Biometric Lock**: Optional for sensitive data

---

## Testing Strategy

### Mobile Testing

1. **Device Testing**:
   - iOS Safari
   - Android Chrome
   - Samsung Internet

2. **PWA Testing**:
   - Lighthouse PWA audit
   - Offline functionality
   - Install prompt

3. **Responsive Testing**:
   - 320px (small phones)
   - 375px (iPhone)
   - 414px (large phones)
   - 768px (tablets)

---

## Implementation Phases

### Phase 1: PWA Foundation
- Add manifest.json
- Create service worker
- Implement offline shell
- Add install prompt

### Phase 2: Mobile UI
- Bottom navigation
- Touch-optimized components
- Mobile-specific views
- Pull-to-refresh

### Phase 3: Offline Support
- IndexedDB caching
- Background sync
- Offline queue
- Conflict resolution

### Phase 4: Push Notifications
- Service worker push handling
- Subscription management
- Notification preferences
- Deep linking
