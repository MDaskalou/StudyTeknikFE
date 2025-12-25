// Fil: src/app/decks/FlashCardListItem.tsx
'use client';

import { useState } from 'react';
import EditFlashcardForm from './EditFlashcardForm';
import { deleteFlashCardAction } from './actions';

// Definiera typerna
type FlashCardDto = {
    id: string;
    frontText: string;
    backText: string;
};
type Props = {
    deckId: string;
    flashCard: FlashCardDto;
    onDelete?: (id: string) => void;
    onUpdate?: (card: FlashCardDto) => void;
};

export default function FlashCardListItem({ deckId, flashCard, onDelete, onUpdate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Är du säker på att du vill ta bort detta kort?')) return;

        setIsDeleting(true);
        try {
            const result = await deleteFlashCardAction(deckId, flashCard.id);
            if (result.success) {
                if (onDelete) onDelete(flashCard.id);
            } else {
                alert(result.message || 'Kunde inte ta bort kortet.');
            }
        } catch (error) {
            alert('Ett fel uppstod vid borttagning.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isEditing) {
        return (
            <li className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <EditFlashcardForm
                    deckId={deckId}
                    flashCard={flashCard}
                    onClose={() => setIsEditing(false)}
                    onSuccess={(updatedCard) => {
                        setIsEditing(false);
                        if (onUpdate) onUpdate(updatedCard);
                    }}
                />
            </li>
        );
    }

    return (
        <li className="p-4 bg-slate-800 border border-slate-700 rounded-lg flex justify-between items-start group">
            <div className="flex-1 pr-4">
                <p className="font-semibold text-slate-100 mb-2">{flashCard.frontText}</p>
                <div className="h-px bg-slate-700 w-full mb-2"></div>
                <p className="text-slate-300">{flashCard.backText}</p>
            </div>

            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                    title="Redigera"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                    title="Ta bort"
                >
                    {isDeleting ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    )}
                </button>
            </div>
        </li>
    );
}