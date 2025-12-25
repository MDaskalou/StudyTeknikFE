// Fil: src/app/api/ai/generate-cards/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto'; // Se till att sökvägen stämmer

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';

// Denna funktion strömmar FormData från Next.js till C#
export async function POST(request: NextRequest) {
    try {
        // 1. Hämta token
        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 2. Hämta FormData från klienten
        const formData = await request.formData();

        // 3. Bygg anropet till C#-backend
        // Denna URL matchar din nya C# AIController
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/ai/generate-cards-from-file`, {
            method: 'POST',
            headers: {
                // Skicka INTE 'Content-Type', 'fetch' sätter rätt 'multipart/form-data'
                // gräns (boundary) automatiskt när body är FormData.
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
            // 'agent' behövs inte, 'NODE_TLS_REJECT_UNAUTHORIZED=0' löser detta
        });

        // 4. Hantera svar från C#
        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Fel från C# AI backend:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json({ error: errorJson.description || "Fel från backend" }, { status: backendResponse.status });
            } catch(e) {
                return NextResponse.json({ error: errorText }, { status: backendResponse.status });
            }
        }

        // Skicka tillbaka den lyckade listan med kort till klienten
        const suggestedCards = await backendResponse.json();
        return NextResponse.json(suggestedCards);

    } catch (error) {
        console.error("KRASCH I /api/ai/generate-cards POST:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}