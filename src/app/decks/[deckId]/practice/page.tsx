// Fil: src/app/decks/[deckId]/practice/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

type PracticePageProps = {
    params: Promise<{ deckId: string }>
};

export default function PracticePage({ params }: PracticePageProps) {
    const router = useRouter();
    const { deckId } = use(params);

    const [cards, setCards] = useState<FlashCardDto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        async function fetchCards() {
            try {
                const response = await fetch(`/api/decks/${deckId}/flashcards`);
                if (!response.ok) {
                    throw new Error('Kunde inte hämta kort');
                }
                const data = await response.json();

                if (data.length === 0) {
                    setError('Det finns inga kort i denna lek att träna på.');
                } else {
                    // Blanda korten för variation
                    setCards(data.sort(() => Math.random() - 0.5));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ett fel uppstod');
            } finally {
                setIsLoading(false);
            }
        }
        fetchCards();
    }, [deckId]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleCorrect = () => {
        // Ta bort kortet från listan (rätt svar)
        const newCards = cards.filter((_, index) => index !== currentIndex);
        setCards(newCards);
        setCompletedCount(prev => prev + 1);
        setIsFlipped(false);

        // Om inga kort kvar, sessionen är klar
        if (newCards.length === 0) {
            return;
        }

        // Om vi var på sista kortet, gå tillbaka till första
        if (currentIndex >= newCards.length) {
            setCurrentIndex(0);
        }
    };

    const handleIncorrect = () => {
        // Flytta kortet till slutet av kön
        const newCards = [...cards];
        const [currentCard] = newCards.splice(currentIndex, 1);
        newCards.push(currentCard);
        setCards(newCards);
        setIsFlipped(false);

        // Stanna på samma index (nästa kort blir synligt)
        if (currentIndex >= newCards.length) {
            setCurrentIndex(0);
        }
    };

    const handleExit = () => {
        router.push(`/decks/${deckId}`);
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-white text-xl">Laddar kort...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">{error}</p>
                    <button
                        onClick={handleExit}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Tillbaka till kortleken
                    </button>
                </div>
            </main>
        );
    }

    if (cards.length === 0) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-white mb-2">Grattis!</h1>
                    <p className="text-slate-300 mb-6">
                        Du har klarat alla {completedCount} kort i denna session!
                    </p>
                    <button
                        onClick={handleExit}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Tillbaka till kortleken
                    </button>
                </div>
            </main>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = (completedCount / (completedCount + cards.length)) * 100;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-8">
            {/* Header med progress */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleExit}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ← Avsluta träning
                    </button>
                    <div className="text-slate-300">
                        <span className="font-semibold">{completedCount}</span> klara ·
                        <span className="font-semibold"> {cards.length}</span> kvar
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div
                className="w-full max-w-2xl h-96 perspective-1000 mb-8 cursor-pointer"
                onClick={handleFlip}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Framsida */}
                    <div
                        className="absolute w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-sm text-slate-500 mb-4 uppercase tracking-wider">Framsida</div>
                        <p className="text-3xl font-bold text-slate-900 text-center">{currentCard.frontText}</p>
                        <div className="absolute bottom-8 text-slate-400 text-sm">Klicka för att vända</div>
                    </div>

                    {/* Baksida */}
                    <div
                        className="absolute w-full h-full bg-blue-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-sm text-blue-200 mb-4 uppercase tracking-wider">Baksida</div>
                        <p className="text-3xl font-bold text-white text-center">{currentCard.backText}</p>
                        <div className="absolute bottom-8 text-blue-200 text-sm">Visste du svaret?</div>
                    </div>
                </div>
            </div>

            {/* Action buttons - visas bara när kortet är vänt */}
            {isFlipped && (
                <div className="flex gap-4 animate-fade-in">
                    <button
                        onClick={handleIncorrect}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                    >
                        ✗ Fel - Öva igen
                    </button>
                    <button
                        onClick={handleCorrect}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                    >
                        ✓ Rätt - Nästa kort
                    </button>
                </div>
            )}

            {/* Instruktioner när kortet inte är vänt */}
            {!isFlipped && (
                <div className="text-slate-400 text-center animate-fade-in">
                    <p>Försök komma ihåg svaret, klicka sedan på kortet för att vända</p>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </main>
    );
}