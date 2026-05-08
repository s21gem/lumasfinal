# Lumas Creative Portfolio — CMS Setup Guide

This project has been upgraded from a static React template to a fully dynamic MERN-stack application powered by an SQLite database and Prisma ORM. Every element on the website is now manageable through the `/admin` portal.

## Prerequisites
- Node.js v18+
- Cloudinary Account (for image & video hosting)
- SMTP Account (e.g. Gmail App Passwords, SendGrid, Resend) for contact forms

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
# Database (SQLite is stored locally)
DATABASE_URL="file:./prisma/dev.db"

# Admin Authentication
JWT_SECRET="your-super-secret-key-change-this"

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# SMTP Settings (For Contact Form)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
CONTACT_RECEIVER_EMAIL="hello@lumascreative.com" # Where contact forms will be sent
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   This will create your SQLite database file (`dev.db`) based on the Prisma schema.
   ```bash
   npx prisma db push
   ```

3. **Create the Admin Account**
   Before you can log in, you must run the admin creation script.
   ```bash
   npx tsx scripts/createAdmin.ts
   ```
   Follow the prompts to create your admin email and password.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## Admin Portal Features
Once running, navigate to `http://localhost:3000/admin`.
- **Site Settings**: Control the Hero section text/video, logos, footer text, SEO metadata, and contact info (WhatsApp, Calendly).
- **Projects**: Manage portfolio items. Supports both image and video uploads directly to Cloudinary.
- **Services, Process, Team**: Full CRUD support with dynamic icons and descriptions.
- **Testimonials**: Paginated reviews (2 per page) with direct media uploads.
- **Trusted Brands**: Manage the scrolling marquee at the bottom of the hero section.

## Deployment on VPS (Nginx + PM2)
Since this uses SQLite, deployment is very straightforward.

1. Clone repo onto your VPS.
2. Run `npm install` and `npm run build`.
3. Create your `.env` file on the server.
4. Run `npx prisma db push`.
5. Start the backend with PM2: `pm2 start dist/server.js --name "lumas-portfolio"`.
6. Configure Nginx to reverse proxy port 80 to `http://localhost:3000` and serve static files from `dist/public`.
