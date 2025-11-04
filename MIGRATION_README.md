# Database Migration Guide

## Overview
This document explains how to perform database migrations for the Saanify application.

## Current Setup
- **Local Database**: SQLite with Prisma ORM
- **Target Database**: Supabase (PostgreSQL)
- **Migration Tool**: Supabase CLI + Custom Scripts

## Migration Steps

### 1. Setup Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Fill in your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migrations
```bash
# Make migration script executable
chmod +x scripts/run_migrations.sh

# Run migrations
./scripts/run_migrations.sh
```

### 4. Seed Database
```bash
# Run seed script
node scripts/create_admins.js

# Or use SQL seed
psql $SUPABASE_DB_URL -f db/seed.sql
```

## Migration Files
- `supabase/migrations/001_initial_schema.sql` - Initial database schema
- `db/seed.sql` - Seed data for development
- `scripts/create_admins.js` - Admin user creation script
- `scripts/run_migrations.sh` - Migration runner script

## Important Notes
- TODO: Replace all placeholder values with actual Supabase credentials
- TODO: Test migrations on staging environment first
- TODO: Backup existing data before running migrations
- TODO: Review RLS policies before production deployment

## Troubleshooting
- Ensure Supabase CLI is properly authenticated
- Check environment variables are correctly set
- Verify database permissions and roles
- Review migration logs for errors

## Next Steps
1. Complete TODO items in migration files
2. Test on staging environment
3. Plan production deployment strategy
4. Document any custom migration logic