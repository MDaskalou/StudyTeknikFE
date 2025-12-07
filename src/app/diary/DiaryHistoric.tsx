'use client';

import { useState } from 'react';

type Entry = {
    id: string;
    textSnippet: string;
    entryDate: string;
};

// Hjälpfunktioner (oförändrade)
const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

const getMonthKey = (d: Date) => {
    return d.toISOString().slice(0, 7); // "YYYY-MM"
};

export default function DiaryHistoric({ entries }: { entries: Entry[] }) {
    // State för öppen månad
    const [openMonthKey, setOpenMonthKey] = useState<string | null>(null);
    // State för öppen vecka
    const [openWeekKey, setOpenWeekKey] = useState<string | null>(null);

    if (entries.length === 0) {
        return <p className="text-gray-500">Du har inga tidigare inlägg än.</p>;
    }

    // Datagruppering (oförändrad)
    const groupedData = entries.reduce((acc, entry) => {
        const entryDate = new Date(entry.entryDate);
        const monthKey = getMonthKey(entryDate);
        const weekKey = getWeekNumber(entryDate);

        if (!acc[monthKey]) acc[monthKey] = {};
        if (!acc[monthKey][weekKey]) acc[monthKey][weekKey] = [];

        acc[monthKey][weekKey].push(entry);
        return acc;
    }, {} as Record<string, Record<string, Entry[]>>);

    // ==========================================================
    // KORRIGERADE KLICK-HANTERARE
    // ==========================================================
    const handleMonthClick = (monthKey: string) => {
        setOpenMonthKey(prevOpenMonth => (prevOpenMonth === monthKey ? null : monthKey));
        setOpenWeekKey(null);
    };

    const handleWeekClick = (weekKey: string) => {
        setOpenWeekKey(prevOpenWeek => (prevOpenWeek === weekKey ? null : weekKey));
    };

    return (
        <div className="space-y-2">
            {Object.keys(groupedData).map(monthKey => {
                const isMonthExpanded = openMonthKey === monthKey;
                const monthDate = new Date(monthKey + '-02');

                return (
                    <div key={monthKey} className="border border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleMonthClick(monthKey)}
                            className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            <h3 className="text-xl font-semibold text-slate-200">
                                {monthDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                            </h3>
                            <span className="text-2xl text-slate-400">{isMonthExpanded ? '−' : '+'}</span>
                        </button>

                        {isMonthExpanded && (
                            <div className="p-4 pl-8 space-y-2 bg-slate-900">
                                {Object.keys(groupedData[monthKey]).map(weekKey => {
                                    const isWeekExpanded = openWeekKey === weekKey;

                                    return (
                                        <div key={weekKey} className="border border-slate-600 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => handleWeekClick(weekKey)}
                                                className="w-full flex justify-between items-center p-3 bg-slate-700/[0.5] hover:bg-slate-700 transition-colors"
                                            >
                                                <h4 className="font-semibold text-slate-300">
                                                    Vecka {weekKey.split('-W')[1]}
                                                </h4>
                                                <span className="text-xl text-slate-400">{isWeekExpanded ? '−' : '+'}</span>
                                            </button>

                                            {isWeekExpanded && (
                                                <div className="space-y-4 p-4">
                                                    {groupedData[monthKey][weekKey].map(entry => (
                                                        <div key={entry.id} className="border-l-2 border-slate-500 pl-4">
                                                            <p className="font-semibold text-slate-300">
                                                                {new Date(entry.entryDate).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric' })}
                                                            </p>
                                                            <p className="text-slate-400 whitespace-pre-wrap">{entry.textSnippet}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}