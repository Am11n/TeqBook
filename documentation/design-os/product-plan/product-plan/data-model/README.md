# Data Model

## Entities

### Salon
The barbershop or beauty salon business that uses the platform.

### User
People who log into the system, including owners, managers, and employees.

### Role
Permission levels that determine what users can access and do within the system.

### Employee
Staff members who work at the salon and can be assigned to bookings and shifts.

### Service
Services offered by the salon, such as haircuts, styling, treatments, and other offerings.

### Booking
Appointments scheduled between customers and employees for specific services at designated times.

### Customer
People who book appointments and receive services at the salon.

### Shift
Scheduled work periods for employees with specific start and end times.

### PaymentPlan
Billing plans that salons can subscribe to, such as basic, premium, or enterprise tiers.

### Subscription
Active subscription that a salon has to a payment plan, determining their access level and features.

### Notification
Messages and alerts sent to users about bookings, shifts, system events, and important updates.

## Relationships

- Salon has many Users
- User has one Role
- Salon has many Employees
- Employee belongs to Salon and is linked to a User
- Salon has many Services
- Salon has many Bookings
- Booking belongs to Customer, Service, and Employee
- Salon has many Customers
- Employee has many Shifts
- Shift belongs to Employee and Salon
- Salon has one Subscription
- Subscription belongs to PaymentPlan
- User has many Notifications
- Notification belongs to User

