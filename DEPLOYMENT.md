# FixMe Deployment Guide - Vercel + PostgreSQL

This guide will help you deploy the FixMe application to Vercel with a managed PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (free tier available at [vercel.com](https://vercel.com))
- Your FixMe repository pushed to GitHub

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your FixMe repository from GitHub
4. Vercel will automatically detect Next.js settings

**Important:** Do NOT deploy yet - we need to set up the database first.

## Step 3: Set Up Vercel Postgres Database

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **"Create Database"** → Select **"Postgres"**
3. Choose a database name (e.g., `fixme-db`)
4. Select a region close to your target users
5. Click **"Create"**

Vercel will automatically:
- Create a PostgreSQL database
- Add `DATABASE_URL` and other connection variables to your environment

## Step 4: Configure Environment Variables

Go to **Settings** → **Environment Variables** and add:

### Required Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | *Auto-populated* | Already set by Vercel Postgres |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Your production URL |
| `NEXTAUTH_SECRET` | `NmdyOFdMyAT5F+m0xfd7UahVg0bg+VZPdkhgmEfKfg0=` | Copy from your `.env` file |

### Optional Variables (recommended for production):

| Variable | Value | Notes |
|----------|-------|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID | For Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | For Google OAuth login |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | For AI repair diagnosis |

### Setting up Google OAuth (Optional):

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.vercel.app/api/auth/callback/google`
4. Copy Client ID and Client Secret to Vercel environment variables

## Step 5: Run Database Migrations

You have two options:

### Option A: Automatic (Recommended)

Add a build script to handle migrations automatically. Update `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Option B: Manual

1. In Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Copy the `DATABASE_URL` value
3. In your local terminal:

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgres://..."

# Run migrations
npx prisma migrate deploy

# Optional: Seed the database
npx prisma db seed
```

## Step 6: Deploy

1. Go back to your Vercel project
2. Click **"Deployments"** → **"Deploy"**
3. Or push to GitHub - Vercel will auto-deploy

Wait for the build to complete (usually 2-5 minutes).

## Step 7: Verify Deployment

1. Visit your deployment URL: `https://your-project.vercel.app`
2. Test the following:
   - ✅ Homepage loads
   - ✅ Categories are visible
   - ✅ Login/signup works
   - ✅ Creating a repair request works
   - ✅ Database queries work

## Step 8: Seed Production Database (Optional)

If you want sample data in production:

```bash
# Connect to your Vercel Postgres
export DATABASE_URL="<your-vercel-postgres-url>"

# Run seed
npx prisma db seed
```

## Troubleshooting

### Build Fails - Database Connection Error

**Problem:** Build fails with "Can't reach database server"

**Solution:**
- Make sure you created the Vercel Postgres database
- Check that `DATABASE_URL` is set in environment variables
- Try adding `?connection_limit=1` to your DATABASE_URL

### Migration Issues

**Problem:** "Migration history is inconsistent"

**Solution:**
```bash
# Reset migration history (WARNING: Development only!)
npx prisma migrate reset

# Or manually apply migrations
npx prisma migrate deploy
```

### App Builds But Shows Errors

**Problem:** App deploys but shows runtime errors

**Solution:**
- Check **Vercel Dashboard → Runtime Logs** for error details
- Verify all environment variables are set correctly
- Ensure `NEXTAUTH_URL` matches your actual domain

## Post-Deployment

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

### Monitoring

- Check **Analytics** tab for traffic metrics
- Review **Runtime Logs** for errors
- Monitor **Postgres** → **Usage** for database stats

### Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- `main` branch → Production
- Other branches → Preview deployments

## Cost Considerations

**Vercel Free Tier Includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Serverless functions

**Vercel Postgres Free Tier:**
- 256 MB storage
- 60 compute hours/month
- Limited to hobby projects

For production apps with high traffic, consider upgrading to Vercel Pro.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Deployment Checklist:**

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Postgres database created
- [ ] Environment variables configured
- [ ] Migrations deployed
- [ ] First deployment successful
- [ ] App tested in production
- [ ] Google OAuth configured (if needed)
- [ ] Custom domain added (if needed)

---

Generated: 2026-03-10
