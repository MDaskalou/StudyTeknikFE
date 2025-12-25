// Fil: src/app/decks/[deckId]/practice/page.tsx
'use client';

import { useEffect, useState, use, useCallback } from 'react';
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

    const handleFlip = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const handleCorrect = useCallback(() => {
        setCards((prevCards) => {
            const newCards = prevCards.filter((_, index) => index !== currentIndex);
            if (newCards.length === 0) return [];
            return newCards;
        });
        setCompletedCount((prev) => prev + 1);
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev >= cards.length - 1 ? 0 : prev)); // Justering behövs kanske beroende på filter
        // Enklare logik: Om vi tar bort nuvarande, så blir nästa kort det som nu hamnar på 'currentIndex' (om det inte var sista)
        // Men eftersom cards ändras asynkront här inne, måste vi vara försiktiga med currentIndex.
        // Bättre att nollställa index om det blir out of bounds.
        setCurrentIndex(0); // Förenkling: Gå alltid till första kortet i den nya leken (som är shufflad eller ej)
    }, [cards.length, currentIndex]);

    const handleIncorrect = useCallback(() => {
        setCards((prevCards) => {
            const newCards = [...prevCards];
            const [currentCard] = newCards.splice(currentIndex, 1);
            newCards.push(currentCard);
            return newCards;
        });
        setIsFlipped(false);
        setCurrentIndex(0); // Återigen, håll oss till "toppen" av leken för enkelhet
    }, [currentIndex]);

    // Korrekt logik för indexhantering vid borttagning (utanför useCallback beroendet för att undvika stale closures om vi ändrar)
    // Faktiskt, om vi alltid visar cards[0], blir logiken enklare.
    // Låt oss ändra strategin: Visa alltid cards[0]. Correct -> shift(). Incorrect -> push(shift()).

    const handleCorrectOptimized = useCallback(() => {
        setCards((prev) => {
            const newCards = prev.slice(1);
            return newCards;
        });
        setCompletedCount((prev) => prev + 1);
        setIsFlipped(false);
    }, []);

    const handleIncorrectOptimized = useCallback(() => {
        setCards((prev) => {
            const [first, ...rest] = prev;
            return [...rest, first];
        });
        setIsFlipped(false);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLoading || error || cards.length === 0) return;

            if (e.code === 'Space') {
                e.preventDefault(); // Hindra scroll
                handleFlip();
            } else if (e.code === 'ArrowRight' && isFlipped) {
                handleCorrectOptimized();
            } else if (e.code === 'ArrowLeft' && isFlipped) {
                handleIncorrectOptimized();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLoading, error, cards.length, isFlipped, handleFlip, handleCorrectOptimized, handleIncorrectOptimized]);


    const handleExit = () => {
        router.push(`/decks/${deckId}`);
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <div className="text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full">
                    <p className="text-red-400 text-lg mb-6">{error}</p>
                    <button
                        onClick={handleExit}
                        className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium border border-slate-600"
                    >
                        Tillbaka till kortleken
                    </button>
                </div>
            </main>
        );
    }

    if (cards.length === 0) {
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <div className="text-center bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full animate-fade-in">
                    <div className="text-7xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-white mb-3">Bra jobbat!</h1>
                    <p className="text-slate-400 mb-8 text-lg">
                        Du har klarat alla <span className="text-green-400 font-bold">{completedCount}</span> kort!
                    </p>
                    <button
                        onClick={handleExit}
                        className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg hover:shadow-green-900/20 font-bold text-lg"
                    >
                        Avsluta session
                    </button>
                </div>
            </main>
        );
    }

    const currentCard = cards[0]; // Alltid visa första kortet med nya strategin
    const totalCards = completedCount + cards.length;
    const progress = (completedCount / totalCards) * 100;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
            {/* Header / Nav */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-8 pt-4">
                <button
                    onClick={handleExit}
                    className="flex items-center text-slate-400 hover:text-white transition-colors group px-3 py-2 rounded-lg hover:bg-slate-900"
                >
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    Avsluta
                </button>
                <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 text-sm font-medium text-slate-300">
                    <span className="text-white">{completedCount}</span> / {totalCards}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-3xl h-1.5 bg-slate-800 rounded-full mb-12 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Card Container */}
            <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center min-h-[400px]">
                <div
                    className="w-full aspect-[3/2] relative perspective-1000 cursor-pointer group"
                    onClick={handleFlip}
                >
                    <div
                        className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front Side */}
                        <div className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center backface-hidden">
                            <span className="uppercase tracking-[0.2em] text-xs font-bold text-slate-500 mb-8">
                                Fråga
                            </span>
                            <p className="text-2xl md:text-4xl font-bold text-center leading-tight">
                                {currentCard.frontText}
                            </p>
                            <div className="absolute bottom-6 text-slate-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Klicka eller tryck MELLANSLAG för att vända
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className="absolute inset-0 bg-indigo-600 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-inner"
                        >
                            <span className="uppercase tracking-[0.2em] text-xs font-bold text-indigo-200/70 mb-8">
                                Svar
                            </span>
                            <p className="text-2xl md:text-4xl font-bold text-white text-center leading-tight">
                                {currentCard.backText}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-12 h-20 w-full flex justify-center items-center gap-6">
                    {isFlipped ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleIncorrectOptimized(); }}
                                className="flex-1 max-w-[200px] h-14 bg-slate-800 hover:bg-red-500/10 hover:border-red-500/50 border border-slate-700 hover:text-red-400 text-slate-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
                                title="Kortkommando: Vänster Pil"
                            >
                                <span className="bg-slate-700 group-hover:bg-red-500 group-hover:text-white px-2 py-0.5 rounded text-xs text-slate-400 transition-colors">←</span>
                                Behöver öva
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCorrectOptimized(); }}
                                className="flex-1 max-w-[200px] h-14 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 hover:scale-105"
                                title="Kortkommando: Höger Pil"
                            >
                                Kan det
                                <span className="bg-indigo-500/50 px-2 py-0.5 rounded text-xs text-indigo-100 transition-colors">→</span>
                            </button>
                        </>
                    ) : (
                        <div className="text-slate-500 text-sm font-medium animate-pulse">
                            Tryck <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mx-1">MELLANSLAG</span> för att vända
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </main>
    );
}