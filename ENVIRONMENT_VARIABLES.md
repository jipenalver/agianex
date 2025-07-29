# Environment Variables in Capacitor

## Overview

Capacitor supports environment variables through `.env` files, similar to standard web applications. Environment variables work consistently across web, Android, and iOS platforms.

## How It Works

### Web Platform

- Environment variables are loaded directly from `.env` files
- Vite processes the variables at build time
- Variables prefixed with `VITE_` are available in the client

### Native Platforms (Android/iOS)

- Environment variables are bundled during the build process
- Capacitor includes the variables in the built web assets
- Same `.env` file is used for both web and native builds

## File Structure

```project/
├── .env                 # Main environment file (not committed)
├── .env.example         # Template file (committed to repo)
├── .env.local           # Local overrides (not committed)
├── .env.production      # Production environment (not committed)
└── .env.development     # Development environment (optional)
```

## Environment Variable Usage

### Naming Convention

- All client-side variables must be prefixed with `VITE_`
- Example: `VITE_SUPABASE_URL`, `VITE_API_KEY`

### Accessing Variables

```typescript
// ✅ Correct way
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Wrong way (won't work)
const apiUrl = process.env.VITE_API_URL
```

## Current Configuration

### Updated supabase.ts

The Supabase configuration now uses environment variables consistently:

```typescript
// Before (platform-specific hardcoded values)
const isNativePlatform = Capacitor.getPlatform() === 'android'
const url = isNativePlatform ? 'hardcoded-url' : import.meta.env.VITE_SUPABASE_URL

// After (unified environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### Environment Variables Used

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE=your_service_role_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Benefits

### 1. Security

- No hardcoded secrets in source code
- Different keys for different environments
- Service role keys stay server-side

### 2. Maintainability

- Single source of truth for configuration
- Easy to update for different environments
- No platform-specific code branches

### 3. Development Workflow

- Local development with `.env.local`
- Production deployment with secure environment variables
- Team sharing with `.env.example`

## Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

### 2. Use Different Keys for Different Environments

```env
# Development
VITE_SUPABASE_URL=https://dev-project.supabase.co

# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
```

### 3. Validate Environment Variables

```typescript
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}
```

## Build Process

### Development

```bash
npm run dev
# Reads .env files automatically
```

### Production Build

```bash
npm run build
# Environment variables are bundled into the build
```

### Native Builds

```bash
npm run build
npx cap sync
npx cap open android
# Same environment variables work on native platforms
```

## Troubleshooting

### Variables Not Loading

1. Check variable names have `VITE_` prefix
2. Restart development server after adding new variables
3. Verify `.env` file is in project root

### Different Values on Native

1. Ensure `npm run build` is run before `cap sync`
2. Check that `.env` file exists during build
3. Verify no platform-specific code overrides

## Migration Complete

The codebase has been updated to use environment variables consistently across all platforms, removing hardcoded values and improving security and maintainability.
