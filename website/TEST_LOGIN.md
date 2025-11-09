# 🔍 Login Troubleshooting Guide

## Step 1: Check Browser Console

1. Open your browser (F12 to open DevTools)
2. Go to the **Console** tab
3. Try to login
4. Look for these messages:
   - `🔐 Simple login:` - Shows login attempt started
   - `🔍 Searching for user:` - Shows what's being searched
   - `❌ Query error:` - Shows database errors
   - `✅ Login successful:` - Shows successful login

## Step 2: Check if Users Table Exists

The most common issue is that the `users` table doesn't exist in Supabase.

### To Create the Users Table:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor**
3. Copy and paste the contents of `create_users_table.sql`
4. Click **Run**
5. Verify the table was created:
   - Go to **Table Editor**
   - You should see a `users` table

## Step 3: Check RLS Policies

If the table exists but login still fails:

1. Go to Supabase Dashboard → **Table Editor** → `users` table
2. Click on **Policies** tab
3. Make sure you have these policies:
   - **SELECT policy** - Allows reading users (for login)
   - **INSERT policy** - Allows creating users (for signup)
   - **UPDATE policy** - Allows updating users (for password change)

If policies are too restrictive, they might block login.

## Step 4: Verify User Exists

1. Go to Supabase Dashboard → **Table Editor** → `users` table
2. Check if your user exists:
   - Look for your username/email
   - Verify the password matches what you're entering

## Step 5: Test with Console

Open browser console and run:

```javascript
// Check what's stored in localStorage
JSON.parse(localStorage.getItem('autopulse_auth'))

// Check Supabase connection
// (This will show in console when you try to login)
```

## Common Error Messages:

- **"Users table does not exist"** → Run the SQL script to create it
- **"Permission denied"** → Check RLS policies in Supabase
- **"Invalid credentials"** → User doesn't exist or password is wrong
- **"Supabase is not configured"** → Check your `.env` file has correct Supabase URL and key

## Quick Fix:

If nothing works, try creating a test user directly in Supabase:

1. Go to Supabase → **Table Editor** → `users`
2. Click **Insert** → **Insert row**
3. Add:
   - `username`: testuser
   - `email`: test@example.com
   - `password`: test123
4. Try logging in with: `testuser` / `test123`

