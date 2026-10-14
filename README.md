# JK Quotation System

Quotation management for **JK Hydraulic & Engineering**, with a browser-stored product catalog.

## Product catalog

- The first visit to **My Items** or the invoice editor adds the 36 built-in products to browser storage.
- Catalog initialization is repeatable: saved product details are not overwritten.
- Catalog fields include product name, category, unit, selling price, GST rate, HSN/SAC code and description. Price, GST and HSN/SAC are intentionally blank until configured.
- **My Items** supports search, category filtering, add/edit/delete, and a quick Edit Price action.
- Invoice item search matches product names. Selecting an item fills its saved description, unit, configured price, GST and HSN/SAC. Invoice-specific changes do not update the catalog.
- Item discounts and per-item GST are calculated into taxable amounts, tax and the invoice total. A blank rate or tax is treated as zero until entered.
- Existing quotation drafts, history, print/PDF and Word-compatible downloads continue to use the browser’s saved quotation data.

## Storage

Products and quotations are saved in this browser's `localStorage`; no database connection or product API is used. Data does not automatically sync between browsers or devices. Clearing this browser's site data can remove the catalog and saved quotations.

## Run locally

Use Node.js 20 or newer:

```bash
npm install
npm start
```

Open `http://localhost:3000`. The dashboard opens directly, without login. You can also open the frontend with a static file server; product catalog functions run in the browser.

## Deploy to Vercel

1. Import `kartiksh1526-cloud/invoice` with the repository root (`.`) as the project root and **Other** as the framework preset.
2. Keep the configured output directory as `frontend` (as set in `vercel.json`).
3. Deploy the static site.
4. Open **My Items** to edit the 36 preloaded products, or add your own items.

Catalog and quotation data are stored only in browser `localStorage`; they are not synchronized between devices.
