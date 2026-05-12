# Comprehensive Deployment Guide (Docker + Traefik)

This guide provides a detailed, step-by-step process to deploy your Lumas Creative Portfolio on a Hostinger VPS (Ubuntu 24.04) using Docker and Traefik.

---

## 1. Prerequisites
Before starting, ensure you have:
- Access to your Hostinger VPS via SSH.
- Your Domain Name (e.g., `lumascreative.com`) pointed to the VPS IP (`72.60.202.195`).
- Traefik already running on your server (Hostinger's default Docker + Traefik template).

---

## 2. Step-by-Step Deployment

### Step 1: Connect to your Server
Open your terminal (PowerShell, CMD, or Terminal) and log in to your VPS:
```bash
ssh root@72.60.202.195
```
*(Enter your root password when prompted)*

### Step 2: Create the Project Directory
We will store the project in `/var/www/Lumas Creative` to keep it organized.
```bash
# Create the directory
mkdir -p "/var/www/Lumas Creative"

# Navigate into the directory
cd "/var/www/Lumas Creative"
```

### Step 3: Clone the Repository
Download your code from GitHub into the current folder:
```bash
git clone https://github.com/s21gem/lumasfinal.git .
```
*(The `.` at the end ensures it clones files directly into 'Lumas Creative' instead of creating another subfolder)*

### Step 4: Configure Environment Variables
You must create a `.env` file to store your secrets.
```bash
nano .env
```
Copy and paste the following, then edit the values:
```env
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="generate_a_long_random_string_here"

# Cloudinary (Required for image/video storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# WhatsApp (Optional)
WHATSAPP_PHONE_NUMBER="your_number"
WHATSAPP_API_KEY="your_key"
```
*Press `Ctrl + O`, `Enter` to save, and `Ctrl + X` to exit.*

### Step 5: Customize Docker Configuration
The `docker-compose.yml` needs to know your domain to tell Traefik how to route traffic.
```bash
nano docker-compose.yml
```
Look for the `labels` section and update these:
1.  `Host(`lumascreative.com`)` -> Already updated for you in the file.
2.  `traefik.http.routers.lumas.tls.certresolver=letsencrypt` -> Verify if your Traefik uses `letsencrypt` or another name (e.g., `myresolver`).
3.  `networks: - traefik-public` -> Verify your Traefik network name (`docker network ls`).

### Step 6: Deploy the Application
Now, let Docker build the image and start the container.
```bash
# Build the container (this might take a few minutes the first time)
docker compose up -d --build
```
*The `-d` flag runs it in the background.*

### Step 7: Initialize the Database
Once the container is running, you need to sync the database schema.
```bash
docker exec -it lumas-portfolio npx prisma db push
```

---

## 3. Post-Deployment Checks

### Verify the App is Running
Check the status of your container:
```bash
docker ps
```
You should see `lumas-portfolio` with a status of `Up`.

### Check Logs
If the website doesn't load, check the logs for errors:
```bash
docker compose logs -f
```

### Accessing the Website
Open your browser and go to `https://yourdomain.com`. 
- Traefik will automatically handle the SSL (HTTPS) certificate.
- The Admin panel will be available at `https://yourdomain.com/admin`.

---

## 4. Common Maintenance Commands

**To update the website after pushing new code to GitHub:**
```bash
git pull
docker compose up -d --build
```

**To restart the app:**
```bash
docker compose restart
```

**To stop the app:**
```bash
docker compose down
```

---

## 5. Directory Structure on Server
```text
/var/www/Lumas Creative/
├── Dockerfile
├── docker-compose.yml
├── .env
├── prisma/
│   └── dev.db  <-- (Your Database File - Safe here)
├── uploads/    <-- (Uploaded Files - Safe here)
└── ...
```

---

**Prepared by Antigravity AI - 2026**
