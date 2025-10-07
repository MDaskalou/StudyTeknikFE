'use client';

import { useState } from 'react';
import { updateDiaryEntry, deleteDiaryEntry } from './actions';

// Kom ihåg att skicka med det befintliga inlägget som en "prop"
type Props = {
    entry: {
        content: string;
        savedAt: Date;
    }
};

export default function DiaryDisplay({ entry }: Props) {
    // En state för att hålla koll på om vi är i redigeringsläge
    const [isEditing, setIsEditing] = useState(false);
    // En state för att hålla den nya texten medan vi redigerar
    const [editText, setEditText] = useState(entry.content);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        setIsLoading(true);
        await updateDiaryEntry(editText);
        setIsEditing(false); // Gå tillbaka till visningsläge
        setIsLoading(false);
    };

    const handleDelete = async () => {
        // En simpel bekräftelsedialog för att undvika misstag
        if (window.confirm('Är du säker på att du vill radera och börja om?')) {
            setIsLoading(true);
            await deleteDiaryEntry();
            // Sidan kommer att laddas om och visa formuläret igen
            setIsLoading(false);
        }
    };

    // Om vi är i redigeringsläge, visa en textarea och knappar
    if (isEditing) {
        return (
            <div className="space-y-4">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6139F6] focus:border-transparent transition"
                />
                <div className="flex gap-4">
                    <button onClick={handleUpdate} disabled={isLoading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                        {isLoading ? 'Sparar...' : 'Spara ändringar'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition">
                        Avbryt
                    </button>
                </div>
            </div>
        );
    }

    // Annars, visa det sparade inlägget och knapparna
    return (
        <div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-inner border dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Ditt inlägg för idag:</h4>
                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{entry.content}</p>
            </div>
            <div className="flex gap-4 mt-4">
                <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                    Redigera
                </button>
                <button onClick={handleDelete} disabled={isLoading} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400">
                    {isLoading ? 'Raderar...' : 'Radera (Börja om)'}
                </button>
            </div>
        </div>
    );
}