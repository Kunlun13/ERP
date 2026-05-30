# Deployment Guide

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/school_erp
JWT_SECRET=use_a_long_random_string_here
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

```env
VITE_API_URL=https://your-api-domain.com/api
```

## MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP (0.0.0.0/0 for cloud deploy)
4. Copy connection string to MONGODB_URI

## Backend Deployment (Railway / Render / VPS)

```bash
cd backend
npm install --production
npm run seed   # First deploy only
npm start
```

- Ensure `uploads/` directory is writable (or use S3 for production)
- Set all environment variables in hosting dashboard
- Use PM2 on VPS: `pm2 start src/server.js --name school-erp`

## Frontend Deployment (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Vercel

1. Import Git repo
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output: `dist`
5. Add `VITE_API_URL` env variable

## Nginx Reverse Proxy (VPS)

```nginx
server {
    listen 80;
    server_name api.yourschool.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        client_max_body_size 10M;
    }
}
```

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS in production
- [ ] Restrict CORS CLIENT_URL to your domain
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Never commit .env files
- [ ] Set NODE_ENV=production

## Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb://..." --out=./backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://..." ./backup/20250521
```

## Health Check

```bash
curl https://api.yourschool.com/api/health
```
