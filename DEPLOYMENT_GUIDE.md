# Deployment Guide (Docker + Traefik)

Since your Hostinger VPS is running **Ubuntu 24.04 with Docker and Traefik**, we will use a containerized deployment. This is the most efficient and secure way to run your application.

---

## 1. Server Details
- **IP:** `72.60.202.195`
- **Hostname:** `srv1663020.hstgr.cloud`
- **Stack:** Docker, Traefik v2/v3

---

## 2. Preparation

### Step 1: Upload Code
Clone your repository to the server:
```bash
cd /root # or your preferred directory
git clone <your-repo-url>
cd lumas-creative-portfolio
```

### Step 2: Configure Environment
Create the `.env` file and fill in your credentials.
```bash
nano .env
```
Ensure `DATABASE_URL` is set to `"file:./prisma/dev.db"` (Docker will persist this).

---

## 3. Docker Configuration

I have already created the `Dockerfile` and `docker-compose.yml`. You just need to check the **Traefik labels** in `docker-compose.yml`.

### Adjust `docker-compose.yml`
Open the file:
```bash
nano docker-compose.yml
```
1.  **Network**: Change `traefik-public` if your Traefik network has a different name (often `proxy` or `traefik_network`).
2.  **Domain**: Change `yourdomain.com` to your actual domain.
3.  **CertResolver**: Change `letsencrypt` if your Traefik uses a different resolver name.

---

## 4. Deployment Commands

Run these commands to build and start your application:

```bash
# Ensure the Traefik network exists (if not external)
# docker network create traefik-public

# Build and start the container in detached mode
docker compose up -d --build
```

---

## 5. Persistence & Database

Your database and uploads are mapped to the host for persistence:
-   **Database**: `./prisma/dev.db`
-   **Uploads**: `./uploads/`

If you need to run Prisma commands inside the container:
```bash
docker exec -it lumas-portfolio npx prisma db push
```

---

## 6. Logs & Maintenance

To check if everything is running correctly:
```bash
# Check logs
docker compose logs -f

# Restart container
docker compose restart

# Stop container
docker compose down
```

---

## Troubleshooting

-   **Traefik Not Routing**: Verify that the container is on the same network as the Traefik container (`docker network inspect traefik-public`).
-   **Port 3001**: Docker internally uses 3001. Traefik will route traffic to this port automatically via labels.
-   **SSL Issues**: Check Traefik logs for Let's Encrypt certificate generation status.

---

**Lumas Creative Studio - 2026**
