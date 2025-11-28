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
    console.log('[validateApiKey] Validating API key with /me endpoint');
    const meResponse = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[validateApiKey] /me response status:', meResponse.status);

    if (meResponse.status === 200) {
      const data = await meResponse.json();
      console.log('[validateApiKey] /me response data:', data);
      
      const keyType = data.key_type as 'APP_ADMIN' | 'ENV_ADMIN' | 'ENV_READ_ONLY';
      const environmentId = data.environment_id as number | undefined;
      
      console.log('[validateApiKey] Determined keyType:', keyType, 'environmentId:', environmentId);
      
      return {
        keyType,
        environmentId,
      };
    }

    // If /me fails, fall back to heuristic approach
    console.log('[validateApiKey] /me failed, falling back to heuristic');
    
    // First, try to list environments (APP_ADMIN only)
    const envsResponse = await fetch(`${API_URL}/environments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[validateApiKey] /environments response status:', envsResponse.status);

    if (envsResponse.status === 200) {
      // APP_ADMIN key
      console.log('[validateApiKey] Determined keyType: APP_ADMIN (from /environments)');
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

    console.log('[validateApiKey] /environment response status:', envResponse.status);

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

      console.log('[validateApiKey] PATCH /environment response status:', updateResponse.status);

      if (updateResponse.status === 204) {
        console.log('[validateApiKey] Determined keyType: ENV_ADMIN');
        return {
          keyType: 'ENV_ADMIN',
          environmentId: data.id,
        };
      } else {
        console.log('[validateApiKey] Determined keyType: ENV_READ_ONLY');
        return {
          keyType: 'ENV_READ_ONLY',
          environmentId: data.id,
        };
      }
    }

    // If we get here, the key is invalid
    if (envResponse.status === 401 || envsResponse.status === 401 || meResponse.status === 401) {
      console.log('[validateApiKey] Invalid API key (401)');
      throw new Error('Invalid API key');
    } else if (envResponse.status === 403 || envsResponse.status === 403 || meResponse.status === 403) {
      console.log('[validateApiKey] Invalid API key or insufficient permissions (403)');
      throw new Error('Invalid API key or insufficient permissions');
    } else {
      console.log('[validateApiKey] Failed to validate API key');
      throw new Error('Failed to validate API key');
    }
  } catch (error) {
    console.error('[validateApiKey] Error:', error);
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

  console.log('[apiRequest] Making request:', {
    method,
    endpoint: `${API_URL}${endpoint}`,
    hasBody: !!body,
  });

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log('[apiRequest] Response status:', response.status, response.statusText);

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || error.error || 'Request failed';
      console.error('[apiRequest] Error response:', error);
    } catch (e) {
      console.error('[apiRequest] Failed to parse error response:', e);
      errorMessage = response.statusText || 'Request failed';
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    console.log('[apiRequest] 204 No Content - returning empty object');
    return {} as T;
  }

  const data = await response.json();
  console.log('[apiRequest] Response data:', data);
  return data;
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
  console.log('[setVariable] Calling backend with:', {
    key,
    encodedKey: encodeURIComponent(key),
    valueLength: value.length,
    valuePreview: value.substring(0, 50),
    valueType: typeof value,
  });
  
  // Ensure value is a string
  const stringValue = String(value);
  
  try {
    const response = await apiRequest(`/variables/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: { value: stringValue },
      apiKey,
    });
    console.log('[setVariable] Success, response:', response);
  } catch (error) {
    console.error('[setVariable] Error details:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
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

