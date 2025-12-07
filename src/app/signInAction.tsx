'use client';

type Props = {
    signInAction: () => Promise<void>;
};

export default function SignIn({ signInAction }: Props) {
    return (
        <button
            onClick={() => signInAction()}
            className="bg-[#6139F6] text-white font-bold
                 text-2xl          /
                 py-5 px-12
                 rounded-full
                 shadow-lg
                 hover:bg-[#532ddb]
                 transition-all
                 duration-300
                 ease-in-out
                 transform
                 hover:scale-105
                 focus:outline-none  /* Tar bort den svarta standardramen */
                 focus:ring-4
                 focus:ring-offset-2 /* Ger lite avstånd mellan knapp och aura */
                 focus:ring-[#987df7]   /* En ljusare lila för auran */"
        >
            Logga in
        </button>
    );
}