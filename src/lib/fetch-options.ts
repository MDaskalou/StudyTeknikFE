import https from 'https';

const isDev = process.env.NODE_ENV === 'development';

export const unsafeAgent = isDev
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

export interface FetchOptions extends RequestInit {
    agent?: https.Agent;
}