'use client';

import { useState } from 'react';

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

export default function UploadForm({ deckId, onCardsAdded }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedCards, setSuggestedCards] = useState<AiCard[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
            setSuggestedCards([]);
            setSuccessMessage(null);
        } else {
            setError('Endast .pdf-filer stöds för närvarande.');
            setFile(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) { setError('Du måste välja en fil.'); return; }

        setIsLoading(true);
        setError(null);
        setSuggestedCards([]);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('file', file as Blob);
        formData.append('deckId', deckId);

        try {
            const response = await fetch('/api/ai/generate-cards-from-file', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Något gick fel med AI:n');
            }

            const result = await response.json();
            const cards: AiCard[] = Array.isArray(result) ? result : (result.cards ?? []);

            if (cards.length === 0) {
                setError('AI:n kunde inte hitta några kort att skapa från den filen.');
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
                    body: JSON.stringify({
                        frontText: card.frontText.length > 50
                            ? card.frontText.substring(0, 47) + '...'
                            : card.frontText,
                        backText: card.backText,
                    }),  // ✅ Avslutande parentes som saknades
                });

                if (!saveResponse.ok) throw new Error(`Kunde inte spara kortet: "${card.frontText}"`);

                const apiCard = await saveResponse.json();
                newlyCreatedCards.push({
                    id: apiCard.id || apiCard.Id,
                    frontText: apiCard.frontText || apiCard.FrontText || card.frontText,
                    backText: apiCard.backText || apiCard.BackText || card.backText,
                });
            }

            setSuggestedCards([]);
            setFile(null);
            setSuccessMessage(`✓ ${newlyCreatedCards.length} kort sparades och lades till i kortleken!`);
            setTimeout(() => setSuccessMessage(null), 5000);

            onCardsAdded?.(newlyCreatedCards);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">Skapa kort från fil</h3>
            <p className="text-sm text-slate-400 mb-4">Ladda upp en PDF. AI:n kommer att läsa filen och föreslå nya flashcards.</p>

            {successMessage && (
                <div className="mb-4 p-3 rounded-md bg-green-900/60 text-green-200 border border-green-700 text-sm font-medium" role="alert">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
                <div
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
                        isDragging ? 'border-blue-500 bg-slate-700' : 'border-slate-600'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input type="file" id="file-upload" accept=".pdf" onChange={handleFileChange} className="hidden" />

                    {file ? (
                        <div className="text-center">
                            <p className="text-green-400 font-medium">Fil vald: {file.name}</p>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="mt-2 text-xs text-slate-400 hover:text-slate-200 underline"
                            >
                                Byt fil
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">
                            <p className="font-semibold">Dra och släpp din PDF här</p>
                            <p className="text-sm mt-1">eller</p>
                            <label htmlFor="file-upload" className="mt-2 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                                Välj fil
                            </label>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !file}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isLoading && suggestedCards.length === 0 ? 'Analyserar fil...' : 'Skapa kort med AI'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 rounded-md bg-red-900/60 text-red-200 border border-red-700 text-sm" role="alert">
                    {error}
                </div>
            )}

            {suggestedCards.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-white">
                        AI-genererade förslag ({suggestedCards.length} kort):
                    </h4>
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