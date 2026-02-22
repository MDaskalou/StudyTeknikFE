'use client';

import { useState } from 'react';

import { deleteDiaryEntry } from './actions';
import { Trash2, Eye, X } from 'lucide-react'; // Förutsatt att du har lucide-react installerat (hade det i implementation plan checken)

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

    // State för att visa hela texten
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // ID på inlägg som raderas

    const handleDelete = async (entryId: string) => {
        if (window.confirm('Är du säker på att du vill radera detta inlägg? Det går inte att ångra.')) {
            setIsDeleting(entryId);
            try {
                await deleteDiaryEntry(entryId);
                // Notera: Komponenten kommer att reras automatiskt om server action gör revalidatePath
            } catch (error) {
                console.error("Kunde inte radera:", error);
                alert("Kunde inte radera inlägget. Försök igen.");
            } finally {
                setIsDeleting(null);
            }
        }
    };

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
                                                        <div key={entry.id} className="border-l-2 border-slate-500 pl-4 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 hover:bg-slate-800/50 rounded pr-2 transition-colors">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-slate-300">
                                                                    {new Date(entry.entryDate).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric' })}
                                                                </p>
                                                                <p className="text-slate-400 whitespace-pre-wrap line-clamp-3">
                                                                    {entry.textSnippet}
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => setSelectedEntry(entry)}
                                                                    title="Läs hela"
                                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-full transition-colors"
                                                                >
                                                                    <Eye size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(entry.id)}
                                                                    disabled={isDeleting === entry.id}
                                                                    title="Radera"
                                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
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
            {/* MODAL FÖR ATT VISA HELA TEXTEN */}
            {selectedEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedEntry(null)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {new Date(selectedEntry.entryDate).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                                {selectedEntry.textSnippet}
                            </p>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}