'use client'

import {useState} from "react";
import {updateDeckAction} from "@/app/decks/actions";

type Props = {
    deck:{
        id: string;
        title: string;
        courseName?: string;
        subjectName?: string;
    };
    onClose: () => void;
};

export default function EditDeckForm({deck, onClose}: Props) {
    const [title, setTitle] = useState(deck.title);
    const [courseName, setCourseName] = useState(deck.courseName || '');
    const [subjectName, setSubjectName] = useState(deck.subjectName || '');

    const [status, setStatus] = useState<{ type: 'error', message: string } | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setStatus(null);
        
        const result = await updateDeckAction(deck.id,{
            title,
            courseName: courseName || '',
            subjectName: subjectName || ''
        })
        
        if(!result.success) {
            setStatus({type: 'error', message: result.message || 'Ett fel uppstod vid uppdatering av kortlek.'});
        } else {
            onClose();
        }
        setIsPending(false);

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-b-lg">
            {status && (
                <div className="text-red-400 text-sm">{status.message}</div>
            )}

            <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-slate-300">
                    Titel *
                </label>
                <input
                    id="edit-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border-slate-500 bg-slate-800 p-2 text-white"
                />
            </div>

            <div>
                <label htmlFor="edit-course" className="block text-sm font-medium text-slate-300">
                    Kursnamn (valfritt)
                </label>
                <input
                    id="edit-course"
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="mt-1 w-full rounded-md border-slate-500 bg-slate-800 p-2 text-white"
                />
            </div>

            <div>
                <label htmlFor="edit-subject" className="block text-sm font-medium text-slate-300">
                    Ämnesnamn (valfritt)
                </label>
                <input
                    id="edit-subject"
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="mt-1 w-full rounded-md border-slate-500 bg-slate-800 p-2 text-white"
                />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                    Avbryt
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Sparar...' : 'Spara'}
                </button>
            </div>
        </form>
    );
}