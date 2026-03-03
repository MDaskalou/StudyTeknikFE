// Fil: src/app/api/ai/generate-cards/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';
import { BACKEND_API_URL } from '@/lib/constants';


const API_IDENTIFIER = 'api://studyteknik';

// Denna funktion tar emot JSON från klienten och skickar vidare till C#
export async function POST(request: NextRequest) {
    try {
        // 1. Hämta token
        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 2. Hämta JSON från klienten
        const body = await request.json();

        // Validera att vi har rätt fält
        if (!body.pdfContent || !body.deckId) {
            return NextResponse.json({ error: 'Missing required fields: pdfContent, deckId' }, { status: 400 });
        }

        // 3. Bygg anropet till C#-backend
        // Endpoint enligt krav: POST /api/ai/generate-cards
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/ai/generate-cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
            // 'agent' behövs inte för fetch i Next.js server context om NODE_TLS_REJECT_UNAUTHORIZED=0 är satt globalt
        });

        // 4. Hantera svar från C#
        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Fel från C# AI backend (Text):", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json({ error: errorJson.description || "Fel från backend" }, { status: backendResponse.status });
            } catch (e) {
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
