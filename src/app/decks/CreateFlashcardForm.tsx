// Fil: src/app/decks/CreateFlashcardForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // För att uppdatera listan

export default function CreateFlashcardForm({ deckId }: { deckId: string }) {
    const router = useRouter();
    const [frontText, setFrontText] = useState('');
    const [backText, setBackText] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const response = await fetch(`/api/decks/${deckId}/flashcards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    frontText: frontText, // <-- Matchar din backend
                    backText: backText,   // <-- Matchar din backend
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Kunde inte skapa kortet.');
            }

            setStatus({ type: 'success', message: 'Kortet har lagts till!' });
            setFrontText('');
            setBackText('');

            router.refresh(); // Uppdatera kortlistan på sidan

        } catch (error) {
            setStatus({ type: 'error', message: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-slate-800 p-6 border border-slate-700">
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
                <label htmlFor="frontText" className="block text-sm font-medium text-slate-300 mb-1">
                    Framsida (Fråga)
                </label>
                <input
                    id="frontText"
                    type="text"
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    required
                    className="w-full rounded-md border-slate-600 bg-slate-900 p-3 text-white focus:ring-blue-500"
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
                    className="w-full rounded-md border-slate-600 bg-slate-900 p-3 text-white focus:ring-blue-500"
                    placeholder="T.ex. 'Stockholm'"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Sparar...' : 'Lägg till kort'}
            </button>
        </form>
    );
}