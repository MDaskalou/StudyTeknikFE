'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importera useRouter för att synka datan

type AiCard = {
    frontText: string;
    backText: string;
};

type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

type Props = {
    deckId: string;
    onCardsAdded?: (newCards: FlashCardDto[]) => void;
};

export default function TextInputWidget({ deckId, onCardsAdded }: Props) {
    const router = useRouter(); // Initiera routern
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedCards, setSuggestedCards] = useState<AiCard[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const MAX_CHARS = 50000;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (error) setError(null);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) { setError('Du måste skriva in text.'); return; }
        if (text.length > MAX_CHARS) { setError(`Texten är för lång (max ${MAX_CHARS} tecken).`); return; }

        setIsLoading(true);
        setError(null);
        setSuggestedCards([]);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/ai/generate-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfContent: text, deckId }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Något gick fel med AI:n');
            }

            const result = await response.json();
            const cards: AiCard[] = Array.isArray(result) ? result : (result.cards ?? []);

            if (cards.length === 0) {
                setError('AI:n kunde inte hitta några kort att skapa från texten.');
            } else {
                setSuggestedCards(cards);
            }
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
            const newlyCreatedCards: FlashCardDto[] = [];

            for (const card of suggestedCards) {
                const saveResponse = await fetch(`/api/decks/${deckId}/flashcards`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ frontText: card.frontText, backText: card.backText }),
                });

                if (!saveResponse.ok) throw new Error(`Kunde inte spara kortet: "${card.frontText}"`);

                const apiCard = await saveResponse.json();
                newlyCreatedCards.push({
                    id: apiCard.id || apiCard.Id,
                    frontText: apiCard.frontText || apiCard.FrontText || card.frontText,
                    backText: apiCard.backText || apiCard.BackText || card.backText,
                });
            }

            // ✅ TRICKET: Tvinga Next.js att uppdatera sidans data från servern
            // Detta gör att du ser alla 21 kort direkt utan manuell F5.
            router.refresh();

            setSuggestedCards([]);
            setText('');
            setSuccessMessage(`✓ ${newlyCreatedCards.length} kort sparades och lades till i kortleken!`);
            setTimeout(() => setSuccessMessage(null), 5000);

            // Skicka faktiska kort till föräldrakomponenten om det behövs extra logik där
            onCardsAdded?.(newlyCreatedCards);

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

            {successMessage && (
                <div className="mb-4 p-3 rounded-md bg-green-900/60 text-green-200 border border-green-700 text-sm font-medium" role="alert">
                    {successMessage}
                </div>
            )}

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

                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Analyserar text...' : 'Skapa kort med AI'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 rounded-md bg-red-900/60 text-red-200 border border-red-700 text-sm" role="alert">
                    {error}
                </div>
            )}

            {suggestedCards.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-white">AI-genererade förslag ({suggestedCards.length} st):</h4>
                    <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                        {suggestedCards.map((card, index) => (
                            <li key={index} className="p-3 bg-slate-700 rounded">
                                <p className="font-bold text-slate-100 text-sm">{card.frontText}</p>
                                <p className="text-slate-300 text-sm mt-1">{card.backText}</p>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleSaveCards}
                        disabled={isLoading}
                        className="w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Sparar...' : `Spara ${suggestedCards.length} kort`}
                    </button>
                </div>
            )}
        </div>
    );
}