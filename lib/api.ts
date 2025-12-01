const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1212';

export interface ApiError {
  error: string;
  message: string;
}

export interface KeyInfo {
  keyType: 'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY';
  environmentId?: number;
}

export async function validateApiKey(apiKey: string): Promise<KeyInfo> {
  // Use the /me endpoint to get key type directly from the database
  // This is more reliable than trying different endpoints
  
  try {
    const meResponse = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (meResponse.status === 200) {
      const data = await meResponse.json();
      
      const keyType = data.key_type as 'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY';
      const environmentId = data.environment_id as number | undefined;
      
      return {
        keyType,
        environmentId,
      };
    }

    // If /me fails, fall back to heuristic approach
    
    // First, try to list environments (APP_ADMIN only)
    const envsResponse = await fetch(`${API_URL}/environments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (envsResponse.status === 200) {
      // APP_ADMIN key
      return { keyType: 'APP_ADMIN' };
    }

    // Not APP_ADMIN, try to get current environment
    const envResponse = await fetch(`${API_URL}/environment`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (envResponse.status === 200) {
      const data = await envResponse.json();
      
      // Try to update environment to determine if ENV_ADMIN or ENV_READ_ONLY
      // We'll use a no-op update (same name) to check permissions
      const updateResponse = await fetch(`${API_URL}/environment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.name }), // No-op update
      });

      if (updateResponse.status === 204) {
        return {
          keyType: 'ENV_ADMIN',
          environmentId: data.id,
        };
      } else {
        return {
          keyType: 'ENV_READ_ONLY',
          environmentId: data.id,
        };
      }
    }

    // If we get here, the key is invalid
    if (envResponse.status === 401 || envsResponse.status === 401 || meResponse.status === 401) {
      throw new Error('Invalid API key');
    } else if (envResponse.status === 403 || envsResponse.status === 403 || meResponse.status === 403) {
      throw new Error('Invalid API key or insufficient permissions');
    } else {
      throw new Error('Failed to validate API key');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to backend');
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    apiKey: string;
  }
): Promise<T> {
  const { method = 'GET', body, apiKey } = options;

  const headers: HeadersInit = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || error.error || 'Request failed';
    } catch (e) {
      errorMessage = response.statusText || 'Request failed';
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// APP_ADMIN API functions
export interface Environment {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
}

export interface CreateEnvironmentResponse {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  created_at: string;
  keys: {
    env_admin: string;
    env_read_only: string;
  };
}

export interface ListEnvironmentsResponse {
  environments: Environment[];
}

export async function listEnvironments(apiKey: string): Promise<Environment[]> {
  const response = await apiRequest<ListEnvironmentsResponse>('/environments', {
    method: 'GET',
    apiKey,
  });
  return response.environments;
}

export async function createEnvironment(
  apiKey: string,
  data: CreateEnvironmentRequest
): Promise<CreateEnvironmentResponse> {
  return apiRequest<CreateEnvironmentResponse>('/environments', {
    method: 'POST',
    body: data,
    apiKey,
  });
}

export async function deleteEnvironment(
  apiKey: string,
  environmentId: number
): Promise<void> {
  await apiRequest(`/environments/${environmentId}`, {
    method: 'DELETE',
    apiKey,
  });
}

// Environment variable API functions
export interface Variable {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ListVariablesResponse {
  variables: Variable[];
}

export interface GetVariableResponse extends Variable {}

export interface SetVariableRequest {
  value: string;
}

export async function listVariables(apiKey: string): Promise<Variable[]> {
  const response = await apiRequest<ListVariablesResponse>('/variables', {
    method: 'GET',
    apiKey,
  });
  return response.variables;
}

export async function getVariable(apiKey: string, key: string): Promise<Variable> {
  return apiRequest<GetVariableResponse>(`/variables/${encodeURIComponent(key)}`, {
    method: 'GET',
    apiKey,
  });
}

export async function setVariable(
  apiKey: string,
  key: string,
  value: string
): Promise<void> {
  // Ensure value is a string
  const stringValue = String(value);
  
  await apiRequest(`/variables/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: { value: stringValue },
    apiKey,
  });
}

export async function deleteVariable(apiKey: string, key: string): Promise<void> {
  await apiRequest(`/variables/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    apiKey,
  });
}

// Environment info API functions
export interface EnvironmentInfo {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentKeysResponse {
  env_admin: string;
  env_read_only: string;
}

export async function getEnvironment(apiKey: string): Promise<EnvironmentInfo> {
  return apiRequest<EnvironmentInfo>('/environment', {
    method: 'GET',
    apiKey,
  });
}

export async function getEnvironmentKeys(apiKey: string): Promise<EnvironmentKeysResponse> {
  return apiRequest<EnvironmentKeysResponse>('/environment/keys', {
    method: 'GET',
    apiKey,
  });
}

