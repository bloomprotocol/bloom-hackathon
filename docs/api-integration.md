# Frontend API Integration Guide

## Overview

This guide covers how the Bloom Protocol frontend integrates with the backend API.

## API Configuration

Base URL is configured in environment variables:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005  # Development
NEXT_PUBLIC_API_BASE_URL=https://bloom-protocol-be.railway.app  # Production
```

## API Service Layer

All API calls are organized in `/src/lib/api/services/`:

### Core Services

- **auth.service.ts** - Authentication and user management
- **projects.service.ts** - Project CRUD operations
- **reviews.service.ts** - Comments and reviews
- **missions.service.ts** - Task and mission management
- **referral.service.ts** - Referral system
- **points.service.ts** - Points and rewards

## Authentication

All authenticated requests require JWT token in headers:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

The token is managed by the `useUnifiedAuth` hook.

## Common Patterns

### 1. Server Components with Fetch
```typescript
// In page.tsx (server component)
async function getProjects() {
  const res = await fetch(`${API_URL}/projects/public`);
  return res.json();
}
```

### 2. Client Components with Services
```typescript
// In client component
import { projectsService } from '@/lib/api/services/projects.service';

const { data } = await projectsService.getProjectById(projectId);
```

### 3. React Query Integration
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['project', projectId],
  queryFn: () => projectsService.getProjectById(projectId)
});
```

## Error Handling

Standard API response format:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  statusCode: number;
}
```

## API Endpoints Reference

For complete API documentation, see:
- Frontend endpoints: `/BP_API_V0.1.md` (36 endpoints)
- Complete API: `/BP_API_Complete_V1.0.md` (97 endpoints)