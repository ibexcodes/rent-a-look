# Reset Admin Password (Firebase)

This repository includes a small Node script to reset an Auth user's password using the Firebase Admin SDK.

Prerequisites

- A Firebase project with Admin SDK service account JSON. Download from the Firebase Console -> Project Settings -> Service accounts.
- Node.js (16+ recommended).

Install

```bash
npm install firebase-admin
```

Usage

Option A: Run the script directly (service account JSON in project root as `serviceAccountKey.json`):

```bash
node scripts/reset-admin-password.js rentalook@gmail.com group2
```

Option B: Point to a service account path and/or use env vars:

```bash
export SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
export ADMIN_EMAIL=rentalook@gmail.com
export ADMIN_PASSWORD=group2
node scripts/reset-admin-password.js
```

Security notes

- Do not commit your service account JSON to source control.
- Treat the admin password and service account as secrets.
- Alternatively, use the Firebase Console to edit users manually or trigger the password reset email from the app's login page.

If you want, I can run a local test script, but you'll need to provide the service account JSON or run the script locally following the steps above.