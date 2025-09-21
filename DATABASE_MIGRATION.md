# Database Migration Guide

This project has been migrated from in-memory storage to persistent database storage with graceful fallback.

## 🎯 What Changed

The application now supports persistent database storage while maintaining backward compatibility:

- **Before**: Data stored in memory - resets on every server restart
- **After**: Data persists in PostgreSQL database across restarts

## 🚀 Quick Start

### Option 1: Continue with In-Memory Storage (Development)
```bash
# No changes needed - runs with in-memory fallback
npm run dev
```

### Option 2: Enable Database Persistence (Production)

1. **Set up a PostgreSQL database** (e.g., Neon, Railway, Supabase)

2. **Set the DATABASE_URL environment variable**:
```bash
export DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

3. **Run database migrations**:
```bash
npm run db:push
```

4. **Start the server**:
```bash
npm run dev
# or
npm start
```

## 🏗️ Database Schema

The following tables are created automatically:

- **users** - User accounts (admin/student roles)
- **questions** - MCQ, coding, and CTF challenges  
- **submissions** - User submission history
- **activities** - System activity logs

## 🔧 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | No* | `postgresql://user:pass@host:5432/db` |

*If not provided, the app falls back to in-memory storage

## 🛠️ Available Commands

```bash
# Generate new migration after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Check TypeScript compilation
npm run check

# Build production bundle
npm run build

# Start production server
npm start
```

## 🔄 Migration Details

### Database Tables Created:
1. **users** - Stores user accounts with roles and progress
2. **questions** - All question types with type-specific JSON fields
3. **submissions** - User submissions with correctness and timing
4. **activities** - Audit log for system events

### Data Migration:
- Default admin user: `username: aditya, password: QAZwsx@12@`
- Pre-loaded with 50+ sample questions
- Test student account for development

### Fallback Behavior:
- If database connection fails, automatically uses in-memory storage
- No API changes or breaking functionality
- Logs indicate which storage method is active

## 🚨 Important Notes

1. **Production Setup**: Always use a real DATABASE_URL in production
2. **Data Persistence**: Only works with valid database connection
3. **Migrations**: Run `npm run db:push` after setting up DATABASE_URL
4. **Backup**: Database data should be backed up regularly in production

## 🐛 Troubleshooting

### "Failed to initialize database" Error
- Check DATABASE_URL format
- Verify database server is accessible
- Ensure database exists and credentials are correct
- App will fallback to memory storage automatically

### Missing Tables Error
- Run `npm run db:push` to create tables
- Check database permissions
- Verify migration files in `migrations/` folder

### Connection Timeout
- Check network connectivity to database
- Verify SSL requirements (add `?sslmode=require` for cloud databases)
- App will fallback to memory storage on timeout