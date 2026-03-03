import { BACKEND_API_URL } from '@/lib/constants';

export const API_BASE_URL = BACKEND_API_URL;

export const getHeaders = (token?: string) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};