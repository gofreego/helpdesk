# UI Source Code Structure

This document describes the organization of the UI source code.

## Directory Structure

```
src/
├── app/                    # App-level configuration and routing
├── assets/                 # Static assets (images, icons, etc.)
├── components/             # React components organized by feature
│   ├── common/            # Shared/common components
│   │   ├── Dashboard.jsx
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   └── Settings.jsx
│   ├── issues/            # Issue-related components
│   │   ├── CreateIssue.jsx
│   │   ├── IssueDetail.jsx
│   │   └── IssuesList.jsx
│   └── ratings/           # Rating-related components
│       ├── CreateRating.jsx
│       ├── RatingDetail.jsx
│       └── RatingsList.jsx
├── configs/               # Configuration files
│   └── api.config.js     # API/Axios configuration
├── constants/             # Application constants
│   ├── issue.constants.js        # Issue status and types
│   └── permissions.constants.js  # Permission constants
├── models/                # Data models and types (if using TypeScript)
├── services/              # API service layer
│   ├── issue.service.js  # Issue-related API calls
│   └── rating.service.js # Rating-related API calls
├── utils/                 # Utility functions
│   ├── format.utils.js   # Date and text formatting utilities
│   └── status.utils.js   # Status and badge utilities
├── App.jsx               # Main App component
├── main.jsx              # Application entry point
├── App.css               # Global app styles
└── index.css             # Global base styles
```

## Design Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI logic, focus on rendering
- **Services**: API calls and data fetching
- **Utils**: Reusable helper functions
- **Constants**: Centralized configuration values

### 2. **Feature-Based Organization**
Components are organized by feature (issues, ratings, common) rather than by type. This makes it easier to:
- Find related code
- Understand feature boundaries
- Maintain and refactor features independently

### 3. **Service Layer Pattern**
All API calls are abstracted into service files:
- **issue.service.js**: All issue-related API operations
- **rating.service.js**: All rating-related API operations

Benefits:
- Centralized error handling
- Consistent API call patterns
- Easy to mock for testing
- Reusable across components

### 4. **Utility Functions**
Common operations are extracted into utility files:
- **format.utils.js**: Date formatting, text truncation
- **status.utils.js**: Status badge generation, star ratings

### 5. **Constants Management**
Magic numbers and strings are replaced with named constants:
- **issue.constants.js**: Issue statuses, labels, badge classes
- **permissions.constants.js**: Permission strings and helpers

## Import Patterns

### Component Imports
```javascript
// Import multiple components from the same feature
import { IssuesList, IssueDetail, CreateIssue } from './components/issues';

// Or import all components
import { Layout, Dashboard, IssuesList } from './components';
```

### Service Imports
```javascript
// Import specific services
import { fetchIssues, createIssue } from '../services/issue.service';

// Or import from index
import { fetchIssues, fetchRatings } from '../services';
```

### Utility Imports
```javascript
import { formatDate, truncateText } from '../utils/format.utils';
import { getIssueStatusBadge } from '../utils/status.utils';
```

### Constant Imports
```javascript
import { ISSUE_STATUS, ISSUE_STATUS_LABELS } from '../constants/issue.constants';
import { hasPermission, PERMISSIONS } from '../constants/permissions.constants';
```

## Adding New Features

### Adding a New Component
1. Create the component in the appropriate feature folder
2. Export it from the feature's `index.js`
3. Component automatically available via `components/index.js`

### Adding a New Service
1. Create service file in `services/` folder
2. Export functions from the service file
3. Add export to `services/index.js` for convenience

### Adding New Utilities
1. Create utility function in appropriate utils file
2. Export the function
3. Add export to `utils/index.js`

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility
2. **Use services for API calls**: Never make direct API calls from components
3. **Extract reusable logic**: If logic is used in multiple places, extract it to utils
4. **Use constants**: Avoid magic strings and numbers in code
5. **Consistent naming**: Use descriptive names that match their purpose
6. **Colocate related files**: Keep CSS files with their components

## File Naming Conventions

- **Components**: PascalCase (e.g., `IssuesList.jsx`)
- **Services**: camelCase with .service suffix (e.g., `issue.service.js`)
- **Utils**: camelCase with .utils suffix (e.g., `format.utils.js`)
- **Constants**: camelCase with .constants suffix (e.g., `issue.constants.js`)
- **Configs**: camelCase with .config suffix (e.g., `api.config.js`)

## Testing Structure

(To be implemented)
```
src/
├── components/
│   └── __tests__/
├── services/
│   └── __tests__/
└── utils/
    └── __tests__/
```
