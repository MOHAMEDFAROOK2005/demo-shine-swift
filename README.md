# Ocean Workforce Demo

==================================================
2A. MVP / CLIENT DEMO MODE — IMPORTANT
======================================

THIS PROJECT IS AN MVP CLIENT DEMONSTRATION PROTOTYPE.

Do NOT over-engineer the application.

The primary goal is to demonstrate the product concept, UI, workflows, calculations, and major features to potential clients.

We do NOT need a complete production backend at this stage.

IMPORTANT:

Do NOT spend excessive effort creating a complicated authentication system, complex database architecture, production-grade user management, or unnecessary backend infrastructure.

The prototype should LOOK AND FEEL like a real enterprise workforce-management system while remaining simple enough to build, run, and demonstrate reliably.

==================================================
DEMO LOGIN
==========

Create a simple DEMO LOGIN system.

Provide visible demo credentials on the login page or through a small "Demo Credentials" helper.

Use:

Demo Email:
[admin@oceanworkforce.demo](mailto:admin@oceanworkforce.demo)

Demo Password:
Demo@12345

After entering these credentials, the user should be able to access the complete Admin experience.

Also optionally provide quick login buttons:

"Login as Admin"
"Login as Supervisor"
"Login as Payroll Staff"

These should automatically use the predefined demo credentials.

IMPORTANT:

These are fictional demo credentials only.

Do NOT require the client/demo user to create an account.

Do NOT require email verification.

Do NOT require password reset functionality to actually send emails.

Do NOT create a complicated user onboarding system.

The purpose is simply to allow a client to immediately enter the application and see the features.

==================================================
DEMO-FIRST ARCHITECTURE
=======================

Prioritize the following:

1. Excellent UI
2. Smooth navigation
3. Working workflows
4. Real calculations
5. Real CRUD behavior during the demo
6. Real payslip PDF generation
7. Realistic demo data
8. Reliable client presentation experience

Avoid unnecessary complexity.

If a feature can be demonstrated reliably without a complex backend implementation, prefer the simpler implementation.

Do NOT build features that are not necessary for demonstrating the core workforce-management workflow.

==================================================
DATABASE / SUPABASE — MVP APPROACH
==================================

Supabase can be used where it provides clear value, but do NOT create an unnecessarily complicated production database architecture.

For this MVP, only create the minimum data structure required to demonstrate:

* Workers
* Worker details
* Attendance
* Working hours
* Overtime
* Payroll
* Payslips
* Documents if required for demonstration

Do not create unnecessary tables, relationships, permissions, workflows, or enterprise infrastructure that are not required for the demo.

The MVP should still be structured cleanly enough that Supabase/database functionality can be expanded later.

IMPORTANT:

The client should NOT need to understand or configure the database to use the demo.

The application should open and immediately contain realistic fictional demo data.

==================================================
DEMO DATA
=========

Preload realistic fictional demo data.

Create approximately 8–12 fictional workers.

Include:

* Worker names
* Worker IDs
* Nationalities
* Positions
* Fictional passport numbers
* Passport expiry dates
* Assigned shipyard/client
* Attendance records
* Working hours
* Overtime
* Payroll information
* Payslip examples

Use ONLY fictional information.

The demo data should make the dashboard immediately look populated.

Do NOT make the client manually create all data before they can see the system.

==================================================
DEMO RESET
==========

Add a simple optional:

"Reset Demo Data"

button inside Settings/Admin tools.

This should restore the application to its original demo state.

This is useful during client demonstrations if someone changes or deletes demo records.

Do not create a complicated backup/restore system.

==================================================
CORE CLIENT DEMONSTRATION FLOW
==============================

The following flow must work smoothly without requiring complicated setup:

1. Open application
2. Login using demo credentials
3. See populated dashboard
4. Open Workers
5. Search workers
6. Open a worker profile
7. View worker details
8. View documents
9. Open Attendance
10. Add attendance
11. Enter Time In and Time Out
12. Automatically calculate Total Hours
13. Automatically calculate Normal Hours
14. Automatically calculate OT Hours
15. Save attendance
16. Monthly totals update
17. Open Payroll
18. Select payroll month
19. Payroll recalculates
20. View worker payroll
21. Generate payslip
22. Preview payslip
23. Download actual PDF

EVERY STEP ABOVE MUST BE DEMONSTRABLE.

==================================================
IMPORTANT MVP RULE
==================

DO NOT BUILD A FULL PRODUCTION SYSTEM JUST FOR THE SAKE OF COMPLEXITY.

This is a CLIENT-FACING MVP.

The application should demonstrate WHAT THE FINAL PRODUCT CAN DO, not attempt to implement every possible production requirement.

Keep the architecture clean and expandable, but keep the implementation lean.

Avoid:

* Complicated authentication flows
* Multi-tenant architecture
* Complex permission systems
* Unnecessary database tables
* Enterprise audit systems
* Complex notification infrastructure
* Email infrastructure
* Payment systems
* Unnecessary integrations
* ISRP integration
* Over-engineered backend services

Only implement what is necessary to make the MVP feel complete and demonstrate the business value.

==================================================
PRODUCTION MIGRATION PATH
=========================

Structure the code so that the demo authentication and demo data can later be replaced with:

* Real Supabase authentication
* Real user accounts
* Real role-based access
* Full Supabase persistence
* Production Row Level Security
* Multi-company support
* Real notification systems
* Real document management
* Real payroll rules
* Official integrations if required

But DO NOT implement all of those now unless they are necessary for the MVP.

The MVP should be easy to upgrade later.

==================================================
FINAL REQUIREMENT
=================

The priority is:

SIMPLE + FUNCTIONAL + PROFESSIONAL + DEMO-READY.

Do not sacrifice reliability and demonstration quality by over-engineering the application.

A client should be able to receive the application, use the demo credentials, and immediately understand the value of the system.

At the end, clearly display:

Demo Login:
Email: [admin@oceanworkforce.demo](mailto:admin@oceanworkforce.demo)
Password: Demo@12345

Also explain which parts are currently demo/MVP functionality and which parts would be replaced or expanded for production.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://demo-shine-swift.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f4ff5fd-79d4-4831-b221-77cc90bc93a2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
