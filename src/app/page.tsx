import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from './logto';
import SignIn from './signInAction'; // Behåll SignIn för oinloggade
import { signIn } from '@logto/next/server-actions';


export default async function Home() {
    const { isAuthenticated } = await getLogtoContext(logtoConfig);

    return (
        <div className="flex flex-col items-center justify-center p-24 text-center">
            {isAuthenticated ? (
                // Innehåll för när användaren ÄR inloggad
                <div>
                    <h1 className="text-5xl font-bold">Välkommen tillbaka!</h1>
                    <p className="text-lg text-slate-400 mt-4">
                        Välj Studiedagbok i menyn för att fortsätta.
                    </p>
                </div>
            ) : (
                // Innehåll för när användaren INTE är inloggad
                <div className="flex flex-col items-center gap-6 max-w-xl">
                    <h1 className="text-6xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                        Välkommen till StudyTeknik!
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Din plattform för effektiv inlärning och studieteknik.
                    </p>
                    <div className="mt-4">
                        <SignIn
                            signInAction={async () => {
                                'use server';
                                await signIn(logtoConfig);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}