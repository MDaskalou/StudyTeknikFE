// Fil: src/app/decks/UploadForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Typen för de föreslagna korten (oförändrad)
type AiCard = {
    frontText: string;
    backText: string;
};

// Props (oförändrad)
type Props = {
    deckId: string;
    onCardsAdded?: (newCards: any[]) => void;
};

export default function UploadForm({ deckId, onCardsAdded }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedCards, setSuggestedCards] = useState<AiCard[]>([]);

    const [isDragging, setIsDragging] = useState(false);

    const router = useRouter();

    // Funktion för att hantera den valda filen (oavsett om den klickas eller släpps)
    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
            setSuggestedCards([]);
        } else {
            setError("Endast .pdf-filer stöds för närvarande.");
            setFile(null);
        }
    };

    // Hanterar när en fil väljs via "Välj fil"-knappen
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Hanterare för dra-och-släpp
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setError('Du måste välja en fil.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestedCards([]);

        const formData = new FormData();
        // Force cast to Blob/any to avoid TS error if types are strict about File | null
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

            const cards: AiCard[] = await response.json();
            if (cards.length === 0) {
                setError("AI:n kunde inte hitta några kort att skapa från den filen.");
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
            const newlyCreatedCards: any[] = [];

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

                const apiCard = await saveResponse.json();
                console.log('[UploadForm] Raw API Card:', apiCard); // DEBUG

                const normalizedCard = {
                    id: apiCard.id || apiCard.Id,
                    frontText: apiCard.frontText || apiCard.FrontText || card.frontText,
                    backText: apiCard.backText || apiCard.BackText || card.backText,
                };
                console.log('[UploadForm] Normalized Card:', normalizedCard); // DEBUG

                newlyCreatedCards.push(normalizedCard);
            }

            setSuggestedCards([]);

            if (onCardsAdded && newlyCreatedCards.length > 0) {
                onCardsAdded(newlyCreatedCards);
            }

            router.refresh();

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

            <form onSubmit={handleGenerate} className="space-y-4">

                <div
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg 
                                ${isDragging ? 'border-blue-500 bg-slate-700' : 'border-slate-600'}
                                transition-colors`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {file ? (
                        <p className="text-green-400 font-medium">Fil vald: {file.name}</p>
                    ) : (
                        <div className="text-center text-slate-400">
                            <p className="font-semibold">Dra och släpp din PDF här</p>
                            <p className="text-sm mt-1">eller</p>
                            <label
                                htmlFor="file-upload"
                                className="mt-2 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Välj fil
                            </label>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isLoading || !file} className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? 'Analyserar fil...' : 'Skapa kort med AI'}
                </button>
            </form>

            {error && <p className="text-red-400 mt-4">{error}</p>}

            {suggestedCards.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-white">AI-genererade förslag:</h4>
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