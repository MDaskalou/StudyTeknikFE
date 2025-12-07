// Fil: src/app/decks/api/route.ts
// DENNA FIL HANTERAR ANROP TILL /decks/api

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';

// ========================================================================
//  GET-funktionen (för att hämta ALLA kortlekar)
// ========================================================================
export async function GET(request: NextRequest) {
    try {
        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if(!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const options: RequestInit = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            cache: 'no-store'
            // Notera: 'agent' är borttagen. Om du har certifikatproblem
            // (som "self-signed certificate"), se till att Node.js körs med
            // NODE_TLS_REJECT_UNAUTHORIZED=0 (vilket dina loggar indikerar att det gör).
        };

        // Anropa din backend för att hämta alla kortlekar
        const response = await fetch(`${BACKEND_API_URL}/api/decks/GetAllDecks`, options);

        if(!response.ok) {
            const errorText = await response.text();
            console.error("Fel från backend (/api/decks/GetAllDecks):", errorText);
            // Returnera felet från backend
            return NextResponse.json({ error: `Failed to fetch decks: ${errorText}` }, { status: response.status });
        }

        const decks = await response.json();
        // Returnera kortlekarna
        return NextResponse.json(decks);

    } catch(error) {
        console.error("KRASCH I /decks/api GET:", error);
        const errorMessage = (error instanceof Error) ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


// ========================================================================
//  POST-funktionen (för att SKAPA en ny kortlek)
// ========================================================================
export async function POST(request: NextRequest) {
    try {
        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Läs datan från CreateDeckForm
        const body = await request.json();

        const backendApiUrl = `${BACKEND_API_URL}/api/decks/CreateDeck`;

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            const newDeck = await response.json();
            return NextResponse.json(newDeck, { status: 201 }); // 201 Created
        } else {
            const errorText = await response.text();
            console.error("Fel från backend (/api/decks/CreateDeck):", errorText);
            return NextResponse.json({ error: `Backend-fel: ${errorText}` }, { status: response.status });
        }

    } catch (error) {
        console.error("KRASCH I /decks/api POST:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}