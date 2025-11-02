# AutoPulse Setup Guide

## Verifying User Signup and Database Integration

This guide will help you verify that the signup process is correctly saving email and password data to your Supabase database.

## Step 1: Set Up Database Schema

Run the SQL in `database_schema.sql` in your Supabase SQL Editor to create the necessary tables and triggers.

### Key Tables Created:
- **auth.users** (managed by Supabase automatically)
- **public.users** (your app's user profiles)

## Step 2: Verify Signup Flow

### What Happens When a User Signs Up:

1. **Email and Password are collected** from the signup form
2. **Supabase Auth creates the user** in `auth.users` table with:
   - Email (stored as-is)
   - Password (automatically hashed by Supabase)
3. **Database trigger automatically creates** a profile in `public.users` table
4. **User is authenticated** and can access the app

### How to Verify:

#### Option A: Check Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. You should see all registered users with their emails
4. Click on a user to see their details (password is hashed, so it won't be visible)

#### Option B: Check Database Tables

1. Go to **Table Editor** in Supabase
2. Open the **users** table
3. You should see entries with:
   - `id` (UUID from auth.users)
   - `email` (the email address used for signup)
   - `username` (auto-generated from email)
   - `role` (defaults to 'user')
   - `created_at` (timestamp)

#### Option C: Use Supabase SQL Editor

Run this query to see all registered users:

```sql
SELECT 
  u.id,
  u.email,
  u.username,
  u.role,
  u.created_at
FROM users u
ORDER BY u.created_at DESC;
```

## Step 3: Test Signup Process

1. Open your app and navigate to the signup screen
2. Enter an email (e.g., `test@example.com`) and password (at least 6 characters)
3. Click "Create Account"
4. Check your Supabase dashboard to verify the user was created

## Important Notes

### Password Security
- Passwords are **never** stored in plain text
- Supabase uses **bcrypt** hashing algorithm
- You can never see the actual password, only reset it

### Email Storage
- Email is stored in both `auth.users.email` (for authentication)
- And `public.users.email` (for your app's use)

### Database Trigger
The trigger `on_auth_user_created` automatically:
- Creates a profile record when a new user signs up
- Extracts username from email (part before @)
- Sets default role to 'user'

## Troubleshooting

### Issue: User can sign up but profile is not created
**Solution:** Check if the database trigger was created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Issue: "Error creating user profile" in console
**Solution:** 
- Check RLS policies are correct
- Verify the trigger is active
- Check Supabase logs for detailed error messages

### Issue: User can sign up but not sign in
**Solution:**
- Check if email confirmation is required in Supabase settings
- Disable email confirmation for development: Settings > Auth > Email Templates

## Environment Variables

Make sure these are set in your `app.json`:

```json
"extra": {
  "EXPO_PUBLIC_SUPABASE_URL": "your-project-url",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
}
```

## Security Best Practices

1. ✅ Passwords are automatically hashed by Supabase
2. ✅ Row Level Security (RLS) is enabled on all tables
3. ✅ Users can only access their own data
4. ✅ API keys are stored in environment variables
5. ✅ Never log or display passwords

## Next Steps

Once signup is working:
1. Test the login flow
2. Create vehicles for users
3. Add telemetry data
4. Set up alerts and notifications
