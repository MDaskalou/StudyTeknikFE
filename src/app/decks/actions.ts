'use server'; // Markerar att detta är Server Actions

import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '../logto'; // <-- KONTROLLERA ATT DENNA SÖKVÄG ÄR RÄTT
import https from 'https';
import { BACKEND_API_URL } from '@/lib/constants';


// --- INTERFACES (Oförändrade) ---
interface ApiError {
    code: string;
    description: string;
    type: number;
}
interface DeckDto {
    id: string;
    title: string;
    courseName: string;
    subjectName: string;
    createdAtUtc: string;
    cardCount: number;
}
interface ActionResult {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    createdDeck?: DeckDto;
}
type DeckUpdateData = {
    title: string;
    courseName: string;
    subjectName: string;
};

// --- KONSTANTER (Oförändrade) ---
const API_IDENTIFIER = 'api://studyteknik';
const unsafeAgent = new https.Agent({ rejectUnauthorized: false });
type FetchOptions = RequestInit & { agent?: https.Agent };



// --- ACTION FÖR ATT SKAPA KORTLEK (Perfekt) ---
export async function createDeckAction(
    _prevState: ActionResult | undefined, // <-- FIX: Omdöpt för att tysta varning
    formData: FormData
): Promise<ActionResult> {

    const title = formData.get('title') as string;
    const courseName = formData.get('courseName') as string;
    const subjectName = formData.get('subjectName') as string;

    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated (token missing)' };
    }

    try {
        const options: FetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ title, courseName, subjectName }),
            agent: unsafeAgent
        };

        const response = await fetch(`${BACKEND_API_URL}/api/decks/CreateDeck`, options);

        if (response.ok) {
            const createdDeck: DeckDto = await response.json();
            revalidatePath('/decks');
            return {
                success: true,
                message: 'Kortlek skapad!',
                createdDeck
            };
        } else {
            const errorText = await response.text();
            let errorBody: ApiError | string = errorText;
            try {
                errorBody = JSON.parse(errorText);
            } catch (_parseError) {
                console.warn("Backend error response was not valid JSON:", errorText);
            }
            console.error("Fel från backend (createDeckAction):", { status: response.status, body: errorBody });
            const errorMessage = typeof errorBody === 'object' && 'description' in errorBody ? errorBody.description : `Kunde inte skapa kortlek. Statuskod: ${response.status}`;
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Nätverksfel eller annat fel i createDeckAction:", error);
        return { success: false, message: 'Ett oväntat nätverksfel inträffade vid skapandet av kortleken.' };
    }
}



// --- ACTION FÖR ATT RADERA KORTLEK (Perfekt) ---
export async function deleteDeckAction(deckId: string): Promise<{ success: boolean; message?: string }> {

    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated (token missing)' };
    }

    try {
        // --- WORKAROUND: Klient-side cascade delete ---
        // Eftersom backend har FK-lås, måste vi ta bort alla kort först.
        try {
            // 1. Hämta alla kort i leken
            const getCardsUrl = `${BACKEND_API_URL}/api/decks/${deckId}/flashcards`;
            const getCardsRes = await fetch(getCardsUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` },
                agent: unsafeAgent,
                cache: 'no-store'
            } as FetchOptions);

            if (getCardsRes.ok) {
                const cards = await getCardsRes.json();
                if (Array.isArray(cards) && cards.length > 0) {
                    // 2. Ta bort alla kort parallellt
                    await Promise.all(cards.map(async (card: { id: string }) => {
                        await fetch(`${BACKEND_API_URL}/api/decks/${deckId}/flashcards/${card.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${accessToken}` },
                            agent: unsafeAgent
                        } as FetchOptions);
                    }));
                }
            }
        } catch (cascadeError) {
            console.warn("Kunde inte rensa kort innan borttagning av lek (kan bero på att leken redan är tom eller nätverksfel):", cascadeError);
            // Vi fortsätter och försöker ta bort leken ändå
        }
        // ----------------------------------------------


        const options: FetchOptions = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            agent: unsafeAgent
        };

        const response = await fetch(`${BACKEND_API_URL}/api/decks/DeleteDeck/${deckId}`, options);

        if (response.ok || response.status === 204) {
            revalidatePath('/decks');
            return { success: true, message: 'Kortlek borttagen!' };
        } else {
            const errorText = await response.text();
            let errorBody: ApiError | string = errorText;
            try {
                errorBody = JSON.parse(errorText);
            } catch (_parseError) {
                console.warn("Backend error response was not valid JSON:", errorText);
            }
            console.error("Fel från backend (deleteDeckAction):", { status: response.status, body: errorBody });
            const errorMessage = typeof errorBody === 'object' && 'description' in errorBody
                ? errorBody.description
                : `Kunde inte ta bort kortlek. (Status: ${response.status}). Kontrollera att den är tom.`;
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Nätverksfel eller annat fel i deleteDeckAction:", error);
        return { success: false, message: 'Ett oväntat nätverksfel inträffade vid borttagning av kortleken.' };
    }
}

export async function getDecksAction(): Promise<{
    success: boolean;
    decks?: DeckDto[];
    message?: string;
}> {

    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated (token missing)' };
    }

    try {
        const options: FetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            agent: unsafeAgent,
            cache: 'no-store' // Se till att vi alltid får färsk data
        };

        // Anropa din externa backend för att hämta kortlekar
        const response = await fetch(`${BACKEND_API_URL}/api/decks/GetAllDecks`, options);

        if (response.ok) {
            const decks: DeckDto[] = await response.json();
            return { success: true, decks: decks };
        } else {
            const errorText = await response.text();
            let errorBody: ApiError | string = errorText;
            try {
                errorBody = JSON.parse(errorText);
            } catch (_parseError) {
                console.warn("Backend error response was not valid JSON:", errorText);
            }
            console.error("Fel från backend (getDecksAction):", { status: response.status, body: errorBody });
            const errorMessage = typeof errorBody === 'object' && 'description' in errorBody ? errorBody.description : `Kunde inte hämta kortlekar. Statuskod: ${response.status}`;
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Nätverksfel eller annat fel i getDecksAction:", error);
        return { success: false, message: 'Ett oväntat nätverksfel inträffade vid hämtning av kortlekarna.' };
    }
}

export async function updateDeckAction(
    deckId: string,
    updateData: DeckUpdateData
): Promise<ActionResult> {
    // 1. Hämta token (precis som dina andra actions)
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated (token missing)' };
    }

    try {
        // 2. Bygg options (precis som dina andra actions)
        const options: FetchOptions = {
            method: 'PUT', // <-- Sätt metod till PUT
            headers: {
                'Content-Type': 'application/json', // <-- Lägg till Content-Type
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updateData), // <-- Lägg till bodyn
            agent: unsafeAgent
        };

        // 3. Anropa C# backend DIREKT
        // (Baserat på din C#-controller: [HttpPut("UpdateDeck/{Id}")])
        const response = await fetch(`${BACKEND_API_URL}/api/decks/UpdateDeck/${deckId}`, options);

        // 4. Hantera svar (precis som din deleteDeckAction)
        if (response.ok || response.status === 204) {
            revalidatePath('/decks'); // Ladda om /decks-sidan
            return { success: true, message: 'Kortleken uppdaterad!' };
        } else {
            // Hantera fel (precis som dina andra actions)
            const errorText = await response.text();
            let errorBody: ApiError | string = errorText;
            try {
                errorBody = JSON.parse(errorText);
            } catch (_parseError) {
            }
            console.error("Fel från backend (updateDeckAction):", { status: response.status, body: errorBody });
            const errorMessage = typeof errorBody === 'object' && 'description' in errorBody ? errorBody.description : `Kunde inte uppdatera kortlek. Statuskod: ${response.status}`;
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Nätverksfel eller annat fel i updateDeckAction:", error);
        return { success: false, message: 'Ett oväntat nätverksfel inträffade vid uppdatering av kortleken.' };
    }
}
export async function deleteFlashCardAction(deckId: string, flashCardId: string): Promise<ActionResult> {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/decks/${deckId}/flashcards/${flashCardId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            agent: unsafeAgent
        } as RequestInit & { agent?: https.Agent });

        if (response.ok || response.status === 204) {
            revalidatePath(`/decks/${deckId}`);
            return { success: true, message: 'Kort borttaget' };
        } else {
            const errorText = await response.text();
            return { success: false, message: `Fel vid borttagning: ${errorText}` };
        }
    } catch (error) {
        console.error("Delete flashcard error:", error);
        return { success: false, message: 'Nätverksfel vid borttagning' };
    }
}

export async function updateFlashCardAction(
    deckId: string,
    flashCardId: string,
    frontText: string,
    backText: string
): Promise<ActionResult> {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);
    if (!accessToken) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/decks/${deckId}/flashcards/${flashCardId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ frontText, backText }),
            agent: unsafeAgent
        } as RequestInit & { agent?: https.Agent });

        if (response.ok) {
            revalidatePath(`/decks/${deckId}`);
            return { success: true, message: 'Kort uppdaterat' };
        } else {
            const errorText = await response.text();
            return { success: false, message: `Fel vid uppdatering: ${errorText}` };
        }
    } catch (error) {
        console.error("Update flashcard error:", error);
        return { success: false, message: 'Nätverksfel vid uppdatering' };
    }
}
