'use client';

import { useState } from 'react';
import { saveDiaryEntry, rewriteWithAI } from './actions';

export default function DiaryForm() {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatus('Sparar...');

        try {
            await saveDiaryEntry(content);
        } catch (error) {
            const err = error as Error;
            setStatus(err.message);
            console.error(error);
        }
    };

    const handleRewriteClick = async () => {
        setIsAiLoading(true);
        setStatus('');
        try{
            const rewrittenText = await rewriteWithAI(content);
            setContent(rewrittenText);
        } catch(error)
        {
            const err = error as Error;
            setStatus(`AI-fel: ${err.message}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Skriv vad du har lärt dig idag..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6139F6] focus:border-transparent transition"
                required
            />
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="bg-[#6139F6] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#532ddb] transition disabled:bg-gray-400"
                        disabled={!content || status === 'Sparar...'}
                    >
                        Spara inlägg
                    </button>
                    {status && <p className="text-red-500">{status}</p>}

                    {content.length > 0 && (
                        <button
                            type="button"
                            onClick={handleRewriteClick}
                            disabled={isAiLoading}
                            className="bg-sky-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-600 transition disabled:bg-gray-400"
                            >
                            {isAiLoading ? 'Tänker...' : 'Renskriv med AI ✨'}
                        </button>
                    )}
                </div>
                {status && <p className="text-red-500">{status}</p>}
            </div>
        </form>
    );
}