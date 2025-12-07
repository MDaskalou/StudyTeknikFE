'use client';

import { useState } from 'react';
// 1. The new rewriteWithAI action is now imported
import { updateDiaryEntry, deleteDiaryEntry, rewriteWithAI } from './actions';

type Props = {
    entry: {
        id: string;
        textSnippet: string;
        entryDate: string;
    }
};

export default function DiaryDisplay({ entry }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(entry.textSnippet);
    const [isLoading, setIsLoading] = useState(false);

    // 2. New state variables for the AI feature
    const [isRewriting, setIsRewriting] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // These handlers are unchanged
    const handleUpdate = async () => {
        setIsLoading(true);
        await updateDiaryEntry(entry.id, editText);
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Är du säker på att du vill radera och börja om?')) {
            setIsLoading(true);
            await deleteDiaryEntry(entry.id);
            setIsLoading(false);
        }
    };

    // 3. New handler function for the AI button click
    const handleRewriteClick = async () => {
        setIsRewriting(true);
        setAiError(null);
        try {
            const suggestion = await rewriteWithAI(editText);
            // The AI's suggestion is placed directly into the text area
            setEditText(suggestion);
        } catch (error) {
            console.error(error);
            setAiError('Kunde inte generera text. Försök igen.');
        } finally {
            setIsRewriting(false);
        }
    };

    // The editing view is updated
    if (isEditing) {
        return (
            <div className="space-y-4">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6139F6] focus:border-transparent transition dark:bg-slate-900 dark:text-slate-200"
                />
                <div className="flex gap-4 flex-wrap items-center">
                    <button onClick={handleUpdate} disabled={isLoading || isRewriting} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                        {isLoading ? 'Sparar...' : 'Spara ändringar'}
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={isLoading || isRewriting} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition disabled:bg-gray-400">
                        Avbryt
                    </button>

                    {/* 4. The new AI button is added here */}
                    <button onClick={handleRewriteClick} disabled={isLoading || isRewriting} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M13.46 2.428a.5.5 0 0 1 .112.166l.668 1.84a.5.5 0 0 1-.166.578l-1.348.97a.5.5 0 0 1-.63-.057l-.675-.93a.5.5 0 0 1 .058-.63l1.348-.97a.5.5 0 0 1 .524-.078zM10.5 6.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm-5 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm.293 3.207a.5.5 0 0 1 .707 0L8 11.207l1.5-1.5a.5.5 0 0 1 .707.707L8.707 11.914a.5.5 0 0 1-.707 0L6.293 10.414a.5.5 0 0 1 0-.707zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z"/></svg>
                        {isRewriting ? 'Renskriver...' : 'Renskriv med AI'}
                    </button>
                </div>
                {aiError && <p className="text-red-500 mt-2">{aiError}</p>}
            </div>
        );
    }

    // This part remains unchanged
    return (
        <div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-inner border dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Ditt inlägg för idag:</h4>
                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{entry.textSnippet}</p>
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