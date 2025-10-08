export const logtoConfig = {
    endpoint: 'https://9ixsif.logto.app/',
    appId: 'inwctt7gk91egc00kifos',
    appSecret: 'g6hTsy5r2CLMzVQHibdTmfxqmZlzYNUQ',
    baseUrl: 'http://localhost:3000', // Change to your own base URL
    cookieSecret: 'VjcPbAYvwhHnIxvx4QNPfvYURzxqFEVI', // Auto-generated 32 digit secret
    cookieSecure: process.env.NODE_ENV === 'production',
    scopes: ['openid', 'profile', 'email', 'urn:logto:scope:roles'],

};