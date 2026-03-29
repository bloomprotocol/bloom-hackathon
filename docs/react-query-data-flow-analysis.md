# React Query Data Flow Analysis - Bloom Protocol Frontend

## Executive Summary

The Bloom Protocol frontend uses React Query (TanStack Query) as the primary data fetching and state management solution. The architecture demonstrates a well-structured approach with clear separation of concerns, optimistic updates, and efficient caching strategies.

## 1. React Query Setup and Configuration

### Query Client Configuration
- **Location**: `src/app/layout.tsx`
- **Configuration**:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
      },
    },
  });
  ```
- **Key Settings**:
  - Stale time: 15 minutes (data considered fresh)
  - Retry: 1 attempt on failure
  - Client is created with `useState` to ensure singleton instance

### Provider Hierarchy
```
QueryClientProvider
└── PrivyClientProvider
    └── AuthContextProvider
        └── UserProfileProvider
            └── MenuProvider
                └── ModalProvider
                    └── App Components
```

## 2. API Client Architecture

### Axios Instance Configuration (`apiConfig.ts`)
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Features**:
  - Automatic token injection from cookies/localStorage
  - Request/response interceptors
  - Timeout handling (10 seconds)
  - Network error retry logic
  - 401 unauthorized event dispatching

### Typed API Methods
```typescript
export const apiGet = <T>(url: string, config?: AxiosRequestConfig)
export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig)
export const apiPut = <T>(url: string, data?: unknown, config?: AxiosRequestConfig)
export const apiDelete = <T>(url: string, config?: AxiosRequestConfig)
```

## 3. Data Fetching Patterns

### Service Layer Pattern
Each domain has a dedicated service file (e.g., `projectService.ts`) that:
- Defines TypeScript interfaces for all data types
- Implements API methods with clear documentation
- Handles request/response transformation
- Example:
  ```typescript
  projectService.getProjectList(query?: ProjectListQuery): Promise<ProjectListResponse>
  ```

### Custom Hook Pattern
Domain-specific hooks wrap React Query functionality:
- **Naming Convention**: `use[Domain][Action]` (e.g., `usePublicProjects`)
- **Features**:
  - Encapsulates query keys
  - Handles parameter transformation
  - Sets domain-specific cache times
  - Example:
  ```typescript
  export function usePublicProjects(params: PublicProjectsParams) {
    return useQuery({
      queryKey: ['public-projects', params],
      queryFn: async () => apiGet(`/public/projects?${queryParams}`),
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  ```

## 4. Data Flow Examples

### Projects Page Flow
1. **Page Component** (`projects/page.tsx`)
   - Server component renders initial layout
   - Passes control to client component

2. **List Component** (`ProjectsList.tsx`)
   - Uses `usePublicProjects` hook
   - Manages local state for filters/pagination
   - Renders loading/error states

3. **Data Fetching**
   - Hook builds query key with parameters
   - React Query checks cache first
   - If stale/missing, calls API via service layer
   - Response cached based on query key

### Dashboard Data Flow
1. **Context Provider** (`UserProfileProvider`)
   - Uses `useProfileInitialData` hook
   - Manages selected mission state
   - Provides data to child components

2. **Nested Data Fetching**
   - Initial profile data fetched on mount
   - Mission details fetched when selected
   - Separate query keys prevent conflicts

3. **Cache Updates**
   - Optimistic updates for user actions
   - Manual cache updates after mutations
   - Query invalidation for data refresh

## 5. State Management Integration

### Authentication State
- **AuthContext** manages authentication
- Provides user data to query hooks
- Query keys include user ID for cache separation
- Example:
  ```typescript
  const queryKey = ['projects', {
    page: options.page,
    limit: options.limit,
    status: options.status,
    ...(user ? { userId: user.uid } : {})
  }];
  ```

### Global Data Access Pattern
- Utility function `extractGlobalDataAccessLogic`
- Accesses React Query cache directly
- Determines user permissions based on cached data
- No additional API calls needed

## 6. Mutation Patterns

### Review Mutations Example
```typescript
const createReviewMutation = useMutation({
  mutationFn: async (params) => reviewService.createReview(params),
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['reviews', projectId] });
    queryClient.invalidateQueries({ queryKey: ['public-project-reviews', projectSlug] });
    toast.success('Review submitted successfully');
  },
  onError: (error) => {
    toast.error('Failed to submit review');
  },
});
```

### Optimistic Updates
- Dashboard operations use `setQueryData` for immediate UI updates
- Example: Claiming rewards updates points immediately
- Rollback handled in error cases

## 7. Performance Optimizations

### Caching Strategy
- **Default**: 15 minutes stale time
- **Projects**: 2 minutes (frequently changing)
- **User Profile**: 10 minutes (less frequent changes)
- **Mission Details**: 10 minutes

### Query Key Design
- Hierarchical structure for easy invalidation
- Includes all parameters that affect data
- Examples:
  - `['public-projects', { page, limit, status, chain, categories }]`
  - `['missionDetail', missionId]`
  - `['profileInitialData']`

### Selective Invalidation
- Mutations invalidate only affected queries
- Multiple query keys for same data (public vs authenticated)
- Batch invalidations when needed

## 8. Common Patterns and Best Practices

### 1. Authentication-Aware Queries
- Query keys include user ID when authenticated
- Automatic refetch when user changes
- No manual effect hooks needed

### 2. Error Handling
- Service layer throws structured errors
- Hooks handle and display errors
- Toast notifications for user feedback

### 3. Loading States
- Consistent loading UI across app
- Skeleton loaders for better UX
- Error boundaries for critical failures

### 4. Data Transformation
- Services handle API response transformation
- Hooks return data in component-ready format
- Type safety throughout the chain

## 9. Architecture Strengths

1. **Type Safety**: Full TypeScript coverage from API to components
2. **Separation of Concerns**: Clear layers (API, services, hooks, components)
3. **Cache Efficiency**: Smart invalidation and stale time configuration
4. **Developer Experience**: Consistent patterns and naming conventions
5. **Performance**: Optimistic updates and selective refetching

## 10. Potential Improvements

1. **Prefetching**: Could implement route-based prefetching
2. **Infinite Queries**: For paginated lists (currently using standard pagination)
3. **Suspense Integration**: Could leverage React Suspense for data fetching
4. **WebSocket Integration**: For real-time updates (currently polling-based)
5. **Offline Support**: Could add offline queue for mutations

## Conclusion

The Bloom Protocol frontend demonstrates a mature and well-architected approach to data management using React Query. The patterns are consistent, type-safe, and optimized for both developer experience and application performance. The clear separation between data fetching logic and UI components makes the codebase maintainable and scalable.