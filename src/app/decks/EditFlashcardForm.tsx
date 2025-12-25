// Fil: src/app/decks/EditFlashcardForm.tsx
'use client';

import { useState } from 'react';
import { updateFlashCardAction } from './actions';

type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

type Props = {
    deckId: string;
    flashCard: FlashCardDto;
    onClose: () => void;
    onSuccess?: (updatedCard: FlashCardDto) => void;
};

export default function EditFlashcardForm({ deckId, flashCard, onClose, onSuccess }: Props) {
    const [frontText, setFrontText] = useState(flashCard.frontText);
    const [backText, setBackText] = useState(flashCard.backText);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateFlashCardAction(deckId, flashCard.id, frontText, backText);

            if (result.success) {
                if (onSuccess) {
                    onSuccess({
                        ...flashCard,
                        frontText,
                        backText
                    });
                } else {
                    onClose();
                }
            } else {
                setError(result.message || 'Kunde inte uppdatera kortet.');
            }
        } catch (err) {
            setError('Ett fel uppstod vid uppdatering.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Redigera kort</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1">Framsida</label>
                <textarea
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1">Baksida</label>
                <textarea
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                />
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-700"
                    disabled={isLoading}
                >
                    Avbryt
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'Sparar...' : 'Spara ändringar'}
                </button>
            </div>
        </form>
    );
}