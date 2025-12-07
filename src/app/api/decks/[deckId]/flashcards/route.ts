// Fil: src/app/api/decks/[deckId]/flashcards/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto'; // Se till att sökvägen stämmer
import https from 'https';
// 'Route' importerades men användes inte, så jag tog bort den.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';
const unsafeAgent = new https.Agent({ rejectUnauthorized: false });
type FetchOptions = RequestInit & { agent?: https.Agent };

// Typ för vårt context-löfte (används av båda funktionerna)
type RouteContext = {
    params: {
        deckId: string;
    }
};

// --- GET-funktion (Hämta alla kort) ---
export async function GET(
    request: NextRequest,
    contextPromise: Promise<RouteContext> // Fix för Next 15
) {
    try {
        const { params } = await contextPromise; // Fix för Next 15
        const { deckId } = params;

        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            // Fullständig felhantering
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // URL:en till din C#-slutpunkt
        const backendApiUrl = `${API_BASE_URL}/api/decks/${deckId}/flashcards`;

        const options: FetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            agent: unsafeAgent,
            cache: 'no-store'
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            const flashcards = await response.json();
            return NextResponse.json(flashcards); // Returnera listan med kort
        } else {
            // Fullständig felhantering
            const errorText = await response.text();
            console.error(`Fel från backend (${backendApiUrl}):`, errorText);
            return NextResponse.json({ error: `Kunde inte hämta kort: ${errorText}` }, { status: response.status });
        }

    } catch (error) {
        // Fullständig felhantering
        console.error("KRASCH I /api/decks/[deckId]/flashcards GET:", error);
        const errorMessage = (error instanceof Error) ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


// ========================================================================
//  KORRIGERING: Detta ska vara 'POST', inte 'GET'
// ========================================================================
export async function POST(
    request: NextRequest,
    contextPromise: Promise<RouteContext> // Fix för Next 15
) {
    try {
        const {params} = await contextPromise; // Fix för Next 15
        const {deckId} = params;

        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            // Fullständig felhantering
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }

        let data;
        try {
            data = await request.json(); // Hantera om bodyn är tom/felaktig
        } catch (jsonError) {
            return NextResponse.json({error: 'Ogiltig JSON-body'}, {status: 400});
        }

        const {frontText, backText} = data;

        if (!frontText || !backText) {
            // Fullständig felhantering
            return NextResponse.json({error: 'Fråga och svar får inte vara tomma'}, {status: 400});
        }

        const backendApiUrl = `${API_BASE_URL}/api/decks/${deckId}/flashcards`;

        const options: FetchOptions = {
            method: 'POST', // Korrekt metod
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({frontText, backText}),
            agent: unsafeAgent
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            const createdFlashcard = await response.json();
            return NextResponse.json(createdFlashcard, {status: 201});
        } else {
            // Fullständig felhantering
            const errorText = await response.text();
            console.error(`Fel från backend (${backendApiUrl}):`, errorText);
            return NextResponse.json({error: `Kunde inte skapa kort: ${errorText}`}, {status: response.status});
        }

    } catch (error) {
        // Fullständig felhantering
        console.error("KRASCH I /api/decks/[deckId]/flashcards POST:", error);
        const errorMessage = (error instanceof Error) ? error.message : "Internal server error";
        return NextResponse.json({error: errorMessage}, {status: 500});
    }
}