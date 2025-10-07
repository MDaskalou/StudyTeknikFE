'use client';

type Props = {
    // Byt namn från onSignOut till signOutAction
    signOutAction: () => Promise<void>;
};

export default function SignOut({ signOutAction }: Props) {
    return (
        <button
            onClick={() => signOutAction()}
            className="ml-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 transition-colors"
        >
            Logga ut
        </button>
    );
}