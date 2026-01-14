# Test Instructions: Business

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The Business section manages salon settings including profile, hours, branding, billing, and notifications. Key functionality includes updating business information and managing subscription.

---

## User Flow Tests

### Flow 1: Update Business Profile

**Success Path:**
1. User navigates to Business settings
2. User clicks "Profile" in left nav
3. User edits business name, address, contact info
4. User clicks "Save Changes"
5. **Expected:** Profile updates saved, success message shown

### Flow 2: Configure Opening Hours

**Success Path:**
1. User clicks "Hours" in left nav
2. User toggles days open/closed
3. User sets open/close times
4. User clicks "Save Changes"
5. **Expected:** Opening hours saved

### Flow 3: Upload Logo

**Success Path:**
1. User clicks "Branding" in left nav
2. User clicks "Upload Logo" button
3. User selects image file
4. User clicks "Save Logo"
5. **Expected:** Logo preview updates, file uploaded

---

## Empty State Tests

**No invoices:**
- Shows "No invoices yet" message in invoices list

---

## Sample Test Data

```typescript
const mockSalon = {
  id: "salon-1",
  name: "Elite Cuts Barbershop",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102"
  }
};
```
