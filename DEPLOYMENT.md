# Vercel Deployment Guide

This guide will help you deploy the All Access Remodelers website to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (recommended providers):
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Easiest option, integrated with Vercel
   - [Neon](https://neon.tech/) - Serverless PostgreSQL
   - [Supabase](https://supabase.com/) - Includes additional features
3. An OpenAI API key (get one at https://platform.openai.com)

## Step 1: Prepare Your Repository

1. Make sure all your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Push your code to the remote repository

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com and log in
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect the settings, but verify:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy (from project root):
```bash
vercel
```

4. Follow the prompts to link your project

5. Deploy to production:
```bash
vercel --prod
```

## Step 3: Set Up Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname` |
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `SESSION_SECRET` | Random string for session encryption | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | Environment mode | `production` |

### Setting Environment Variables

1. Click **Add New** for each variable
2. Enter the **Key** (variable name)
3. Enter the **Value**
4. Select which environments (Production, Preview, Development)
5. Click **Save**

**Important:** After adding environment variables, you must redeploy for them to take effect.

## Step 4: Set Up Your Database

### Using Vercel Postgres

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Follow the setup wizard
4. Vercel will automatically add the `DATABASE_URL` to your environment variables

### Using External Database

1. Create a PostgreSQL database with your preferred provider
2. Copy the connection string
3. Add it as `DATABASE_URL` in Vercel environment variables

### Run Database Migrations

After setting up your database, you need to push the schema:

```bash
# Install dependencies locally
npm install

# Set your DATABASE_URL locally
export DATABASE_URL="your-database-url"

# Push the schema
npm run db:push
```

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL (e.g., `your-project.vercel.app`)
2. Test all pages and features:
   - Homepage loads correctly
   - Navigation works
   - Chat widget functions (tests OpenAI integration)
   - Quote estimator works
   - All service pages are accessible

## Step 6: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain name
4. Follow instructions to configure DNS records
5. Vercel will automatically provision SSL certificates

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run check`

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Check if your database allows connections from Vercel's IP addresses
- Ensure database schema is pushed: `npm run db:push`

### OpenAI Integration Not Working

- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API key has available credits
- Review server logs in Vercel dashboard

### Environment Variables Not Taking Effect

- Redeploy after adding/changing environment variables
- Check variables are set for the correct environment (Production/Preview)

## Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

- **Push to main/master branch** → Deploys to production
- **Push to other branches** → Creates preview deployment
- **Pull requests** → Automatic preview deployments

## Monitoring and Logs

- **Runtime Logs**: Vercel dashboard → Project → Deployments → Select deployment → Logs
- **Analytics**: Vercel dashboard → Project → Analytics
- **Performance**: Monitor in Vercel Speed Insights (if enabled)

## Local Development vs Production

Your `.env.example` file shows required variables. For local development:

```bash
cp .env.example .env
# Edit .env with your local values
npm run dev
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Create an issue in your Git repository

## Cost Considerations

- **Vercel**: Free tier includes generous limits, paid plans for additional features
- **Database**: Check pricing for your chosen provider
- **OpenAI**: Pay-per-use based on API calls

Review your usage regularly to avoid unexpected costs.
