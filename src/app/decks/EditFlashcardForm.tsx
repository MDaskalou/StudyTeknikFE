// Fil: src/app/decks/EditFlashcardForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Definiera datan vi tar emot
type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};

// Komponentens "props"
type Props = {
    deckId: string;
    flashCard: FlashCardDto;
    onClose: () => void; // En funktion för att stänga redigeringsläget
};

export default function EditFlashcardForm({ deckId, flashCard, onClose }: Props) {
    const router = useRouter();

    // HÄR SKEDDE KRASCHEN (för att 'flashCard' var undefined)
    const [frontText, setFrontText] = useState(flashCard.frontText);
    const [backText, setBackText] = useState(flashCard.backText);

    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const apiUrl = `/api/decks/${deckId}/flashcards/${flashCard.id}`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    frontText: frontText,
                    backText: backText,
                }),
            });

            if (response.status !== 204) { // Lyckad PUT returnerar 204
                const errorData = await response.json();
                throw new Error(errorData.error || 'Kunde inte uppdatera kortet.');
            }

            setStatus({ type: 'success', message: 'Kortet har uppdaterats!' });
            router.refresh();

            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            setStatus({ type: 'error', message: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-slate-700 p-4 mt-4">
            {/* Meddelande-ruta */}
            {status && (
                <div
                    className={`p-3 rounded-md text-sm font-medium ${
                        status.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
                    }`}
                >
                    {status.message}
                </div>
            )}

            <div>
                <label htmlFor={`edit-front-${flashCard.id}`} className="block text-sm font-medium text-slate-300 mb-1">
                    Framsida (Fråga)
                </label>
                <input
                    id={`edit-front-${flashCard.id}`}
                    type="text"
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    required
                    className="w-full rounded-md border-slate-500 bg-slate-800 p-3 text-white focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor={`edit-back-${flashCard.id}`} className="block text-sm font-medium text-slate-300 mb-1">
                    Baksida (Svar)
                </label>
                <textarea
                    id={`edit-back-${flashCard.id}`}
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-md border-slate-500 bg-slate-800 p-3 text-white focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-gray-600 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    Avbryt
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Sparar...' : 'Spara ändringar'}
                </button>
            </div>
        </form>
    );
}