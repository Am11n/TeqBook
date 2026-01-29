# Data Lifecycle and GDPR Compliance

This document describes TeqBook's data lifecycle management, retention policies, and GDPR compliance measures.

## Table of Contents

- [Overview](#overview)
- [Data Retention Policies](#data-retention-policies)
- [Data Deletion and Anonymization](#data-deletion-and-anonymization)
- [GDPR Compliance](#gdpr-compliance)
- [Customer Data Rights](#customer-data-rights)
- [Salon Data Management](#salon-data-management)
- [Implementation](#implementation)

---

## Overview

TeqBook handles personal data for:
- **Customers**: Booking history, contact information, preferences
- **Salons**: Business information, employees, settings
- **Users**: Account information, preferences, activity logs

All data handling follows GDPR principles:
- Lawfulness, fairness, and transparency
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Integrity and confidentiality
- Accountability

---

## Data Retention Policies

### Booking Data

**Retention Period:** 7 years (for accounting/tax purposes)

**Rationale:**
- Required for financial records in many jurisdictions
- Needed for customer service inquiries
- Historical data for business analytics

**After Retention Period:**
- Bookings are anonymized (customer data removed)
- Only aggregate statistics are retained

### Customer Data

**Retention Period:** 
- Active customers: Indefinitely (while salon is active)
- Inactive customers: 2 years after last booking
- Deleted customers: 30 days (soft delete before permanent deletion)

**Rationale:**
- Active customers need their data for service delivery
- Inactive customers may return
- Soft delete allows recovery if needed

### Employee Data

**Retention Period:**
- Active employees: Indefinitely (while employed)
- Inactive employees: 1 year after deactivation
- Deleted employees: 30 days (soft delete)

**Rationale:**
- Historical booking data may reference employees
- Needed for reporting and analytics
- Allows re-activation if employee returns

### Salon Data

**Retention Period:**
- Active salons: Indefinitely
- Cancelled salons: 1 year after cancellation
- Deleted salons: 90 days (soft delete)

**Rationale:**
- Allows account recovery
- Needed for billing disputes
- Historical data for business insights

### User Account Data

**Retention Period:**
- Active users: Indefinitely
- Inactive users: 2 years after last login
- Deleted users: 30 days (soft delete)

**Rationale:**
- Users may return after inactivity
- Soft delete allows recovery
- Compliance with account recovery requests

---

## Data Deletion and Anonymization

### Soft Delete

All deletions are initially "soft deletes":
- Records are marked as deleted (`deleted_at` timestamp)
- Data is hidden from normal queries
- Can be recovered within retention period

### Hard Delete

After retention period, data is permanently deleted:
- Records are removed from database
- Backups are purged (after backup retention period)
- No recovery possible

### Anonymization

For data that must be retained but personal data removed:

```sql
-- Anonymize customer data in old bookings
UPDATE bookings
SET 
  customer_full_name = 'Anonymous',
  customer_email = NULL,
  customer_phone = NULL,
  notes = NULL
WHERE 
  created_at < NOW() - INTERVAL '7 years'
  AND customer_id IS NOT NULL;
```

### Cascade Deletion

When a salon is deleted:
- All related data is deleted (cascade)
- Bookings, employees, services, customers, etc.
- This is a hard delete (after soft delete period)

---

## GDPR Compliance

### Legal Basis

**Contractual Necessity:**
- Customer data needed to fulfill booking services
- Employee data needed for employment relationship
- Salon data needed for service delivery

**Legitimate Interest:**
- Business analytics (anonymized)
- Fraud prevention
- Service improvement

**Consent:**
- Marketing communications (opt-in)
- Cookie preferences
- Data processing consent (explicit)

### Data Processing Principles

1. **Lawfulness**
   - Only process data with legal basis
   - Document legal basis for each data type

2. **Fairness**
   - Transparent about data use
   - Clear privacy policy
   - No hidden data collection

3. **Transparency**
   - Privacy policy explains data use
   - Users informed about data processing
   - Clear consent mechanisms

4. **Purpose Limitation**
   - Data only used for stated purposes
   - No secondary use without consent
   - Clear purpose statements

5. **Data Minimization**
   - Only collect necessary data
   - Regular data audits
   - Remove unnecessary data

6. **Accuracy**
   - Allow users to update their data
   - Regular data validation
   - Correct errors promptly

7. **Storage Limitation**
   - Retention policies enforced
   - Automatic deletion after retention
   - Regular data purging

8. **Integrity and Confidentiality**
   - Encryption at rest and in transit
   - Access controls (RLS)
   - Regular security audits

9. **Accountability**
   - Document all data processing
   - Regular compliance reviews
   - Data protection impact assessments

---

## Customer Data Rights

### Right to Access

Customers can request:
- What data is stored about them
- How data is used
- Who data is shared with

**Implementation:**
```typescript
// Export customer data
export async function exportCustomerData(customerId: string) {
  const customer = await getCustomer(customerId);
  const bookings = await getBookingsForCustomer(customerId);
  
  return {
    customer,
    bookings,
    exportDate: new Date().toISOString(),
  };
}
```

### Right to Rectification

Customers can:
- Update their information
- Correct errors
- Complete incomplete data

**Implementation:**
- Customer profile editing
- Booking notes can be updated
- Contact information can be changed

### Right to Erasure (Right to be Forgotten)

Customers can request deletion of their data.

**Implementation:**
```typescript
// Delete customer data
export async function deleteCustomerData(customerId: string) {
  // Soft delete customer
  await softDeleteCustomer(customerId);
  
  // Anonymize bookings
  await anonymizeCustomerBookings(customerId);
  
  // Schedule hard delete (after retention period)
  await scheduleHardDelete(customerId, retentionPeriod);
}
```

### Right to Restrict Processing

Customers can request:
- Temporary halt to data processing
- Data kept but not used

**Implementation:**
- Mark customer as "processing restricted"
- Exclude from automated processing
- Manual review required

### Right to Data Portability

Customers can request:
- Export of their data
- Transfer to another service

**Implementation:**
```typescript
// Export customer data in portable format
export async function exportCustomerDataPortable(customerId: string) {
  const data = await exportCustomerData(customerId);
  
  return JSON.stringify(data, null, 2);
}
```

### Right to Object

Customers can object to:
- Processing for marketing
- Automated decision-making
- Profiling

**Implementation:**
- Opt-out mechanisms
- Preference management
- Respect objections immediately

---

## Salon Data Management

### Salon Deletion

When a salon is deleted:

1. **Soft Delete (90 days)**
   - Salon marked as deleted
   - Access revoked
   - Data hidden from queries
   - Can be recovered

2. **Data Anonymization (if requested)**
   - Customer data anonymized
   - Employee data anonymized
   - Business data retained (aggregate)

3. **Hard Delete (after retention)**
   - All data permanently deleted
   - Backups purged
   - No recovery possible

### Employee Data

When an employee is deleted:
- Bookings referencing employee are updated
- Employee data is anonymized in historical bookings
- Personal information is removed

### Service Data

When a service is deleted:
- Historical bookings retain service name (for records)
- Service is removed from active list
- Can be restored if needed

---

## Implementation

### Database Schema

```sql
-- Soft delete support
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE employees ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE salons ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN anonymized_at TIMESTAMP;

-- Indexes for retention queries
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
```

### Retention Jobs

```typescript
// Supabase Edge Function: data-retention-cleanup
export async function cleanupExpiredData() {
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  // Anonymize old bookings
  await supabase
    .from("bookings")
    .update({
      customer_full_name: "Anonymous",
      customer_email: null,
      customer_phone: null,
      notes: null,
      anonymized_at: new Date().toISOString(),
    })
    .lt("created_at", sevenYearsAgo.toISOString())
    .is("anonymized_at", null);

  // Hard delete old soft-deleted records
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  await supabase
    .from("customers")
    .delete()
    .not("deleted_at", "is", null)
    .lt("deleted_at", twoYearsAgo.toISOString());
}
```

### Cron Schedule

Set up Supabase cron jobs:

```sql
-- Daily cleanup job
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 2 * * *', -- 2 AM daily
  $$
  SELECT cleanup_expired_data();
  $$
);
```

### API Endpoints

```typescript
// Export customer data
POST /api/customers/:id/export

// Delete customer data
DELETE /api/customers/:id

// Request data deletion
POST /api/customers/:id/request-deletion
```

---

## Best Practices

1. **Regular Audits**
   - Review data retention policies annually
   - Audit data processing activities
   - Update privacy policy as needed

2. **Documentation**
   - Document all data processing
   - Maintain data processing register
   - Keep records of consent

3. **Training**
   - Train staff on GDPR requirements
   - Regular compliance training
   - Incident response procedures

4. **Security**
   - Encrypt sensitive data
   - Access controls (RLS)
   - Regular security audits

5. **Transparency**
   - Clear privacy policy
   - Easy-to-understand consent forms
   - Regular communication about data use

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Data Protection Impact Assessment Template](../compliance/dpia-template.md)

