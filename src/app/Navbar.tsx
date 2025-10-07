import Link from 'next/link';
import { getLogtoContext, signOut } from '@logto/next/server-actions';
import { logtoConfig } from './logto';
// Importera din SignOut-knapp-komponent
import SignOut from './signOutAction';

export default async function Navbar() {
    // Hämta info om användaren är inloggad eller inte
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

    return (
        <nav className="bg-slate-900 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Vänster sida: Länkar */}
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-white hover:text-slate-300 transition-colors">
                            Hem
                        </Link>

                        {/* Visa bara "Studiedagbok" om användaren är inloggad */}
                        {isAuthenticated && (
                            <Link href="/diary" className="text-white hover:text-slate-300 transition-colors">
                                Studiedagbok
                            </Link>
                        )}
                    </div>

                    {/* Höger sida: Inloggningsstatus */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-400">
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