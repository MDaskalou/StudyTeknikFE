'use server';

import { getAccessToken } from '@logto/next/server-actions';
import { revalidatePath } from 'next/cache';
import { logtoConfig } from '../logto';
import https from 'https';

// --- Konfiguration ---
const BACKEND_API_URL = 'https://localhost:44317';
const API_IDENTIFIER = 'api://studyteknik';

// Skapa en anpassad typ för fetch-options för att lösa TypeScript-fel
type FetchOptions = RequestInit & {
    agent?: https.Agent;
};

// Skapa en agent som ignorerar självsignerade certifikat (endast för lokal utveckling)
const unsafeAgent = new https.Agent({
    rejectUnauthorized: false,
});

// --- Datatyper ---
// Definierar hur ett dagboksinlägg ser ut när det kommer från ditt API.
// Vi använder 'text' här för att vara konsekventa med din backend.
type DiaryEntry = {
    id: string;
    studentId: string;
    textsnippet: string; // STANDARDISERAT NAMN
    savedAt: string;
    entryDate: string;
};


// --- Funktioner (Server Actions) ---

function isToday(someDate: Date) {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
}


export async function saveDiaryEntry(content: string) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const options: FetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        // Din backend förväntar sig 'text', så vi skickar det.
        body: JSON.stringify({
            text: content,
            entryDate: new Date().toISOString().split('T')[0],
        }),
        agent: unsafeAgent,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/diary/CreateDiary`, options);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Fel från backend (save):", { status: response.status, body: errorBody });
        throw new Error(`Kunde inte spara inlägg. Backend svarade med status ${response.status}.`);
    }

    revalidatePath('/diary');
    return response.json();
}

export async function updateDiaryEntry(entryId: string, newContent: string) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const options: FetchOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        // Din backend förväntar sig 'text'
        body: JSON.stringify({ text: newContent }),
        agent: unsafeAgent,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/diary/UpdateDiary/${entryId}`, options);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Fel från backend (update):", { status: response.status, body: errorBody });
        throw new Error('Kunde inte uppdatera inlägg.');
    }

    revalidatePath('/diary');
    return { success: true };
}

export async function deleteDiaryEntry(entryId: string) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const options: FetchOptions = {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
        agent: unsafeAgent,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/diary/DeleteDiary/${entryId}`, options);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Fel från backend (delete):", { status: response.status, body: errorBody });
        throw new Error('Kunde inte radera inlägg.');
    }

    revalidatePath('/diary');
    return { success: true };
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
    let accessToken;
    try {
        // Försök hämta token
        accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    } catch (error) {
        console.error("Fel vid hämtning av access token i getAllEntries:", error);
        // Kasta om felet så att page.tsx kan fånga det
        throw new Error('Not authenticated'); // Tydligt felmeddelande
    }

    if (!accessToken) {
        console.error("Kunde inte hämta access token för getAllEntries (token är null/undefined)");
        throw new Error('Not authenticated'); // Samma fel
    }

    // Bygg options för anropet
    const options: FetchOptions = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        agent: unsafeAgent,
        cache: 'no-store' // Se till att vi alltid får färsk data
    };

    let response;
    try {
        // Försök anropa din backend
        response = await fetch(`${BACKEND_API_URL}/api/diary/GetAllDiariesForStudent`, options);
    } catch (fetchError) {
        console.error("Nätverksfel i getAllEntries:", fetchError);
        throw new Error('Network error while fetching diaries');
    }

    // Hantera om backend svarar med 4xx eller 5xx
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Fel vid hämtning av alla inlägg (backend response):", { status: response.status, body: errorBody });
        throw new Error(`Failed to fetch diaries from backend (status ${response.status})`);
    }

    // Försök att tolka JSON-svaret
    try {
        const allEntries: DiaryEntry[] = await response.json();
        return allEntries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    } catch (jsonError) {
        console.error("Fel vid parsning av JSON i getAllEntries:", jsonError);
        throw new Error('Failed to parse diary entries from backend.');
    }
}

// src/app/diary/actions.ts

// ... (din befintliga kod för getAllEntries, updateDiaryEntry, etc.) ...

// --- NY FUNKTION FÖR AI ---
export async function rewriteWithAI(text: string): Promise<string> {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const options: FetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        // Skicka texten i det format som din backend förväntar sig (RewriteRequestDto)
        body: JSON.stringify({ text: text }),
        agent: unsafeAgent,
    };

    const response = await fetch(`${BACKEND_API_URL}/api/ai/rewrite`, options);
    if (!response.ok) {
        // Spara felmeddelandet i en variabel, eftersom det bara kan läsas en gång.
        const errorBody = await response.text();

        // Logga all användbar information för felsökning.
        console.error("--- FEL FRÅN AI-BACKEND ---");
        console.error(`Statuskod: ${response.status} (${response.statusText})`);
        console.error("Svarskropp:", errorBody);
        console.error("--- SLUT PÅ FEL ---");

        // Kasta det generiska felet som visas för användaren.
        throw new Error('Kunde inte få svar från AI-tjänsten.');
    }

    const data = await response.json();
    return data.rewrittenText;
}