import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    eslint: {
        ignoreDuringBuilds: true,
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;