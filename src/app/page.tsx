// Fil: src/app/page.tsx
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from './logto';
import SignIn from './signInAction';
import { signIn } from '@logto/next/server-actions';
import Link from 'next/link';
import { headers } from 'next/headers';

interface DeckDto {
    id: string;
    title: string;
    cardCount: number;
}

export default async function Home() {
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
                <div className="flex flex-col items-center gap-8 max-w-2xl animate-fade-in">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Study<span className="text-indigo-600 dark:text-indigo-400">Teknik</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
                            Din ultimata plattform för <span className="font-semibold text-slate-900 dark:text-white">effektiv inlärning</span> och strukturerade studier.
                        </p>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider font-semibold">Kom igång nu</p>
                        <SignIn
                            signInAction={async () => {
                                'use server';
                                await signIn(logtoConfig);
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Auth-only logic below
    let decks: DeckDto[] = [];
    let deckCount = 0;
    let totalCards = 0;

    try {
        const allHeaders = await headers();
        const cookieHeader = allHeaders.get('cookie') || '';
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/decks/api`, {
            cache: 'no-store',
            headers: { 'Cookie': cookieHeader }
        });
        if (response.ok) {
            decks = await response.json();
            deckCount = decks.length;
            totalCards = decks.reduce((acc, deck) => acc + deck.cardCount, 0);
        }
    } catch (e) {
        console.error("Failed to fetch decks for dashboard", e);
    }

    const userName = claims?.name || 'Student';

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            {/* Hero Section */}
            <header className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                    Välkommen tillbaka, {userName}! 👋
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Redo att nå dina studiemål idag? Här är din översikt.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-indigo-100 text-sm font-medium mb-1">Mina Kortlekar</div>
                    <div className="text-4xl font-bold">{deckCount}</div>
                    <div className="mt-4 text-xs bg-white/20 inline-block px-2 py-1 rounded">
                        Tillgängliga
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Totalt antal kort</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">{totalCards}</div>
                    <div className="mt-4 text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded">
                        Redo att tränas
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Studiedagbok</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">-</div>
                    <div className="mt-4 text-xs text-slate-400 font-medium inline-block px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        Inga inlägg idag
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Snabba Val</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href="/decks"
                    className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
                >
                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        📚
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hantera Kortlekar</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Skapa, redigera och organisera dina flashcards.</p>
                </Link>

                <Link
                    href={decks.length > 0 ? `/decks/${decks[0].id}` : '/decks'}
                    className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-green-500 dark:hover:border-green-400 transition-all"
                >
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        🎯
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Starta Snabbträning</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {decks.length > 0 ? `Fortsätt med "${decks[0].title}" direkt.` : 'Skapa en kortlek först för att börja träna.'}
                    </p>
                </Link>

                <Link
                    href="/diary"
                    className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                >
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        📝
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Skriv i Dagboken</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Reflektera över dagens lärande och framsteg.</p>
                </Link>
            </div>

            {/* Recent Decks (Optional, visible if decks exist) */}
            {decks.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Dina Senaste Kortlekar</h2>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {decks.slice(0, 3).map((deck, i) => (
                            <div key={deck.id} className={`p-4 flex justify-between items-center ${i !== decks.slice(0, 3).length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">
                                        {i + 1}
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{deck.title}</span>
                                </div>
                                <span className="text-sm text-slate-500">{deck.cardCount} kort</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}