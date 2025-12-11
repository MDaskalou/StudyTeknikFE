// Fil: src/app/decks/[deckId]/page.tsx
'use server';

import { headers } from 'next/headers';
import CreateFlashcardForm from '../CreateFlashcardForm';
import FlashCardListItem from '../FlashCardListItem';
import Link from 'next/link';
import UploadForm from '../UploadForm'; // <-- STEG 1: LÄGG TILL DEN NYA IMPORTEN

// --- Definiera typerna för vår data ---
type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
    // ... andra fält du vill visa ...
};

// Typen för de lösta propsen
type DeckDetailsPageProps = {
    params: Promise<{ deckId: string }>
};
// --- SLUT PÅ TYPER ---

async function getFlashCards(deckId: string): Promise<FlashCardDto[]> {
    const allHeaders = await headers();
    const cookieHeader = allHeaders.get('cookie') || '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/decks/${deckId}/flashcards`, {
        cache: 'no-store',
        headers: { 'Cookie': cookieHeader }
    });
    if (!response.ok) {
        try {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `Kunde inte hämta kort (status ${response.status})`);
        } catch (e) {
            throw new Error(`Kunde inte hämta kort (status ${response.status})`);
        }
    }
    return response.json();
}


// ========================================================================
//  Huvudkomponenten
// ========================================================================
export default async function DeckDetailsPage(
    props: DeckDetailsPageProps
) {

    const params = await props.params;

    const { deckId } = params;

    let flashCards: FlashCardDto[] = [];
    let fetchError: string | null = null;

    try {
        flashCards = await getFlashCards(deckId);
    } catch (error) {
        console.error("Fel vid hämtning av flashcards:", error);
        fetchError = (error instanceof Error) ? error.message : "Okänt fel vid hämtning av kort.";
    }

    // Beräkna om vi har kort (för att visa/dölja "Öva"-knappen)
    const hasCards = !fetchError && flashCards && flashCards.length > 0;

    return (
        <main className="max-w-4xl mx-auto p-8">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kortlek (ID: {deckId})</h1>

                {/* Träna-knapp - visas bara om det finns kort */}
                {hasCards && (
                    <Link
                        href={`/decks/${deckId}/practice`}
                        className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 shadow-md transition-colors"
                    >
                        🎯 Börja träna
                    </Link>
                )}
            </div>

            {/* DIN BEFINTLIGA SEKTION FÖR ATT SKAPA KORT MANUELLT */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Lägg till nytt kort</h2>
                <CreateFlashcardForm deckId={deckId} />
            </section>

            {/* ====================================================== */}
            {/* STEG 2: LÄGG TILL DIN NYA UPLOAD-SEKTION HÄR           */}
            {/* ====================================================== */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">...eller Skapa från Fil (AI)</h2>
                <UploadForm deckId={deckId} />
            </section>


            <hr className="my-8 border-slate-200 dark:border-slate-700" />

            {/* DIN BEFINTLIGA SEKTION FÖR ATT VISA KORTEN */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Befintliga kort i denna lek</h2>

                {fetchError && (
                    <div role="alert" className="p-4 mb-4 rounded border-s-4 border-red-500 bg-red-800 text-red-100">
                        <p className="font-medium">Kunde inte ladda kort:</p>
                        <p>{fetchError}</p>
                    </div>
                )}

                {hasCards ? (
                    <ul className="space-y-4">
                        {flashCards.map((card) => (
                            <FlashCardListItem
                                key={card.id}
                                deckId={deckId}
                                flashCard={card}
                            />
                        ))}
                    </ul>
                ) : (
                    !fetchError && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">Det finns inga kort i denna lek än.</p>
                            <p className="text-slate-600 dark:text-slate-500 text-sm">Lägg till kort ovan (manuellt eller med AI) för att börja träna! 👆</p>
                        </div>
                    )
                )}
            </section>
        </main>
    );
}