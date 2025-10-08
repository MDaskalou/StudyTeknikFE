'use server';

import { getAccessToken } from '@logto/next/server-actions';
import { revalidatePath } from 'next/cache';
import { logtoConfig } from '../logto';

const BACKEND_API_URL = 'https://localhost:7211';
const API_IDENTIFIER = 'api://studyteknik';

// ... (isToday-funktionen är densamma)

export async function getTodaysEntry() {
    // Denna funktion är redan korrekt anpassad
    // ... (ingen ändring här)
}

export async function saveDiaryEntry(content: string) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${BACKEND_API_URL}/api/diary/CreateDiary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        // RÄTTELSE: Skickar nu med 'text' och 'entryDate' som din backend förväntar sig
        body: JSON.stringify({
            text: content,
            entryDate: new Date().toISOString(),
        }),
    });

    if (!response.ok) {
        // Läs det faktiska felmeddelandet från backenden om det finns
        const errorBody = await response.text();

        // Logga detaljerad information i din frontend-terminal
        console.error("Fel från backend:", {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
        });

        // Skapa ett mer informativt fel för webbläsaren
        throw new Error(`Kunde inte spara inlägg. Backend svarade med status ${response.status}.`);
    }
    revalidatePath('/diary');
    return response.json();
}

export async function updateDiaryEntry(entryId: string, newContent: string) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${BACKEND_API_URL}/api/diary/UpdateDiary?Id=${entryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: newContent }),
    });

    if (!response.ok) throw new Error('Kunde inte uppdatera inlägg.');
    revalidatePath('/diary');
    return { success: true };
}

export async function deleteDiaryEntry(entryId: string) {
    // Denna funktion är redan korrekt anpassad
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${BACKEND_API_URL}/api/diary/DeleteDiary/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error('Kunde inte radera inlägg.');
    revalidatePath('/diary');
    return { success: true };
}