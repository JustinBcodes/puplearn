# 🚀 Vercel Deployment Guide for PupLearn

Your code is ready and pushed to GitHub! Follow these steps to deploy your app to Vercel.

## ✅ Prerequisites Completed
- ✅ Code pushed to: `https://github.com/JustinBcodes/puplearn`
- ✅ Database provider updated to PostgreSQL
- ✅ Project structure ready for deployment

---

## 📝 Step-by-Step Deployment

### Step 1: Go to Vercel
1. Open your browser and go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** to connect your GitHub account
4. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Project
1. On the Vercel dashboard, click **"Add New..." → "Project"**
2. Find **`puplearn`** in the repository list
3. Click **"Import"**
4. Vercel will auto-detect it's a Next.js project ✅

### Step 3: Configure Environment Variables

**IMPORTANT:** Before deploying, click **"Environment Variables"** and add these:

#### Required Variables:

1. **`DATABASE_URL`** (PostgreSQL connection string)
   - Click **"Create Database"** in the Vercel UI
   - Choose **"Postgres"** (Vercel Postgres)
   - Name it: `puplearn-db`
   - Vercel will automatically add the `DATABASE_URL` environment variable ✅
   
   **OR** use an external PostgreSQL provider:
   ```
   postgresql://username:password@host:5432/database?schema=public
   ```

2. **`NEXTAUTH_SECRET`** (Authentication secret)
   - Generate a secure secret:
     ```bash
     openssl rand -base64 32
     ```
   - Copy the output and paste it as the value
   - Example: `abc123xyz789...` (yours will be different)

3. **`NEXTAUTH_URL`** (Your production URL)
   - Use: `https://YOUR_PROJECT_NAME.vercel.app`
   - **Note:** You'll update this after first deploy when you know your URL
   - For now, you can leave it blank or use a placeholder

### Step 4: Deploy!
1. Review your settings:
   - **Framework Preset:** Next.js ✅
   - **Build Command:** `next build` ✅
   - **Output Directory:** `.next` ✅
   - **Install Command:** `npm install` ✅

2. Click **"Deploy"** 🚀

3. Wait 2-3 minutes for the build to complete

### Step 5: Set Up Database Schema
After your first deployment:

1. In your Vercel project dashboard, go to **"Settings" → "Environment Variables"**
2. Make sure `DATABASE_URL` is set (should be automatic if you created Vercel Postgres)
3. Run database migrations:

   **Option A: Using Vercel CLI (Recommended)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link project
   vercel link
   
   # Run migration
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

   **Option B: Using Vercel's Terminal**
   - Go to your project → Settings → General
   - Scroll to "Deployment Protection"
   - Or deploy again and it should run migrations automatically

### Step 6: Update NEXTAUTH_URL
1. After deployment, copy your live URL (e.g., `https://puplearn.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Edit `NEXTAUTH_URL` and set it to your live URL
4. Click **"Save"**
5. Redeploy by going to **Deployments** and clicking **"Redeploy"** on the latest deployment

---

## 🎉 Your App is Live!

Your PupLearn app should now be accessible at:
```
https://your-project-name.vercel.app
```

### Test Your Deployment:
1. ✅ Visit the URL
2. ✅ Sign up for a new account
3. ✅ Create a study set
4. ✅ Add flashcards
5. ✅ Try Study Mode and Learn Mode

---

## 🔧 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Make sure you're using PostgreSQL, not SQLite
- Check Vercel Postgres is provisioned and connected

### Authentication Issues
- Confirm `NEXTAUTH_SECRET` is set (generate with `openssl rand -base64 32`)
- Verify `NEXTAUTH_URL` matches your production URL exactly (with https://)
- Check browser console for error messages

### Build Failures
- Check the build logs in Vercel dashboard
- Common issues:
  - Missing environment variables
  - TypeScript errors (run `npm run build` locally first)
  - Prisma client not generated (should happen automatically)

### "Server Error" on Pages
- Check the **Functions** tab in Vercel for error logs
- Verify database migrations ran successfully
- Make sure all API routes are working

---

## 🚀 Automatic Deployments

Vercel automatically deploys your app when you push to GitHub!

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Vercel automatically deploys! 🎉
```

---

## 📊 Monitoring & Logs

View logs and analytics:
1. Go to your project in Vercel dashboard
2. Click **"Deployments"** to see build history
3. Click **"Functions"** to see API logs
4. Click **"Analytics"** for traffic insights

---

## 🎯 Next Steps

1. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Share Your App**
   - Copy your live URL
   - Share with friends!
   - They can sign up and create their own study sets

3. **Monitor Usage**
   - Check Vercel dashboard for analytics
   - Monitor database usage in Vercel Postgres dashboard

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**🎓 Happy Learning with PupLearn! 🐕**

