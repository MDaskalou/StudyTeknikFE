// Fil: src/app/decks/[deckId]/DeckView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CreateFlashcardForm from '../CreateFlashcardForm';
import FlashCardListItem from '../FlashCardListItem';
import UploadForm from '../UploadForm';
import TextInputWidget from '../TextInputWidget';

// Typer
export type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

export type DeckDto = {
    id: string;
    title: string;
    courseName?: string;
    subjectName?: string;
};

type Props = {
    deck: DeckDto;
    initialCards: FlashCardDto[];
};

type InputMode = 'manual' | 'pdf' | 'text';

export default function DeckView({ deck, initialCards }: Props) {
    // Server-state (synkas med initialCards vid refresh)
    const [serverCards, setServerCards] = useState<FlashCardDto[]>(initialCards);
    // Optimistic-state (kort som lagts till men inte syns i serverCards än)
    const [optimisticAdds, setOptimisticAdds] = useState<FlashCardDto[]>([]);

    const [mode, setMode] = useState<InputMode>('manual');

    // 1. Synka serverCards med props OCH städa optimisticAdds
    useEffect(() => {
        setServerCards(initialCards);
        // Om ett kort nu finns i initialCards, ta bort det från optimisticAdds
        setOptimisticAdds(prev => prev.filter(opt => !initialCards.some(server => server.id === opt.id)));
    }, [initialCards]);

    // 2. Beräkna visade kort: ServerCards + Unika OptimisticCards
    const flashCards = [...serverCards];
    optimisticAdds.forEach(opt => {
        if (!flashCards.some(existing => existing.id === opt.id)) {
            flashCards.push(opt);
        }
    });

    // Hantera borttagning av kort direkt i state
    const handleCardDeleted = (deletedCardId: string) => {
        setServerCards((prev) => prev.filter(c => c.id !== deletedCardId));
        setOptimisticAdds((prev) => prev.filter(c => c.id !== deletedCardId));
    };

    // Hantera uppdatering av kort direkt i state
    const handleCardUpdated = (updatedCard: FlashCardDto) => {
        setServerCards((prev) => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        setOptimisticAdds((prev) => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    };

    const handleCardsAdded = (newCards: FlashCardDto[]) => {
        console.log('[DeckView] handleCardsAdded called with:', newCards); // DEBUG
        // Lägg till i optimistic
        setOptimisticAdds((prev) => {
            // Undvik dubbletter i optimistic-listan
            const uniqueNew = newCards.filter(n => !prev.some(p => p.id === n.id));
            console.log('[DeckView] New unique cards to add:', uniqueNew); // DEBUG
            return [...prev, ...uniqueNew];
        });
    };

    const hasCards = flashCards.length > 0;

    return (
        <main className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{deck.title}</h1>
                    {deck.courseName && (
                        <p className="text-slate-500 text-sm mt-1">Kurs: {deck.courseName}</p>
                    )}
                    <p className="text-slate-500 font-medium mt-1">Antal kort: {flashCards.length}</p>
                </div>

                {hasCards && (
                    <Link
                        href={`/decks/${deck.id}/practice`}
                        className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 shadow-md transition-colors"
                    >
                        🎯 Börja träna
                    </Link>
                )}
            </div>

            {/* TAB-MENY FÖR ATT SKAPA KORT */}
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    <button
                        onClick={() => setMode('manual')}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${mode === 'manual'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                    >
                        Manuellt
                    </button>
                    <button
                        onClick={() => setMode('pdf')}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${mode === 'pdf'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                    >
                        Ladda upp PDF (AI)
                    </button>
                    <button
                        onClick={() => setMode('text')}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${mode === 'text'
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                    >
                        Klistra in Text (AI)
                    </button>
                </nav>
            </div>

            <section className="mb-8">
                {mode === 'manual' && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Lägg till nytt kort</h2>
                        <CreateFlashcardForm deckId={deck.id} onCardAdded={handleCardsAdded} />
                    </>
                )}
                {mode === 'pdf' && (
                    <UploadForm deckId={deck.id} onCardsAdded={handleCardsAdded} />
                )}
                {mode === 'text' && (
                    <TextInputWidget deckId={deck.id} onCardsAdded={handleCardsAdded} />
                )}
            </section>

            <hr className="my-8 border-slate-200 dark:border-slate-700" />

            {/* SEKTION FÖR ATT VISA KORTEN */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Befintliga kort i denna lek</h2>
                    <span className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                        {flashCards.length} st
                    </span>
                </div>

                {flashCards.length > 0 ? (
                    <ul className="space-y-4">
                        {flashCards.map((card) => (
                            <FlashCardListItem
                                key={card.id}
                                deckId={deck.id}
                                flashCard={card}
                                onDelete={handleCardDeleted}
                                onUpdate={handleCardUpdated}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Det finns inga kort i denna lek än.</p>
                        <p className="text-slate-600 dark:text-slate-500 text-sm">Välj en metod ovan för att skapa kort! 👆</p>
                    </div>
                )}
            </section>
        </main>
    );
}
