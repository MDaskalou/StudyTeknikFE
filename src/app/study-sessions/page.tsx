import React from 'react';
// Importera formuläret vi precis skapade
import CreateStudySessionForm from '@/app/study-sessions/CreateStudySessionForm';

export default function StudySessionsIndexPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Studie-sessioner 🧠
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Låt AI:n strukturera ditt pluggande för maximalt fokus.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                    Starta ny session
                </h2>

                {/* Här laddar vi in formuläret */}
                <CreateStudySessionForm />

            </div>
        </div>
    );
}