import type { LogtoNextConfig } from '@logto/next';


export const logtoConfig: LogtoNextConfig = {
    endpoint: 'https://9ixsif.logto.app/',
    appId: 'o3z4mipd9v9y17kbx2le7',
    appSecret: 'mjxU1BdvO3AiZKtdlWX6KKc2s56BjbnH',
    baseUrl: 'http://localhost:3000',
    cookieSecret: 'EbdkT9AXEtlLwzXTd8PfWeHjedSmTwva',
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
