import { useState, type FormEvent } from 'react';

export type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

interface Props {
    deckId: string;
    onCardsAdded?: (cards: FlashCardDto[]) => void;
}

export default function CreateFlashcardForm({ deckId, onCardsAdded }: Props) {
    const [frontText, setFrontText] = useState('');
    const [backText, setBackText] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const response = await fetch(`/api/decks/${deckId}/flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frontText, backText }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `Serverfel: ${response.status}`);
            }

            const apiCard = await response.json();
            const newCard: FlashCardDto = {
                id: apiCard.id || apiCard.Id,
                frontText: apiCard.frontText || apiCard.FrontText || frontText,
                backText: apiCard.backText || apiCard.BackText || backText,
            };

            setFrontText('');
            setBackText('');
            setStatus({ type: 'success', message: '✓ Kortet lades till!' });
            setTimeout(() => setStatus(null), 3000);

            onCardsAdded?.([newCard]);

        } catch (error) {
            setStatus({ type: 'error', message: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-slate-800 p-6 border border-slate-700">
            {status && (
                <div
                    className={`p-3 rounded-md text-sm font-medium ${
                        status.type === 'success'
                            ? 'bg-green-900/60 text-green-200 border border-green-700'
                            : 'bg-red-900/60 text-red-200 border border-red-700'
                    }`}
                    role="alert"
                >
                    {status.message}
                </div>
            )}

            <div>
                <label htmlFor="frontText" className="block text-sm font-medium text-slate-300 mb-1">
                    Framsida (Fråga)
                </label>
                <input
                    id="frontText"
                    type="text"
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-600 bg-slate-900 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="T.ex. 'Huvudstaden i Sverige?'"
                />
            </div>

            <div>
                <label htmlFor="backText" className="block text-sm font-medium text-slate-300 mb-1">
                    Baksida (Svar)
                </label>
                <textarea
                    id="backText"
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-900 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="T.ex. 'Stockholm'"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {isLoading ? 'Sparar...' : 'Lägg till kort'}
            </button>
        </form>
    );
}