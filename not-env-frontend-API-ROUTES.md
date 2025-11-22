# Not-Env Frontend API Routes

This document lists all API routes that the Next.js frontend will need to access to interact with the not-env-backend service.

## Authentication

All API requests require Bearer token authentication:

- **Header**: `Authorization: Bearer <API_KEY>`
- The API key determines the permissions (APP_ADMIN, ENV_ADMIN, or ENV_READ_ONLY)
- The API key also determines which environment context is used (for ENV_* keys)

## Base URL

- **Local Development**: `http://localhost:1212` (Docker service)
- **Production**: Configurable (typically `https://not-env.example.com`)

## API Routes

### Health Check

**GET /health**

- **Purpose**: Check if backend is reachable
- **Auth**: None required
- **Response**: `200 OK` with body `"OK"`
- **Use Case**: Verify backend connectivity before making authenticated requests

---

### Environment Management (APP_ADMIN Required)

These endpoints require an APP_ADMIN API key and manage environments at the organization level.

#### Create Environment

**POST /environments**

- **Purpose**: Create a new environment
- **Auth**: APP_ADMIN required
- **Request Body**:

  ```json
  {
    "name": "string (required)",
    "description": "string (optional)"
  }
  ```

- **Response**: `200 OK`

  ```json
  {
    "id": 1,
    "organization_id": 1,
    "name": "development",
    "description": "Development environment",
    "created_at": "2024-01-15T10:30:00Z",
    "keys": {
      "env_admin": "base64-encoded-key",
      "env_read_only": "base64-encoded-key"
    }
  }
  ```

- **Error Codes**: 400 (bad request), 401 (unauthorized), 403 (forbidden), 409 (name already exists)
- **Use Case**: Create new environments (e.g., development, staging, production)

#### List Environments

**GET /environments**

- **Purpose**: List all environments in the organization
- **Auth**: APP_ADMIN required
- **Response**: `200 OK`

  ```json
  {
    "environments": [
      {
        "id": 1,
        "organization_id": 1,
        "name": "development",
        "description": "Development environment",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

- **Error Codes**: 401 (unauthorized), 403 (forbidden)
- **Use Case**: Display list of all environments, allow switching between environments

#### Delete Environment

**DELETE /environments/{id}**

- **Purpose**: Delete an environment and all its variables/keys
- **Auth**: APP_ADMIN required
- **Path Parameter**: `id` (integer) - Environment ID
- **Response**: `204 No Content`
- **Error Codes**: 400 (invalid ID), 401 (unauthorized), 403 (forbidden), 404 (not found)
- **Use Case**: Remove environments that are no longer needed

---

### Current Environment (ENV_* Keys)

These endpoints work with ENV_ADMIN or ENV_READ_ONLY keys. The environment context is determined by the API key used.

#### Get Current Environment

**GET /environment**

- **Purpose**: Get metadata for the current environment (based on API key)
- **Auth**: Any ENV_* key type
- **Response**: `200 OK`

  ```json
  {
    "id": 1,
    "organization_id": 1,
    "name": "development",
    "description": "Development environment",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
  ```

- **Error Codes**: 400 (environment context required), 401 (unauthorized), 404 (not found)
- **Use Case**: Display current environment information, verify environment context

#### Update Environment

**PATCH /environment**

- **Purpose**: Update environment name and/or description
- **Auth**: ENV_ADMIN required
- **Request Body**:

  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)"
  }
  ```

- **Response**: `204 No Content`
- **Error Codes**: 400 (bad request, no fields to update), 401 (unauthorized), 403 (forbidden)
- **Use Case**: Edit environment metadata

#### Get Environment Keys

**GET /environment/keys**

- **Purpose**: Get ENV_ADMIN and ENV_READ_ONLY keys for the current environment
- **Auth**: ENV_ADMIN required
- **Response**: `200 OK`

  ```json
  {
    "env_admin": "[key exists - use CLI to view]",
    "env_read_only": "[key exists - use CLI to view]"
  }
  ```

- **Note**: Actual keys cannot be retrieved via API (only hashes are stored). This endpoint indicates if keys exist.
- **Error Codes**: 400 (environment context required), 401 (unauthorized), 403 (forbidden)
- **Use Case**: Display key status (keys must be saved when environment is created)

---

### Variables (ENV_* Keys)

These endpoints work with ENV_ADMIN or ENV_READ_ONLY keys. The environment context is determined by the API key used.

#### List Variables

**GET /variables**

- **Purpose**: List all variables in the current environment
- **Auth**: Any ENV_* key type
- **Response**: `200 OK`

  ```json
  {
    "variables": [
      {
        "key": "DB_HOST",
        "value": "localhost",
        "created_at": "2024-01-15T10:35:00Z",
        "updated_at": "2024-01-15T10:35:00Z"
      }
    ]
  }
  ```

- **Error Codes**: 400 (environment context required), 401 (unauthorized)
- **Use Case**: Display all environment variables in a table/list view

#### Get Variable

**GET /variables/{key}**

- **Purpose**: Get a single variable by key
- **Auth**: Any ENV_* key type
- **Path Parameter**: `key` (string) - Variable key
- **Response**: `200 OK`

  ```json
  {
    "key": "DB_HOST",
    "value": "localhost",
    "created_at": "2024-01-15T10:35:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
  ```

- **Error Codes**: 400 (environment context required), 401 (unauthorized), 404 (not found)
- **Use Case**: View/edit individual variable details

#### Set Variable

**PUT /variables/{key}**

- **Purpose**: Create or update a variable
- **Auth**: ENV_ADMIN required
- **Path Parameter**: `key` (string) - Variable key
- **Request Body**:

  ```json
  {
    "value": "string (required)"
  }
  ```

- **Response**: `204 No Content`
- **Error Codes**: 400 (bad request), 401 (unauthorized), 403 (forbidden)
- **Use Case**: Create new variables or update existing ones

#### Delete Variable

**DELETE /variables/{key}**

- **Purpose**: Delete a variable
- **Auth**: ENV_ADMIN required
- **Path Parameter**: `key` (string) - Variable key
- **Response**: `204 No Content`
- **Error Codes**: 400 (environment context required), 401 (unauthorized), 403 (forbidden)
- **Use Case**: Remove variables that are no longer needed

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error Name",
  "message": "Detailed error message"
}
```

Common error status codes:

- **400 Bad Request**: Invalid request body, missing required fields, invalid parameters
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Insufficient permissions (wrong key type)
- **404 Not Found**: Resource doesn't exist or doesn't belong to organization
- **409 Conflict**: Resource already exists (e.g., environment name)
- **500 Internal Server Error**: Server error

---

## Frontend Implementation Notes

### API Key Management

1. **APP_ADMIN Key**: Used for environment management (create, list, delete environments)
2. **ENV_ADMIN Key**: Used for full environment access (read/write variables, update environment)
3. **ENV_READ_ONLY Key**: Used for read-only access (view variables, view environment)

### Environment Context Switching

- When using an ENV_* key, the environment is automatically determined by the key
- To switch environments, the frontend must use a different API key
- The frontend should store multiple API keys (one per environment) or allow users to switch keys

### Recommended Frontend Flow

1. **Login/Setup**: User provides APP_ADMIN key or ENV_ADMIN key
2. **Environment Selection**:
   - If APP_ADMIN: List environments, allow selection
   - If ENV_ADMIN: Automatically use environment from key
3. **Variable Management**: Use ENV_ADMIN key for current environment to manage variables
4. **Key Storage**: Store API keys securely (localStorage, sessionStorage, or secure cookies)

### API Client Implementation

The frontend should implement:

- Centralized API client with base URL configuration
- Automatic Bearer token injection from stored API key
- Error handling for 401/403 (redirect to login, show permission errors)
- Request/response interceptors for error handling
- TypeScript types for all request/response bodies
