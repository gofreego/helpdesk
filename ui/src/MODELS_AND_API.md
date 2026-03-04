# Models and API Service Architecture

This document explains the model-based architecture and centralized API service pattern used in this project.

## Overview

The application uses a structured approach to handle API requests and responses:

1. **Models**: Define request and response structures
2. **Centralized API Service**: Manages all HTTP calls with automatic header handling
3. **Service Layer**: Uses models and API service for domain-specific operations

## Directory Structure

```
src/
├── models/                 # Request and Response models
│   ├── issue.model.js     # Issue-related models
│   ├── rating.model.js    # Rating-related models
│   └── index.js           # Barrel export
├── services/
│   ├── api.service.js     # Centralized HTTP client
│   ├── issue.service.js   # Issue domain operations
│   └── rating.service.js  # Rating domain operations
```

## Models

Models provide type-safe structures for API requests and responses, with built-in validation and transformation.

### Request Models

Request models encapsulate data being sent to the API:

```javascript
import { CreateIssueRequest } from '../models/issue.model';

// Create a request object
const request = new CreateIssueRequest({
  type: 'bug',
  entity_id: '12345',
  title: 'Issue title',
  description: 'Issue description'
});

// Validate before sending
request.validate(); // throws error if invalid

// Convert to JSON for API
const jsonData = request.toJSON();
```

#### Available Request Models

**Issue Models:**
- `CreateIssueRequest` - For creating new issues
- `UpdateIssueRequest` - For updating issues
- `UpdateIssueStatusRequest` - For changing issue status
- `CreateIssueReplyRequest` - For creating issue replies
- `FetchIssuesRequest` - For fetching issues with filters

**Rating Models:**
- `CreateRatingRequest` - For creating new ratings
- `UpdateRatingRequest` - For updating ratings
- `CreateRatingReplyRequest` - For creating rating replies
- `FetchRatingsRequest` - For fetching ratings with filters

### Response Models

Response models transform API responses into structured data:

```javascript
import { FetchIssuesResponse } from '../models/issue.model';

// Transform API response
const response = FetchIssuesResponse.fromResponse(apiData);

// Access structured data
response.issues.forEach(issue => {
  console.log(issue.title); // Typed Issue object
});
```

#### Available Response Models

**Issue Models:**
- `Issue` - Single issue entity
- `IssueReply` - Single issue reply entity
- `IssueConfig` - Issue configuration
- `FetchIssuesResponse` - List of issues
- `FetchIssueByIdResponse` - Single issue
- `FetchIssueRepliesResponse` - List of replies
- `CreateIssueResponse` - Created issue
- `UpdateIssueResponse` - Updated issue

**Rating Models:**
- `Rating` - Single rating entity
- `RatingReply` - Single rating reply entity
- `RatingTypes` - Rating types configuration
- `FetchRatingsResponse` - List of ratings
- `FetchRatingByIdResponse` - Single rating
- `FetchRatingRepliesResponse` - List of replies
- `CreateRatingResponse` - Created rating
- `UpdateRatingResponse` - Updated rating

## Centralized API Service

The `api.service.js` provides a unified interface for all HTTP operations.

### Features

- **Automatic Header Management**: Handles authentication headers based on user context
- **Request/Response Mapping**: Supports custom transformations
- **Error Handling**: Consistent error formatting
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE

### Basic Usage

```javascript
import apiService from '../services/api.service';

// Simple GET request
const data = await apiService.get('/helpdesk/v1/issues');

// GET with query params and user context
const data = await apiService.get('/helpdesk/v1/issues', {
  params: { type: 'bug' },
  currentUser: user
});

// POST with data
const created = await apiService.post('/helpdesk/v1/issues', issueData, {
  currentUser: user
});

// With response mapping
const response = await apiService.get('/helpdesk/v1/issues', {
  currentUser: user,
  responseMapper: (data) => FetchIssuesResponse.fromResponse(data)
});
```

### Advanced Usage

```javascript
// Set current user globally
apiService.setCurrentUser(currentUser);

// Set default development user
apiService.setDefaultUser({ id: '1', permissions: ['admin'] });

// Custom request/response mapping
const data = await apiService.post('/api/endpoint', requestData, {
  currentUser: user,
  requestMapper: (data) => transformRequest(data),
  responseMapper: (data) => transformResponse(data)
});
```

## Service Layer

Services use models and the API service to provide domain-specific operations.

### Pattern

```javascript
import apiService from './api.service';
import { CreateIssueRequest, CreateIssueResponse } from '../models/issue.model';

export const createIssue = async (issueData, currentUser) => {
  // 1. Create request model
  const request = new CreateIssueRequest(issueData);
  
  // 2. Validate
  request.validate();
  
  // 3. Call API with transformation
  return await apiService.post('/helpdesk/v1/issues', request.toJSON(), {
    currentUser,
    responseMapper: (data) => CreateIssueResponse.fromResponse(data)
  });
};
```

### Benefits

1. **Type Safety**: Models ensure consistent data structures
2. **Validation**: Request models validate data before API calls
3. **Transformation**: Automatic conversion between API and application formats
4. **Reusability**: Centralized HTTP logic
5. **Testability**: Easy to mock and test
6. **Maintainability**: Changes to API structure isolated in models

## Component Usage

### Before (Old Pattern)

```javascript
const loadIssues = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    
    const res = await axios.get(`/api/issues?${params}`, {
      headers: {
        'x-user-id': currentUser.id,
        'x-user-perms': currentUser.role
      }
    });
    
    setIssues(res.data.issues || []);
  } catch (error) {
    console.error(error);
  }
};
```

### After (New Pattern)

```javascript
import { fetchIssues } from '../../services/issue.service';

const loadIssues = async () => {
  try {
    const response = await fetchIssues(filters, currentUser);
    setIssues(response.issues); // Typed Issue[] objects
  } catch (error) {
    console.error(error);
  }
};
```

## Creating New Models

### 1. Request Model

```javascript
export class CreateEntityRequest {
  constructor({ field1, field2 }) {
    this.field1 = field1;
    this.field2 = field2;
  }

  validate() {
    if (!this.field1) {
      throw new Error('field1 is required');
    }
    return true;
  }

  toJSON() {
    return {
      field1: this.field1,
      field2: this.field2
    };
  }
}
```

### 2. Response Model

```javascript
export class Entity {
  constructor(data = {}) {
    this.id = data.id;
    this.field1 = data.field1;
    this.field2 = data.field2;
  }

  static fromResponse(data) {
    return new Entity(data);
  }

  static fromListResponse(dataArray = []) {
    return dataArray.map(item => new Entity(item));
  }
}

export class FetchEntitiesResponse {
  constructor({ entities = [], total = 0 }) {
    this.entities = Entity.fromListResponse(entities);
    this.total = total;
  }

  static fromResponse(data) {
    return new FetchEntitiesResponse({
      entities: data.entities || [],
      total: data.total || 0
    });
  }
}
```

### 3. Service Function

```javascript
export const fetchEntities = async (filters = {}, currentUser) => {
  const request = new FetchEntitiesRequest(filters);
  const queryString = request.toQueryParams();
  const url = queryString ? `/api/entities?${queryString}` : '/api/entities';

  return await apiService.get(url, {
    currentUser,
    responseMapper: (data) => FetchEntitiesResponse.fromResponse(data)
  });
};
```

## Best Practices

1. **Always validate request models** before sending to API
2. **Use response mappers** to ensure consistent data structures
3. **Handle errors** at the component level with try-catch
4. **Pass currentUser** explicitly to maintain context
5. **Keep models simple** - they're data containers, not business logic
6. **Document model fields** with JSDoc comments
7. **Use static factory methods** for response transformation
8. **Export models from index.js** for clean imports

## Migration Guide

### Updating Existing Code

1. **Identify API calls** in components
2. **Check if service exists** - if not, create it
3. **Create models** for request/response if needed
4. **Update service** to use models and api.service
5. **Update component** to use new service
6. **Test thoroughly**

### Example Migration

**Before:**
```javascript
const res = await axios.post('/api/issues', formData, {
  headers: { 'x-user-id': user.id }
});
const issue = res.data.issue;
```

**After:**
```javascript
const response = await createIssue(formData, currentUser);
const issue = response.issue; // Typed Issue object
```

## Testing

### Testing Models

```javascript
import { CreateIssueRequest } from '../models/issue.model';

test('validates required fields', () => {
  const request = new CreateIssueRequest({});
  expect(() => request.validate()).toThrow();
});
```

### Testing Services

```javascript
import apiService from '../services/api.service';
import { createIssue } from '../services/issue.service';

jest.mock('../services/api.service');

test('creates issue', async () => {
  apiService.post.mockResolvedValue({ issue: { id: 1 } });
  
  const result = await createIssue(issueData, user);
  
  expect(apiService.post).toHaveBeenCalledWith(
    '/helpdesk/v1/issues',
    expect.any(Object),
    expect.any(Object)
  );
  expect(result.issue.id).toBe(1);
});
```

## Troubleshooting

### Common Issues

**"Cannot read property 'X' of undefined"**
- Check if response mapper is correctly transforming data
- Verify API response structure matches model

**"Validation error"**
- Check all required fields are provided
- Verify data types match model expectations

**"Headers not set"**
- Ensure currentUser is passed to service functions
- Check apiService.setDefaultUser() is called in development

## Future Enhancements

- [ ] TypeScript migration for full type safety
- [ ] Request/response caching
- [ ] Automatic retry logic
- [ ] Request deduplication
- [ ] Optimistic updates
- [ ] WebSocket integration
- [ ] GraphQL support
