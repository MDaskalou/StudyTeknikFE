// Fil: src/app/api/decks/[deckId]/flashcards/[flashcardId]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';
import https from 'https';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';
const unsafeAgent = new https.Agent({ rejectUnauthorized: false });
type FetchOptions = RequestInit & { agent?: https.Agent };

// ========================================================================
//  FIX 1: RÄTTA STAVNINGEN PÅ 'flashcardId' (litet c)
// ========================================================================
type PutContext = {
    params: {
        deckId: string;
        flashcardId: string; // <-- SKA VARA LITET 'c'
    }
};

/**
 * Hanterar PUT-förfrågningar för att uppdatera ett specifikt flashcard
 */
export async function PUT(
    request: NextRequest,
    // ========================================================================
    //  FIX 2: DEN KORREKTA SYNTAXEN FÖR NEXT 15 (matchar dina andra filer)
    // ========================================================================
    context: PutContext
) {
    try {
        // 1. Destrukturera ut 'params' (som är ett löfte)
        const { params } = context;

        // 2. 'await' params-objektet INNAN du använder det
        await params;

        // 3. Nu kan du säkert komma åt params (med RÄTT stavning)
        const { deckId, flashcardId } = params; // <-- SKA VARA LITET 'c'

        // 4. Felsäkringen (denna ska nu INTE köras)
        if (!flashcardId || flashcardId === 'undefined') {
            throw new Error("flashcardId var 'undefined'.");
        }

        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const data = await request.json();
        const { frontText, backText } = data;

        if (!frontText || !backText) {
            return NextResponse.json({ error: 'Fråga och svar får inte vara tomma' }, { status: 400 });
        }

        // 5. Använd rätt stavning i URL:en
        const backendApiUrl = `${API_BASE_URL}/api/decks/${deckId}/flashcards/${flashcardId}`;

        const options: FetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ frontText, backText }),
            agent: unsafeAgent
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            return new NextResponse(null, { status: 204 });
        } else {
            const errorText = await response.text();
            console.error(`Fel från backend (${backendApiUrl}):`, errorText);
            return NextResponse.json({ error: `Kunde inte uppdatera kort: ${errorText}` }, { status: response.status });
        }

    } catch (error) {
        console.error("KRASCH I /api/decks/.../flashcards/[flashcardId] PUT:", error);
        const errorMessage = (error instanceof Error) ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}