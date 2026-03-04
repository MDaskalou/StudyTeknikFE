// Fil: src/app/decks/page.tsx
import { headers } from 'next/headers';
import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from "next/navigation";
import DeleteDeckButton from "@/app/decks/DeleteDeckButton";
import DeckListItemActions from "@/app/decks/DeckListItemActions";
import Link from 'next/link';
import { logtoConfig } from "@/app/logto";
import CreateDeckSection from './CreateDeckSection';

interface DeckDto {
    id: string;
    title: string;
    createdAtUtc: string;
    cardCount: number;
    courseName?: string;
    subjectName?: string;
}

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
    const { isAuthenticated } = await getLogtoContext(logtoConfig);
    if (!isAuthenticated) {
        redirect('/');
    }

    let decks: DeckDto[] = [];
    let fetchError: string | null = null;

    try {
        const allHeaders = await headers();
        const cookieHeader = allHeaders.get('cookie') || '';

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyteknik.netlify.app';

        const response = await fetch(`${baseUrl}/decks/api`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader
            }
        });

        if (response.ok) {
            decks = await response.json();
        } else {
            let errorText = '';
            try {
                const errorBody = await response.json();
                errorText = errorBody.error || `Kunde inte hämta kortlekar (status ${response.status})`;
            } catch (e) {
                errorText = await response.text();
                fetchError = `Kunde inte hämta kortlekar (status ${response.status}): ${errorText.substring(0, 100)}...`;
            }
            console.error("Fel från /decks/api:", fetchError || errorText);
            if (!fetchError) fetchError = errorText;
        }
    } catch (error: unknown) {
        fetchError = (error instanceof Error) ? error.message : "Nätverksfel vid hämtning av kortlekar.";
        console.error("Fel vid anrop till /decks/api:", error);
    }

    return (
        <main className="container mx-auto p-4 md:p-8 max-w-6xl">
            {/* Top Section with Title and Collapsible Create Button */}
            <CreateDeckSection />

            {/* Error Message */}
            {fetchError && (
                <div role="alert" className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {fetchError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Decks Grid */}
            <section>
                {decks && decks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decks.map((deck) => (
                            <div
                                key={deck.id}
                                className="group flex flex-col justify-between rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-200"
                            >
                                <Link href={`/decks/${deck.id}`} className="flex-1 p-5 block">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1" title={deck.title}>
                                            {deck.title}
                                        </h3>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {(deck.courseName || deck.subjectName) && (
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                <span className="truncate max-w-full">
                                                    {deck.courseName}
                                                    {deck.courseName && deck.subjectName && <span className="mx-1.5 text-slate-400">•</span>}
                                                    {deck.subjectName}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                                🎴
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {deck.cardCount}
                                                </span>
                                            </span>

                                            <span>
                                                {new Date(deck.createdAtUtc).toLocaleDateString('sv-SE', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl">
                                    <DeckListItemActions deck={deck} />
                                    <DeleteDeckButton deckId={deck.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !fetchError && (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="mx-auto h-12 w-12 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Inga kortlekar</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kom igång genom att skapa en ny kortlek ovan.</p>
                        </div>
                    )
                )}
            </section>
        </main>
    );
}