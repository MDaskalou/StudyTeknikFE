'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Typen för de föreslagna korten
type AiCard = {
    frontText: string;
    backText: string;
};

type Props = {
    deckId: string;
    onCardsAdded?: (newCards: any[]) => void;
};

export default function TextInputWidget({ deckId, onCardsAdded }: Props) {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedCards, setSuggestedCards] = useState<AiCard[]>([]);

    const router = useRouter();
    const MAX_CHARS = 50000;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (error) setError(null);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Du måste skriva in text.');
            return;
        }
        if (text.length > MAX_CHARS) {
            setError(`Texten är för lång (max ${MAX_CHARS} tecken).`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestedCards([]);

        try {
            const response = await fetch('/api/ai/generate-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdfContent: text, // Backend förväntar sig 'pdfContent' även för text...
                    deckId: deckId
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Något gick fel med AI:n');
            }

            const cards: AiCard[] = await response.json();
            if (cards.length === 0) {
                setError("AI:n kunde inte hitta några kort att skapa från texten.");
            }
            setSuggestedCards(cards);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCards = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Här skulle vi egentligen vilja skicka ALLA kort i en batch till backend
            // Men om din backend bara stöder ett och ett:
            for (const card of suggestedCards) {
                const saveResponse = await fetch(`/api/decks/${deckId}/flashcards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        frontText: card.frontText,
                        backText: card.backText
                    }),
                });

                if (!saveResponse.ok) {
                    throw new Error(`Kunde inte spara kortet: "${card.frontText}"`);
                }
            }

            setSuggestedCards([]);
            setText('');

            if (onCardsAdded) {
                onCardsAdded([]); // Trigga uppdatering i föräldern, men vi har inte IDn så refresh är safe
                router.refresh();
            } else {
                router.refresh();
            }

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">Skapa kort från text</h3>
            <p className="text-sm text-slate-400 mb-4">Klistra in dina anteckningar eller text så skapar AI:n flashcards.</p>

            <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Klistra in text här..."
                        rows={6}
                        className="w-full p-4 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        disabled={isLoading}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                        {text.length} / {MAX_CHARS}
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !text.trim()} className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? 'Analyserar text...' : 'Skapa kort med AI'}
                </button>
            </form>

            {error && <p className="text-red-400 mt-4">{error}</p>}

            {suggestedCards.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-white">AI-genererade förslag ({suggestedCards.length} st):</h4>
                    <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                        {suggestedCards.map((card, index) => (
                            <li key={index} className="p-3 bg-slate-700 rounded">
                                <p className="font-bold text-slate-100">{card.frontText}</p>
                                <p className="text-slate-300">{card.backText}</p>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSaveCards} disabled={isLoading} className="w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                        {isLoading ? 'Sparar...' : `Spara ${suggestedCards.length} kort`}
                    </button>
                </div>
            )}
        </div>
    );
}
