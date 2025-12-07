// Fil: src/app/decks/DeckListItemActions.tsx
'use client'; 

import Link from 'next/link';
import { useState } from 'react';
import EditDeckForm from "./EditDeckForm"; 

type DeckDto = {
    id: string;
    title: string;
    courseName?: string;
    subjectName?: string;
    cardCount: number; 
};

type Props = {
    deck: DeckDto; 
};

export default function DeckListItemActions({ deck }: Props) {

    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <EditDeckForm
                deck={deck}
                onClose={() => setIsEditing(false)} 
            />
        );
    }

    return (
        <>
            {deck.cardCount > 0 && ( // Använd deck.cardCount
                <Link
                    href={`/decks/${deck.id}/practice`} // Använd deck.id
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    🎯 Börja träna
                </Link>
            )}
            <button
                onClick={() => setIsEditing(true)} // Ändra onClick
                className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
                Redigera
            </button>
        </>
    );
}