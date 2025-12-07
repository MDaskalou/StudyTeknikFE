// Fil: src/app/decks/page.tsx
import { headers } from 'next/headers'; 
import { getLogtoContext } from '@logto/next/server-actions';
import CreateDeckForm from './CreateDeckForm';
import { redirect } from "next/navigation";
import DeleteDeckButton from "@/app/decks/DeleteDeckButton";
import DeckListItemActions from "@/app/decks/DeckListItemActions";
import Link from 'next/link';
import { logtoConfig } from "@/app/logto";

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

        // 2. Anropa din interna API-rutt (på /decks/api)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/decks/api`, {
            cache: 'no-store',
            headers: {
                // 3. Skicka med den korrekta headern
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
        <main className="container mx-auto p-4 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Mina Kortlekar</h1>
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Skapa ny Kortlek</h2>
                <CreateDeckForm />
            </section>

            <hr className="my-8 border-gray-700" />

            <section>
                <h2 className="text-xl font-semibold mb-4 text-white">Befintliga Kortlekar</h2>

                {fetchError && (
                    <div role="alert" className="rounded border-s-4 border-red-500 bg-red-800 p-4 mb-4">
                        <p className="block font-medium text-red-100">
                            {fetchError}
                        </p>
                    </div>
                )}

                {decks && decks.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((deck) => (
                            <li
                                key={deck.id}
                                className="flex flex-col justify-between p-4 border border-slate-700 rounded-lg shadow-md bg-slate-900"
                            >
                                <Link href={`/decks/${deck.id}`} className="block hover:bg-slate-800 p-2 -m-2 rounded-md transition-colors">
                                    <h3 className="font-semibold text-xl text-white">{deck.title}</h3>

                                    {(deck.courseName || deck.subjectName) && (
                                        <p className="text-sm text-gray-300 mt-1">
                                            {deck.courseName}{deck.courseName && deck.subjectName ? ' - ' : ''}{deck.subjectName}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        Skapad: {new Date(deck.createdAtUtc).toLocaleDateString('sv-SE', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Antal kort: <span className="font-medium">{deck.cardCount}</span>
                                    </p>
                                </Link>

                                <div className="mt-4 flex justify-end space-x-2 border-t border-slate-700 pt-4">
                                    <DeckListItemActions deck={deck} />
                                    <DeleteDeckButton deckId={deck.id} />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !fetchError && <p className="text-gray-500">Du har inte skapat några kortlekar än.</p>
                )}
            </section>
        </main>
    );
}