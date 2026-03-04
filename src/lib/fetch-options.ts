import https from 'https';

const isDev = process.env.NODE_ENV === 'development';

export const unsafeAgent = isDev
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

export type FetchOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    cache?: RequestCache;
    agent?: https.Agent;
};