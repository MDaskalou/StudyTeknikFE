import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { logtoConfig } from '../logto';
import DiaryForm from './DiaryForm';
import { getTodaysEntry } from './actions';
import DiaryDisplay from './DiaryDisplay'; // Importera den nya komponenten

export default async function DiaryPage() {
    const { isAuthenticated } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated) {
        redirect('/');
    }

    const todaysEntry = await getTodaysEntry();

    return (
        <main className="max-w-4xl mx-auto p-8">
            {todaysEntry ? (
                // Om ett inlägg finns, visa vår nya display-komponent
                <div>
                    <h1 className="text-3xl font-bold mb-4">Bra jobbat idag!</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Du har redan skrivit ner dina tankar för dagen.
                    </p>
                    <DiaryDisplay entry={todaysEntry} />
                </div>
            ) : (
                // Annars, visa formuläret
                <div>
                    <h1 className="text-4xl font-bold mb-2">Min Studiedagbok</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Vad kommer du ihåg från det du lärde dig idag? Skriv ner det med egna ord.
                    </p>
                    <DiaryForm />
                </div>
            )}
        </main>
    );
}