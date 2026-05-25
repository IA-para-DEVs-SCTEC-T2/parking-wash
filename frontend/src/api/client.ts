interface ApiError {
  error: string;
  statusCode: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorData: ApiError;
    
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = {
        error: `HTTP ${response.status}`,
        statusCode: response.status,
      };
    }
    
    throw {
      error: errorData.error || 'Erro inesperado. Tente novamente.',
      statusCode: response.status,
    };
  }
  
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return handleResponse<T>(response);
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  return handleResponse<T>(response);
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  return handleResponse<T>(response);
}
