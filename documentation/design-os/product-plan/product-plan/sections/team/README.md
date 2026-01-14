# Team

## Overview

The Team section provides comprehensive employee management with role-based access control. Users can view team members, invite new employees via email, manage roles and permissions, and view employee profiles with working hours and availability.

## User Flows

- View team list with all employees showing name, role, status, and contact information
- Invite new team member by entering email address and selecting role (Admin, Manager, Staff)
- View pending invitations with options to resend or revoke invite
- View employee profile with name, contact details, role, status, and working hours/availability
- Edit employee profile to update name, contact information, role, or status
- Manage roles and permissions by assigning Admin, Manager, or Staff roles to employees
- Link to Shifts section to view and manage employee working hours and availability
- Filter team members by role or status
- Search team members by name or email

## Design Decisions

- Team list as primary interface with employee details drawer
- Invite flow with email and role selection
- Pending invites section for tracking invitations
- Role badges for quick visual identification
- Status indicators for active, invited, disabled employees

## Data Used

**Entities:** Employee, Role, PendingInvite

**From global model:** Employee, Role, User entities

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `TeamList` — Main component with team list and filters
- `TeamRow` — Individual employee row
- `TeamFilters` — Filter and search component
- `EmployeeDetailsDrawer` — Employee profile drawer
- `InviteModal` — Invite new team member modal
- `RoleBadge` — Role badge component
- `StatusBadge` — Status badge component

## Callback Props

| Callback | Description |
|----------|-------------|
| `onView` | Called when user wants to view an employee's profile |
| `onEdit` | Called when user wants to edit an employee |
| `onInvite` | Called when user wants to invite a new team member |
| `onResendInvite` | Called when user wants to resend a pending invite |
| `onRevokeInvite` | Called when user wants to revoke a pending invite |
| `onUpdateRole` | Called when user wants to update an employee's role |
| `onUpdateStatus` | Called when user wants to update an employee's status |
| `onDelete` | Called when user wants to delete/remove an employee |
| `onFilter` | Called when user applies filters |
| `onViewShifts` | Called when user wants to navigate to Shifts section for an employee |

