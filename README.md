# JK Quotation System

Private quotation generator and editor for **JK Hydraulic & Engineering**.

## Included
- Private demo login
- Dashboard
- Create/Edit quotation
- Multiple line items
- Automatic amount, discount, GST and grand total calculations
- Save Draft
- Quotation history
- Search/filter
- Duplicate/Delete
- Preview
- Print / Save as PDF
- Word-compatible document export
- Responsive UI
- Express backend starter

## Demo login
Username: `admin`
Password: `admin123`

> This login is a frontend demo only. Before production use, replace it with secure server-side authentication.

## Run with VS Code

### Option 1 - Simple
Open `frontend/login.html` with Live Server.

### Option 2 - Node/Express
Open terminal in `backend`:

```bash
npm install
npm start
```

Then open:
`http://localhost:3000`

## Deploy to Vercel

This repository serves the static frontend from `frontend/` and exposes a health endpoint at `/api/health`.

### Deploy from GitHub
1. Import `kartiksh1526-cloud/invoice` in the Vercel dashboard.
2. Keep the project root directory as `.` and the framework preset as **Other**.
3. Leave the build and install commands empty; `vercel.json` configures the static files and API route.
4. Deploy. The site opens at `/`, and the health endpoint is available at `/api/health`.

You can also deploy from the repository root with the Vercel CLI:

```bash
npx vercel login
npx vercel
npx vercel --prod
```

## Important limitations
- Quotations and theme preference are stored in the current browser's `localStorage`; they are not shared between browsers or devices and are not backed up to a server.
- The included login is a demo-only client-side check, not production authentication. Do not use it to protect real or sensitive business data.

## Data
Version 1 stores quotations in the browser's localStorage so it works immediately without a database.

For production, add:
- Server-side authentication
- MongoDB/MySQL/PostgreSQL
- Secure sessions/JWT
- Cloud file storage
- Real `.docx` generation
- Server-side PDF generation
- User roles and audit log
- AI API integration

## Company details
JK HYDRAULIC & ENGINEERING
CSC Shop No. 7 & 8, F-Block, F-31, Phase-II, Mayapuri, New Delhi-110064
Phone: 9136661641 / 9643154611
Email: jkhydraulicandengineering@gmail.com
