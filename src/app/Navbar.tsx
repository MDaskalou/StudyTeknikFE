import Link from 'next/link';
import { getLogtoContext, signOut } from '@logto/next/server-actions';
import { logtoConfig } from './logto';
// Importera din SignOut-knapp-komponent
import SignOut from './signOutAction';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function Navbar() {
    // Hämta info om användaren är inloggad eller inte
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Vänster sida: Länkar */}
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                            Hem
                        </Link>

                        {/* Visa bara "Studiedagbok" om användaren är inloggad */}
                        {isAuthenticated && (
                            <Link href="/diary" className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                                Studiedagbok
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link href="/decks" className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                                FlashCards
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link href="/pomodoro" className="text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                                Fokus-Timer
                            </Link>
                        )}
                    </div>

                    {/* Höger sida: Inloggningsstatus */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/profile"
                                    className="text-sm font-medium text-slate-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Min Profil
                                </Link>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Inloggad som {claims?.username || claims?.sub}
                                </span>
                                <SignOut
                                    signOutAction={async () => {
                                        'use server';
                                        await signOut(logtoConfig);
                                    }}
                                />
                            </div>
                        ) : (
                            null
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}