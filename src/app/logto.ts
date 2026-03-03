import type { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
    endpoint: process.env.LOGTO_ENDPOINT || 'https://9ixsif.logto.app/',
    appId: process.env.LOGTO_APP_ID || 'o3z4mipd9v9y17kbx2le7',
    appSecret: process.env.LOGTO_APP_SECRET || 'mjxU1BdvO3AiZKtdlWX6KKc2s56BjbnH',
    baseUrl: process.env.LOGTO_BASE_URL || 'http://localhost:3000',
    cookieSecret: process.env.LOGTO_COOKIE_SECRET || 'EbdkT9AXEtlLwzXTd8PfWeHjedSmTwva',
    cookieSecure: process.env.NODE_ENV === 'production',

    resources: ['api://studyteknik'],

    scopes: [
        'openid',
        'profile',
        'email',
        'diary:write',
        'diary:read',
        'diary:create',
        'urn:logto:scope:roles'
    ],
};

export const API_IDENTIFIER = 'api://studyteknik'