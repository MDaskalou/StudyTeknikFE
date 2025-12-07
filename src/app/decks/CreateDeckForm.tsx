'use client'; // Denna komponent MÅSTE vara en Client Component
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createDeckAction } from './actions';

// Separat komponent för Submit-knappen för att hantera 'pending'-state
function SubmitButton() {
    const { pending } = useFormStatus(); // Känner av om formuläret håller på att skickas

    return (
        <button
            type="submit"
            disabled={pending} // Inaktivera knappen medan det skickas
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? 'Skapar...' : 'Skapa Kortlek'}
        </button>
    );
}

// Huvudkomponenten för formuläret
export default function CreateDeckForm() {
    // Definiera initialt tillstånd för useFormState
    const initialState = { success: false, message: undefined, errors: undefined };
    // Koppla samman Server Action med useFormState
    const [state, formAction] = useActionState(createDeckAction, initialState);
    const formRef = useRef<HTMLFormElement>(null); // Referens till form-elementet för att kunna nollställa

    // Effekt som körs när 'state' (resultatet från action) ändras
    useEffect(() => {
        // Om action lyckades
        if (state?.success) {
            formRef.current?.reset(); // Nollställ formulärfälten
            // Visa ett meddelande (här används en enkel alert,
            // men du kan använda ett toast-bibliotek som react-hot-toast)
            alert(state.message || 'Kortlek skapad!');
        }
        // Om action misslyckades men INTE var ett valideringsfel (generellt fel)
        else if (!state?.success && state?.message && !state.errors) {
            alert(`Fel: ${state.message}`); // Visa generellt felmeddelande
        }
    }, [state]); // Kör effekten när 'state' uppdateras

    return (
        // Koppla 'formAction' till formulärets 'action'-attribut
        <form ref={formRef} action={formAction} className="space-y-4 max-w-md w-full">
            {/* Visa generellt felmeddelande om det finns och inte är valideringsfel */}
            {!state?.success && state?.message && !state.errors && (
                <div role="alert" className="rounded border-s-4 border-red-500 bg-red-50 p-4">
                    <strong className="block font-medium text-red-800"> Fel </strong>
                    <p className="mt-2 text-sm text-red-700">{state.message}</p>
                </div>
            )}

            {/* Titel-fält */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Titel <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title" // Namnet MÅSTE matcha vad din action förväntar sig
                    required
                    aria-describedby="title-error" // För skärmläsare
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent text-white shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50 sm:text-sm placeholder-gray-500" />
                {/* Visa fältspecifikt fel (om backend skickar det i 'errors') */}
                {state?.errors?.title && (
                    <p id="title-error" className="mt-2 text-sm text-red-600" role="alert">
                        {state.errors.title.join(', ')}
                    </p>
                )}
            </div>

            {/* Kursnamn-fält */}
            <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-300">
                    Kursnamn (valfritt)
                </label>
                <input
                    type="text"
                    id="courseName"
                    name="courseName" // Namnet MÅSTE matcha
                    aria-describedby="courseName-error"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent text-white shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50 sm:text-sm placeholder-gray-500"    />
                    {state?.errors?.courseName && (
                    <p id="courseName-error" className="mt-2 text-sm text-red-600" role="alert">
                        {state.errors.courseName.join(', ')}
                    </p>
                )}
            </div>

            {/* Ämnesnamn-fält */}
            <div>
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700">
                    Ämnesnamn (valfritt)
                </label>
                <input
                    type="text"
                    id="subjectName"
                    name="subjectName" // Namnet MÅSTE matcha
                    aria-describedby="subjectName-error"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent text-white shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50 sm:text-sm placeholder-gray-500"
                />
                {state?.errors?.subjectName && (
                    <p id="subjectName-error" className="mt-2 text-sm text-red-600" role="alert">
                        {state.errors.subjectName.join(', ')}
                    </p>
                )}
            </div>

            {/* Submit-knapp */}
            <SubmitButton />
        </form>
    );
}