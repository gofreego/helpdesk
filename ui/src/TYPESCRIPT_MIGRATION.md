# TypeScript Migration Guide

## Overview
The UI codebase has been migrated to TypeScript for better type safety, improved developer experience, and enhanced code maintainability.

## Configuration

### TypeScript Config (`tsconfig.json`)
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled for maximum type safety
- **JSX**: react-jsx (automatic runtime)
- **Path Mappings**: Configured for clean imports
  - `@/*` → `src/*`
  - `@models/*` → `src/models/*`
  - `@services/*` → `src/services/*`
  - `@components/*` → `src/components/*`
  - `@utils/*` → `src/utils/*`
  - `@constants/*` → `src/constants/*`
  - `@configs/*` → `src/configs/*`
  - `@app/*` → `src/app/*`

## Converted Files

### Models (`.ts`)
All model files now use TypeScript interfaces and classes:

- **`issue.model.ts`**
  - Base interfaces: `Issue`, `IssueReply`, `IssueConfig`
  - Request interfaces: `CreateIssueRequestData`, `UpdateIssueRequestData`, etc.
  - Response interfaces: `FetchIssuesResponse`, `CreateIssueResponse`, etc.
  - Request classes with validation: `CreateIssueRequest`, `UpdateIssueRequest`
  - Response transformers: `transformIssue`, `transformFetchIssuesResponse`

- **`rating.model.ts`**
  - Base interfaces: `Rating`, `RatingReply`, `RatingTypes`
  - Request interfaces: `CreateRatingRequestData`, `UpdateRatingRequestData`, etc.
  - Response interfaces: `FetchRatingsResponse`, `CreateRatingResponse`, etc.
  - Request classes with validation: `CreateRatingRequest`, `UpdateRatingRequest`
  - Response transformers: `transformRating`, `transformFetchRatingsResponse`

### Services (`.ts`)
All service files are now TypeScript with proper type annotations:

- **`api.service.ts`**
  - Generic HTTP methods with type parameters
  - Type-safe request/response handling
  - Automatic header management with proper types

- **`issue.service.ts`**
  - Typed function parameters and return values
  - Uses model interfaces for requests and responses
  - Proper error handling with typed exceptions

- **`rating.service.ts`**
  - Typed function parameters and return values
  - Uses model interfaces for requests and responses
  - Proper error handling with typed exceptions

## Architecture Benefits

### Type Safety
```typescript
// Before (JavaScript)
const createIssue = async (issueData) => {
  // No type checking, potential runtime errors
  return await api.post('/issues', issueData);
};

// After (TypeScript)
const createIssue = async (
  issueData: CreateIssueRequest | Record<string, any>
): Promise<CreateIssueResponse> => {
  // Compile-time type checking
  const request = issueData instanceof CreateIssueRequest
    ? issueData
    : new CreateIssueRequest(issueData as any);
  
  request.validate();
  const data = await apiService.post('/issues', request.toJSON());
  return transformCreateIssueResponse(data);
};
```

### Intellisense & Autocomplete
- IDE now provides autocomplete for all properties
- Type hints show available methods and properties
- Immediate feedback on type mismatches

### Refactoring Safety
- Renaming properties updates all usages
- Find all references works across the codebase
- Catch errors at compile-time, not runtime

## Component Integration

### Using Models in Components
Components can still be `.jsx` files but benefit from TypeScript services:

```jsx
import { fetchIssues, createIssue } from '@services/issue.service';
import { CreateIssueRequest } from '@models/issue.model';

// In component
const loadIssues = async () => {
  const response = await fetchIssues({ status: '1' });
  // response.issues is typed as Issue[]
  setIssues(response.issues);
};

const handleCreate = async (formData) => {
  const request = new CreateIssueRequest(formData);
  const response = await createIssue(request);
  // response.issue is typed as Issue
  console.log(response.issue);
};
```

## Path Aliases in Imports

Use clean path aliases instead of relative paths:

```typescript
// ❌ Old way (relative imports)
import { fetchIssues } from '../../services/issue.service';
import { Issue } from '../../models/issue.model';

// ✅ New way (path aliases)
import { fetchIssues } from '@services/issue.service';
import { Issue } from '@models/issue.model';
// or
import { fetchIssues } from '@/services/issue.service';
import { Issue } from '@/models/issue.model';
```

## Mixed .jsx and .ts Support

### Current Setup
- **Models & Services**: Full TypeScript (`.ts`)
- **Components**: Can remain `.jsx` or migrate to `.tsx` as needed
- **Benefits**: Gradual migration, immediate type safety in services

### JSX Components with TypeScript Services
JSX components automatically get type checking when using TypeScript services:

```jsx
// Component.jsx can use TypeScript services
import { fetchIssues } from '@services/issue.service';

// TypeScript will validate the response shape
const response = await fetchIssues();
console.log(response.issues); // ✅ Typed as Issue[]
console.log(response.total);  // ✅ Typed as number
console.log(response.invalid); // ❌ TypeScript error
```

## Build & Development

### No Changes Required
- Vite automatically handles `.ts` and `.tsx` files
- No additional build configuration needed
- Development server works the same way

### Type Checking
```bash
# Check types without emitting files
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

## Migration Checklist

- [x] Install TypeScript dependencies
- [x] Create `tsconfig.json` and `tsconfig.node.json`
- [x] Rename `vite.config.js` to `vite.config.ts`
- [x] Convert models to TypeScript interfaces
- [x] Convert services to TypeScript
- [x] Remove old `.js` model and service files
- [x] Verify no TypeScript errors
- [ ] Optionally: Convert components from `.jsx` to `.tsx` (as needed)
- [ ] Optionally: Add JSDoc types for JavaScript files

## Best Practices

### 1. Define Interfaces for Data Structures
```typescript
export interface Issue {
  id: string;
  type: string;
  title: string;
  // ... other properties
}
```

### 2. Use Classes for Request Objects (with validation)
```typescript
export class CreateIssueRequest {
  constructor(data: CreateIssueRequestData) {
    // initialization
  }
  
  validate(): boolean {
    // validation logic
  }
  
  toJSON(): CreateIssueRequestData {
    // serialization
  }
}
```

### 3. Type Function Parameters and Returns
```typescript
export const fetchIssues = async (
  filters?: FetchIssuesRequest
): Promise<FetchIssuesResponse> => {
  // implementation
};
```

### 4. Use Transformers for API Responses
```typescript
export const transformIssue = (data: any): Issue => ({
  id: data.id,
  type: data.type,
  // ... transform properties
});
```

## Troubleshooting

### Import Errors
If you see import errors in the IDE:
1. Restart the TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Check `tsconfig.json` path mappings
3. Ensure file extensions are correct (`.ts`, not `.js`)

### Type Errors in Components
If components show type errors:
1. Services are now strongly typed
2. Check the expected types in model files
3. Use proper request/response interfaces

### Build Errors
If the build fails:
1. Run `npx tsc --noEmit` to see all type errors
2. Fix type errors before building
3. Use `as any` sparingly for quick fixes (but aim to fix properly)

## Future Enhancements

1. **Component Migration**: Gradually convert `.jsx` components to `.tsx`
2. **Utility Types**: Add more helper types for common patterns
3. **Stricter Validation**: Replace `any` types with proper interfaces
4. **Type Guards**: Add runtime type checking functions
5. **Generic Components**: Create reusable components with generics

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Type-safe Vite Config](https://vitejs.dev/config/)
