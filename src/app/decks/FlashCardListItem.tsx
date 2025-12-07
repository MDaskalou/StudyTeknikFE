// Fil: src/app/decks/FlashCardListItem.tsx
'use client'; // Denna komponent hanterar 'state'

import { useState } from 'react';
// Importera den NYA, KORREKTA filen
import EditFlashcardForm from './EditFlashcardForm';

// Definiera typerna
type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};
type Props = {
    deckId: string;
    flashCard: FlashCardDto;
};

export default function FlashCardListItem({ deckId, flashCard }: Props) {
    const [isEditing, setIsEditing] = useState(false);

    if (!isEditing) {
        return (
            <li className="p-4 bg-slate-800 border border-slate-700 rounded-lg flex justify-between items-start">
                <div>
                    <p className="font-semibold text-slate-100">{flashCard.frontText}</p>
                    <p className="text-slate-300">{flashCard.backText}</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    Redigera
                </button>
            </li>
        );
    }

    // När vi klickar "Redigera", rendera formuläret och skicka
    // med den GILTIGA 'flashCard'-propen
    return (
        <li className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <EditFlashcardForm
                deckId={deckId}
                flashCard={flashCard} // 'flashCard' är GILTIG här
                onClose={() => setIsEditing(false)}
            />
        </li>
    );
}