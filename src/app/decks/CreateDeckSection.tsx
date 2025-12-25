'use client';

import { useState } from 'react';
import CreateDeckForm from './CreateDeckForm';

export default function CreateDeckSection() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mina Kortlekar</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    {isOpen ? 'Avbryt' : 'Skapa ny Kortlek'}
                </button>
            </div>

            {/* Collapsible Area */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Skapa en ny kortlek</h2>
                    <CreateDeckForm />
                </div>
            </div>
        </div>
    );
}
