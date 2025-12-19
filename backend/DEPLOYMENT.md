# Backend Deployment Guide

## ✅ Your backend is READY to deploy!

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Steps:**
1. Install Vercel CLI (if not installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy from backend directory:
   ```bash
   cd backend
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `PORT` = 3001 (optional, Vercel handles this)
   - `SOLANA_RPC_URL` = https://api.devnet.solana.com
   - `PROGRAM_ID` = 8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb
   - `JWT_SECRET` = your-secure-secret-key
   - `MODEL_STORAGE_PATH` = /tmp/models
   - `MAX_MODEL_SIZE_MB` = 500
   - `RATE_LIMIT_PER_HOUR` = 100

4. For Arweave wallet:
   - Base64 encode your wallet: `cat wallet.json | base64`
   - Add as environment variable: `ARWEAVE_WALLET_JSON` = (base64 string)
   - Update code to use `ARWEAVE_WALLET_JSON` instead of file path

5. Deploy:
   ```bash
   vercel --prod
   ```

**Vercel Features:**
- ✅ Auto HTTPS
- ✅ Auto scaling
- ✅ Edge network (fast globally)
- ✅ Free tier available
- ✅ Easy environment variables

---

### Option 2: Railway

**Steps:**
1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   cd backend
   railway init
   ```

3. Add environment variables:
   ```bash
   railway variables set SOLANA_RPC_URL=https://api.devnet.solana.com
   railway variables set PROGRAM_ID=8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb
   # ... add all other variables
   ```

4. Deploy:
   ```bash
   railway up
   ```

**Railway Features:**
- ✅ Persistent storage
- ✅ Database support
- ✅ Better for long-running processes
- ✅ Free tier: $5/month credit

---

### Option 3: Render

**Steps:**
1. Go to https://render.com
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory:** backend
   - **Build Command:** npm install && npm run build
   - **Start Command:** npm start
   - **Node Version:** 18

5. Add environment variables in Render dashboard

**Render Features:**
- ✅ Free tier available
- ✅ Auto deploy from GitHub
- ✅ Good for microservices

---

### Option 4: DigitalOcean App Platform

**Steps:**
1. Go to https://cloud.digitalocean.com/apps
2. Create new app from GitHub
3. Select backend directory
4. Configure environment variables
5. Deploy

**DigitalOcean Features:**
- ✅ $5/month basic plan
- ✅ More control than Vercel
- ✅ Can add databases, redis, etc.

---

## Environment Variables Checklist

Make sure to set these on your deployment platform:

### Required:
- [x] `SOLANA_RPC_URL` = https://api.devnet.solana.com
- [x] `PROGRAM_ID` = 8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb
- [x] `JWT_SECRET` = (generate secure random string)

### Optional but Recommended:
- [ ] `PORT` = 3001 (some platforms set this automatically)
- [ ] `MODEL_STORAGE_PATH` = /tmp/models
- [ ] `MAX_MODEL_SIZE_MB` = 500
- [ ] `RATE_LIMIT_PER_HOUR` = 100
- [ ] `ARWEAVE_WALLET_JSON` = (base64 encoded wallet)
- [ ] `IPFS_API_URL` = https://ipfs.infura.io:5001

---

## Pre-Deployment Checklist

### ✅ Code Ready:
- [x] TypeScript compiles without errors
- [x] All routes tested and working
- [x] Smart contract integration verified
- [x] Error handling implemented
- [x] CORS configured

### ✅ Configuration:
- [x] vercel.json created
- [x] .env.example provided
- [x] .gitignore updated
- [x] package.json has correct scripts

### ✅ Security:
- [x] Sensitive data in environment variables
- [x] Rate limiting implemented
- [x] CORS properly configured
- [x] JWT secrets not in code

---

## After Deployment

1. **Get your backend URL** (e.g., https://your-backend.vercel.app)

2. **Update frontend environment:**
   ```bash
   # In frontend/.env.production
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```

3. **Test endpoints:**
   ```bash
   curl https://your-backend.vercel.app/health
   curl https://your-backend.vercel.app/api/models
   ```

4. **Update CORS if needed:**
   If you get CORS errors, add your frontend domain to allowed origins in backend code.

---

## Recommended: Vercel Deployment

For the fastest deployment, I recommend **Vercel**:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd backend
vercel

# 3. Follow prompts, then set environment variables
# 4. Deploy to production
vercel --prod
```

Your backend will be live at: `https://your-project.vercel.app`

---

## Troubleshooting

**Build fails:**
- Check all dependencies are in package.json
- Verify TypeScript compiles locally: `npm run build`

**Runtime errors:**
- Check environment variables are set
- Review logs in deployment platform dashboard

**Connection issues:**
- Verify Solana RPC is accessible from deployed server
- Check network/firewall settings

---

## Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel | 100GB bandwidth/month | $20/mo Pro |
| Railway | $5/mo credit | $0.000231/GB-sec |
| Render | Free with limits | $7/mo basic |
| DigitalOcean | $0 trial credit | $5/mo minimum |

**Recommendation:** Start with Vercel free tier, upgrade if needed.
