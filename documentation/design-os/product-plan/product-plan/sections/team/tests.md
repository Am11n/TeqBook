# Test Instructions: Team

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The Team section manages employees with role-based access. Key functionality includes inviting team members, managing roles, and viewing employee profiles.

---

## User Flow Tests

### Flow 1: Invite a New Team Member

**Success Path:**
1. User clicks "Invite Team Member" button
2. User enters email address
3. User selects role (Admin, Manager, Staff)
4. User clicks "Send Invitation"
5. **Expected:** Invitation sent, appears in pending invites, success message shown

**Failure Path:**
- Invalid email shows validation error
- Server error shows error message with retry option

### Flow 2: View Employee Profile

**Success Path:**
1. User clicks on employee row
2. **Expected:** Employee details drawer opens showing name, contact, role, status

---

## Empty State Tests

**No team members:**
- Shows "No team members yet" message
- Shows "Invite Team Member" CTA button
- Clicking CTA opens invite modal

---

## Component Interaction Tests

- Clicking "Invite Team Member" opens invite modal
- Clicking employee row opens details drawer
- Filtering by role updates list
- Search by name/email filters results

---

## Sample Test Data

```typescript
const mockEmployee = {
  id: "emp-1",
  name: "Jane Smith",
  email: "jane@example.com",
  roleId: "role-manager",
  roleName: "Manager",
  status: "active" as const
};
```
