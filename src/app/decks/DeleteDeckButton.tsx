'use client';

import {useTransition} from "react";
import {deleteDeckAction} from "./actions";

interface DeleteDeckButtonProps {
    deckId: string;
}

export default function DeleteDeckButton({deckId} : DeleteDeckButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Är du säker på att du vill ta bort denna kortlek? Detta går inte att ångra.')) {
            startTransition(async () => {
                const result = await deleteDeckAction(deckId);
                if (!result.success) {
                    alert(`Kunde inte ta bort kortleken: ${result.message}`); // Använd message
                }
                // Vid success laddar revalidatePath i actionen om listan
            });
        }
    };

    return(
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? 'Tar bort...' : 'Ta bort Kortlek'}
        </button>
    )
}