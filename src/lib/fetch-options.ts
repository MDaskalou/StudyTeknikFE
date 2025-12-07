import https from 'https';

// Agent to ignore self-signed certificate errors during development
export const unsafeAgent = new https.Agent({
    rejectUnauthorized: false,
});

// Define FetchOptions if needed globally (optional)
export interface FetchOptions extends RequestInit {
    agent?: https.Agent;
}