// Fil: src/app/decks/[deckId]/page.tsx
'use server';

import { headers } from 'next/headers';
import DeckView, { DeckDto, FlashCardDto } from './DeckView';

// Centraliserad bas-URL för att undvika localhost-problem på Netlify
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyteknik.netlify.app';

// Typen för de lösta propsen
type DeckDetailsPageProps = {
    params: Promise<{ deckId: string }>
};

async function getFlashCards(deckId: string): Promise<FlashCardDto[]> {
    const allHeaders = await headers();
    const cookieHeader = allHeaders.get('cookie') || '';

    // Använder BASE_URL för att säkerställa att anropet når din interna rutt på Netlify
    const response = await fetch(`${BASE_URL}/api/decks/${deckId}/flashcards`, {
        cache: 'no-store',
        headers: { 'Cookie': cookieHeader }
    });

    if (!response.ok) {
        console.error(`Fel vid hämtning av flashcards för ${deckId}: ${response.status}`);
        return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

async function getDeck(deckId: string): Promise<DeckDto | null> {
    const allHeaders = await headers();
    const cookieHeader = allHeaders.get('cookie') || '';

    // Använder BASE_URL istället för localhost
    const response = await fetch(`${BASE_URL}/api/decks/${deckId}`, {
        cache: 'no-store',
        headers: { 'Cookie': cookieHeader }
    });

    if (!response.ok) {
        console.error(`Kunde inte hämta kortlek ${deckId}: ${response.status}`);
        return null;
    }
    return response.json();
}

export default async function DeckDetailsPage(
    props: DeckDetailsPageProps
) {
    const params = await props.params;
    const { deckId } = params;

    // Kör båda anropen parallellt för prestanda
    const [deck, flashCards] = await Promise.all([
        getDeck(deckId),
        getFlashCards(deckId)
    ]);

    // Fallback om kortleken inte hittas
    if (!deck) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div role="alert" className="p-4 rounded border-s-4 border-red-500 bg-red-800 text-red-100">
                    <h1 className="text-2xl font-bold mb-2">Kortlek hittades inte</h1>
                    <p>Kunde inte hitta kortleken med ID: {deckId}</p>
                </div>
            </div>
        );
    }

    return <DeckView deck={deck} initialCards={flashCards} />;
}