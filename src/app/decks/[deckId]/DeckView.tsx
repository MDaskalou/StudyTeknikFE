'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CreateFlashcardForm from '../CreateFlashcardForm';
import FlashCardListItem from '../FlashCardListItem';
import UploadForm from '../UploadForm';
import TextInputWidget from '../TextInputWidget';

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
    const [serverCards, setServerCards] = useState<FlashCardDto[]>(initialCards);
    const [optimisticAdds, setOptimisticAdds] = useState<FlashCardDto[]>([]);
    const [mode, setMode] = useState<InputMode>('manual');

    useEffect(() => {
        setServerCards(initialCards);
        setOptimisticAdds(prev => prev.filter(opt => !initialCards.some(server => server.id === opt.id)));
    }, [initialCards]);

    const flashCards = [...serverCards];
    optimisticAdds.forEach(opt => {
        if (!flashCards.some(existing => existing.id === opt.id)) {
            flashCards.push(opt);
        }
    });

    const handleCardDeleted = (deletedCardId: string) => {
        setServerCards(prev => prev.filter(c => c.id !== deletedCardId));
        setOptimisticAdds(prev => prev.filter(c => c.id !== deletedCardId));
    };

    const handleCardUpdated = (updatedCard: FlashCardDto) => {
        setServerCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        setOptimisticAdds(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    };

    const handleCardsAdded = (newCards: FlashCardDto[]) => {
        setOptimisticAdds(prev => {
            const uniqueNew = newCards.filter(n => n.id && !prev.some(p => p.id === n.id) && !serverCards.some(s => s.id === n.id));
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

            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    {(['manual', 'pdf', 'text'] as InputMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                                mode === m
                                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                        >
                            {m === 'manual' ? 'Manuellt' : m === 'pdf' ? 'Ladda upp PDF (AI)' : 'Klistra in Text (AI)'}
                        </button>
                    ))}
                </nav>
            </div>

            <section className="mb-8">
                {mode === 'manual' && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Lägg till nytt kort</h2>
                        {/* ✅ FIXAT: onCardsAdded (plural) — matchar CreateFlashcardForm:s prop */}
                        <CreateFlashcardForm deckId={deck.id} onCardsAdded={handleCardsAdded} />
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