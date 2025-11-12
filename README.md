# Inventory Management System - Production Version

This is the production-ready frontend for the Inventory Management System optimized for Vercel deployment.

## ⚠️ IMPORTANT: Always Run Commands from the Correct Folder

**This folder:** `E:\IT Project\InventAcctGO\inventory-production`

## Quick Deploy to Vercel

1. **Open Terminal and Navigate to Production Folder**
   ```bash
   cd E:\IT Project\InventAcctGO\inventory-production
   ```

2. **Upload to GitHub Repository** (Run these commands from the folder above)
   ```bash
   git init
   git add .
   git commit -m "Initial production setup"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project and deploy

## Configuration

### Environment Variables
The app is configured to use the production backend URL:
- `NEXT_PUBLIC_API_URL`: `https://inventory-accounting-backend-production.up.railway.app/api`

### Build Commands
Run these commands from `E:\IT Project\InventAcctGO\inventory-production`:
- `npm install`
- `npm run build`

## Features

- Complete Inventory Management System
- User Authentication & Authorization
- Master Data Management (Items, Customers, Suppliers, etc.)
- Transaction Processing (Purchase, Sales, etc.)
- Accounting Module
- Reporting System
- PDF/Excel Export
- Print Functionality

## Technology Stack

- Next.js 15.0.0
- React 19.0.0
- TypeScript
- Tailwind CSS
- Framer Motion
- jsPDF & jsPDF AutoTable
- XLSX for Excel export
- Lucide React Icons

## File Structure

```
inventory-production/
├── app/                    # Next.js app directory
├── components/             # React components
├── data/                   # Static data files
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and API functions
├── package.json           # Dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vercel.json            # Vercel deployment configuration
```

## Notes

- This version is optimized for production deployment
- All documentation and development files have been removed
- Node modules are excluded via .gitignore
- Ready for Vercel deployment under 100MB limit
- Backend API calls are configured for production Railway backend

## Development

1. **Navigate to Production Folder**
   ```bash
   cd E:\IT Project\InventAcctGO\inventory-production
   ```

2. **To run locally:**
   ```bash
   npm install
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Deployment Summary

- **Source Folder:** `E:\IT Project\InventAcctGO\inventory-production`
- **Git Commands:** Run from the production folder
- **NPM Commands:** Run from the production folder
- **Final Size:** 1.1 MB (under 100MB Vercel limit)