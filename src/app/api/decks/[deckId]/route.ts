// Fil: src/app/decks/[deckId]/api/route.ts
// DENNA FIL HANTERAR ANROP TILL /decks/123/api

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';

// Typ för contexten
type RouteContext = {
    params: {
        deckId: string;
    }
};

// ========================================================================
//  PUT-funktionen (för att redigera en kortlek)
// ========================================================================
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { params } = context;
        await params; // Next 15-fix
        const { deckId } = params;

        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        // Uppdaterad URL för att vara konsekvent (anta att din backend hanterar PUT på /api/decks/ID)
        const backendApiUrl = `${BACKEND_API_URL}/api/decks/${deckId}`;

        const options: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body),
            // 'agent' är borttagen för standardkompatibilitet
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            return new NextResponse(null, { status: 204 }); // 204 No Content
        } else {
            const errorText = await response.text();
            return NextResponse.json({ error: `Backend-fel: ${errorText}` }, { status: response.status });
        }
    } catch(error) {
        console.error("KRASCH I /api/decks/[deckId] PUT:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// ========================================================================
//  DELETE-funktionen (för att ta bort en kortlek)
// ========================================================================
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { params } = context;
        await params; // Next 15-fix
        const { deckId } = params;

        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const backendApiUrl = `${BACKEND_API_URL}/api/decks/${deckId}`;

        const options: RequestInit = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            // 'agent' är borttagen
        };

        const response = await fetch(backendApiUrl, options);

        if (response.ok) {
            return new NextResponse(null, { status: 204 }); // 204 No Content
        } else {
            const errorText = await response.text();
            return NextResponse.json({ error: `Backend-fel: ${errorText}` }, { status: response.status });
        }
    } catch (error) {
        console.error("KRASCH I /api/decks/[deckId] DELETE:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// 
// GET-funktionen (för alla kortlekar) är BORTTAGEN HÄRIFRÅN.
// Den ligger nu i /src/app/decks/api/route.ts
//