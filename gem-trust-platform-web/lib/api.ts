'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || '';

export interface RegisterUserPayload {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  nicNumber: string;
  role: 'Buyer' | 'Seller';
  nicPhotoBase64?: string;
  nicPhotoContentType?: string;
}

export const registerUser = async (payload: RegisterUserPayload): Promise<Response> => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured. Set NEXT_PUBLIC_API_GATEWAY_URL');
  }

  return fetch(`${API_BASE_URL.replace(/\/$/, '')}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};


