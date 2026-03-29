# Authentication & User Data Hooks

This directory contains hooks for managing authentication and user data using a hybrid approach that optimizes for both performance and data freshness.

## Hybrid Approach Overview

### 1. **Fast Authentication Checks (Cookies)**
Use `useAuthGuard` for:
- Checking authentication status
- Role-based routing decisions
- Displaying wallet address
- Initial page renders (SSR compatible)

### 2. **Rich Profile Data (React Query)**
Use `useUserProfile` for:
- Displaying points/statistics
- Showing mission progress
- Loading detailed user profile
- Any data that changes frequently

## Usage Examples

### Basic Authentication Check
```tsx
import { useAuthGuard } from '@/lib/hooks';

function MyComponent() {
  const { isAuthenticated, walletAddress, hasRole } = useAuthGuard();
  
  if (!isAuthenticated) {
    return <div>Please connect your wallet</div>;
  }
  
  if (!hasRole('BUILDER')) {
    return <div>Builder access required</div>;
  }
  
  return <div>Welcome {walletAddress}</div>;
}
```

### Displaying User Points
```tsx
import { useUserProfile } from '@/lib/hooks';

function PointsDisplay() {
  const { points, miniPoints, isLoading } = useUserProfile();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <p>Points: {points}</p>
      <p>Mini Points: {miniPoints}</p>
    </div>
  );
}
```

### Combined Usage
```tsx
import { useAuthGuard, useUserProfile } from '@/lib/hooks';

function ProfileHeader() {
  // Fast auth check
  const { isAuthenticated, walletAddress } = useAuthGuard();
  
  // Rich profile data
  const { points, referralCode, isLoading } = useUserProfile();
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div>
      <h1>Wallet: {walletAddress}</h1>
      {isLoading ? (
        <p>Loading profile...</p>
      ) : (
        <>
          <p>Points: {points}</p>
          <p>Referral Code: {referralCode || 'Generate one!'}</p>
        </>
      )}
    </div>
  );
}
```

### Mission Data
```tsx
import { useCurrentMissions, useSelectedMission } from '@/lib/hooks';

function MissionList() {
  const { missions, isLoading } = useCurrentMissions();
  const { mission: selectedMission } = useSelectedMission();
  
  if (isLoading) return <div>Loading missions...</div>;
  
  return (
    <div>
      <h2>Active Missions</h2>
      {missions.map(mission => (
        <div key={mission.id}>
          {mission.title}
          {mission.id === selectedMission?.id && <span> (Selected)</span>}
        </div>
      ))}
    </div>
  );
}
```

## Hook Reference

### useAuthGuard
- **Purpose**: Fast, synchronous auth checks from cookies
- **Returns**: `{ isAuthenticated, isLoading, userId, walletAddress, roles, hasRole }`
- **Use when**: Routing, guards, basic UI elements

### useUserProfile
- **Purpose**: Rich profile data from API (cached)
- **Returns**: `{ profile, points, miniPoints, referralCode, isLoading, error, refetch }`
- **Use when**: Displaying dynamic user data

### useHasRole
- **Purpose**: Check if user has specific role(s)
- **Returns**: `boolean`
- **Use when**: Role-based UI elements

### useCurrentMissions / useCompletedMissions
- **Purpose**: Get mission lists
- **Returns**: `{ missions, isLoading }`
- **Use when**: Displaying mission lists

## Best Practices

1. **Always use `useAuthGuard` for routing decisions** - It's synchronous and fast
2. **Use `useUserProfile` only in components that need the data** - Avoid unnecessary API calls
3. **Combine both hooks when needed** - Auth for access, profile for data
4. **Handle loading states properly** - Profile data is async
5. **Don't duplicate data fetching** - Use React Query's caching

## Migration Guide

If you're currently using `useAuth()` directly:

```tsx
// Old way
const { isAuthenticated, user } = useAuth();
const points = user?.points; // This doesn't exist in cookies!

// New way
const { isAuthenticated } = useAuthGuard(); // For auth check
const { points } = useUserProfile(); // For points data
```