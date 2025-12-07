// src/app/diary/page.tsx

// --- IMPORTERA 'cookies' FRÅN NEXT/HEADERS ---
import { cookies } from 'next/headers';
import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { logtoConfig } from '../logto';
import DiaryForm from './DiaryForm';
import DiaryDisplay from './DiaryDisplay';
import DiaryHistoric from './DiaryHistoric';

// VI ANVÄNDER INTE 'getAllEntries' FRÅN ACTIONS.TS HÄR
// import { getAllEntries } from './actions';

export const dynamic = 'force-dynamic';

interface DiaryEntry {
    id: string;
    studentId: string;
    entryDate: string;
    textsnippet: string;
}

export default async function DiaryPage() {
    const { isAuthenticated } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated) {
        redirect('/');
    }

    let allEntries: DiaryEntry[] = [];
    let fetchError: string | null = null;

    try {
        // --- UPPDATERAT ANROP ---

        // 1. Hämta användarens cookies från inkommande request
        const cookieHeader = cookies().toString();

        // 2. Anropa din interna API-rutt (/diary/api)
        // Vi använder 'fetch' här, INTE 'getAllEntries'
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/diary/api`, {
            cache: 'no-store',
            headers: {
                // 3. Skicka med cookies! Detta är nyckeln.
                'Cookie': cookieHeader
            }
        });
        // --- SLUT PÅ UPPDATERAT ANROP ---


        if (response.ok) {
            allEntries = await response.json();
        } else {
            const errorText = await response.text();
            fetchError = `Kunde inte hämta dagboksinlägg (status ${response.status})`;
            console.error("Fel från /diary/api:", errorText);

            // Kolla efter specifikt aut-fel från vår route
            if (response.status === 401) {
                fetchError = "Autentiseringsfel. Prova att logga ut och in igen.";
            }
        }
    } catch (error: unknown) {
        console.error("Fel vid anrop till /diary/api:", error);
        fetchError = "Nätverksfel vid hämtning av dagboksinlägg.";
        if (error instanceof Error && error.message.includes('Not authenticated')) {
            fetchError = "Autentiseringsfel. Prova att logga ut och in igen.";
        }
    }

    // ... Resten av din fil är densamma ...
    console.log("--- FELSÖKNING START ---");
    console.log("ALLA HÄMTADE INLÄGG:", JSON.stringify(allEntries, null, 2));

    const isToday = (someDate: Date) => {
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    }

    const todaysEntry = allEntries.find(entry => isToday(new Date(entry.entryDate)));
    const historicEntries = allEntries.filter(entry => !isToday(new Date(entry.entryDate)));

    console.log("SERVER LOG - Dagens inlägg:", todaysEntry);
    console.log("Historic entries:", historicEntries ? historicEntries.length : 0);
    console.log("--- FELSÖKNING SLUT ---");

    return (
        <main className="max-w-4xl mx-auto p-8">
            {fetchError && (
                <div role="alert" className="rounded border-s-4 border-red-500 bg-red-800 p-4 mb-8 text-white">
                    <p className="font-medium">Ett fel inträffade:</p>
                    <p>{fetchError}</p>
                </div>
            )}

            {todaysEntry ? (
                <div>
                    <h1 className="text-3xl font-bold mb-4">Bra jobbat idag!</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Du har redan skrivit ner dina tankar för dagen.
                    </p>
                    <DiaryDisplay entry={{...todaysEntry, textSnippet: todaysEntry.textsnippet || ''}} />
                </div>
            ) : (
                !fetchError && ( // Visa bara formuläret om inget fel inträffat
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Min Studiedagbok</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            Vad kommer du ihåg från det du lärde dig idag? Skriv ner det med egna ord.
                        </p>
                        <DiaryForm />
                    </div>
                )
            )}
            <div className="mt-16">
                <h2 className="text-3xl font-bold mb-6 border-b border-slate-700 pb-2">
                    Din Historik
                </h2>
                <DiaryHistoric entries={historicEntries.map(e => ({...e, textSnippet: e.textsnippet || ''}))} />
            </div>
        </main>
    );
}