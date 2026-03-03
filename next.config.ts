import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // Tillåter produktion-build även om det finns ESLint-fel (som "any")
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Tillåter bygget även om det finns strikta TypeScript-typfel
        ignoreBuildErrors: true,
    },
};

export default nextConfig;