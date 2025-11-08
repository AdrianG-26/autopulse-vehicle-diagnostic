# 🚀 Supabase Integration Setup Guide

## Overview
Both the **website** and **mobile app** have been updated to use **Supabase** as the primary database. This ensures cloud-synced data for your thesis demonstration.

## Environment Variables Required

### Website
Create `/website/.env`:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile App  
Create `/mobile-app/.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

1. Create Supabase project at https://supabase.com
2. Run `/src/supabase_schema.sql` in SQL Editor
3. Insert test vehicle (ID = 1)
4. Configure environment variables
5. Test both applications

## Next Steps

See SUPABASE_CHECKLIST.md for detailed setup instructions.
