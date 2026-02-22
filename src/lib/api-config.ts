export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';

export const getHeaders = (token?: string) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};
