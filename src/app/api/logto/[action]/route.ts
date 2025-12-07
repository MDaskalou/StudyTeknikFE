// Fil: src/app/api/logto/[action]/route.ts
import { type NextRequest } from 'next/server';
import handleAuthRoutes from '@logto/next';
import { logtoConfig } from '@/app/logto';

// Vi stänger av ESLint-regeln för nästa rad eftersom bibliotekets typer spökar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logtoHandler = (handleAuthRoutes as any)(logtoConfig);

type RouteProps = {
    params: Promise<{ action: string }>;
};

export async function GET(request: NextRequest, props: RouteProps) {
    const params = await props.params;
    return logtoHandler(request, { params });
}

export async function POST(request: NextRequest, props: RouteProps) {
    const params = await props.params;
    return logtoHandler(request, { params });
}