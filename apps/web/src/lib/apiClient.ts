const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.statusCode = response.statusCode;
    this.errorCode = response.errorCode;
  }
}

export const apiClient = {
  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      throw new ApiError({
        statusCode: 401,
        message: 'Unauthorized',
        errorCode: 'AUTH_UNAUTHORIZED',
      });
    }

    if (!res.ok) {
      let errorBody: ApiErrorResponse;
      try {
        errorBody = (await res.json()) as ApiErrorResponse;
      } catch {
        errorBody = {
          statusCode: res.status,
          message: res.statusText || 'Unknown error',
          errorCode: 'INTERNAL_ERROR',
        };
      }
      throw new ApiError(errorBody);
    }

    return res.json() as Promise<T>;
  },
};
