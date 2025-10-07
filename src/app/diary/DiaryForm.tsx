'use client';

import { useState } from 'react';
import { saveDiaryEntry } from './actions';

export default function DiaryForm() {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus('Sparar...');

        try {
            await saveDiaryEntry(content);
            // Vi behöver inte sätta ett statusmeddelande här, eftersom sidan kommer laddas om.
        } catch (error) {
            // Om något går fel (t.ex. man försöker spara igen)
            const err = error as Error;
            setStatus(err.message);
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Skriv vad du har lärt dig idag..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6139F6] focus:border-transparent transition"
                required
            />
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    className="bg-[#6139F6] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#532ddb] transition disabled:bg-gray-400"
                    disabled={!content || status === 'Sparar...'}
                >
                    Spara inlägg
                </button>
                {status && <p className="text-red-500">{status}</p>}
            </div>
        </form>
    );
}