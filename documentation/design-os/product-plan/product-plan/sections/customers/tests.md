# Test Instructions: Customers

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The Customers section manages customer profiles with booking history, tags, and notes. Key functionality includes searching customers, viewing profiles, and managing customer data.

---

## User Flow Tests

### Flow 1: View Customer Profile

**Success Path:**
1. User clicks on customer row
2. **Expected:** Customer profile drawer opens showing contact info, booking history, tags, notes

### Flow 2: Add Tag to Customer

**Success Path:**
1. User opens customer profile drawer
2. User clicks "Add Tag" or types in tag input
3. User enters tag name and presses Enter
4. **Expected:** Tag appears in customer's tag list, saved to profile

### Flow 3: Search Customers

**Success Path:**
1. User enters search query in search bar
2. **Expected:** List updates to show only customers matching name, email, or phone

---

## Empty State Tests

**No customers:**
- Shows "No customers yet" message
- Shows "Create Customer" CTA button

---

## Sample Test Data

```typescript
const mockCustomer = {
  id: "customer-1",
  name: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  tags: ["VIP"],
  notes: [],
  marketingConsent: { email: true, sms: false }
};
```
