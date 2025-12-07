// src/app/diary/api/route.ts
// DEN HÄR FILEN SKA FINNAS KVAR!

import { type NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto'; // Justera sökväg
import { API_IDENTIFIER, BACKEND_API_URL } from '@/lib/constants'; // Justera sökväg
import { unsafeAgent } from '@/lib/fetch-options'; // Justera sökväg

// Definiera typen (du kan behöva denna)
interface DiaryEntry {
    id: string;
    studentId: string;
    entryDate: string;
    textsnippet: string; // Se till att detta matchar din backend
    // Lägg till andra fält om de finns
}

export async function GET(request: NextRequest) {
    try {
        // Denna kommer nu fungera, eftersom 'request' kommer ha cookies
        const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if(!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            agent: unsafeAgent,
            cache: 'no-store' as RequestCache
        };

        // Anropa din BACKEND
        const response = await fetch(`${BACKEND_API_URL}/api/diary/GetAllDiariesForStudent`, options); // Bytte till din action-URL

        if(!response.ok) {
            console.error("Fel vid hämtning av dagboksinlägg (API Route):", await response.text());
            return NextResponse.json({ error: 'Failed to fetch diaries' }, { status: response.status });
        }

        const allEntries: DiaryEntry[] = await response.json();
        const sortedEntries = allEntries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

        return NextResponse.json(sortedEntries);

    } catch(error) {
        console.error("KRASCH I /api/diaries GET:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}