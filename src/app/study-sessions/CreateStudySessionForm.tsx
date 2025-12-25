'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// VIKTIGT: Importera din Server Action
import { getCoursesAction } from '@/app/study-sessions/actions';

interface Course {
    id: string;
    name: string;
}

export default function CreateStudySessionForm() {
    const router = useRouter();

    // State för formuläret
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState(25);
    const [energyLevel, setEnergyLevel] = useState(5);

    // State för status
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Hämta kurser vid start med Server Action (LÖSER 401 FELET)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Anropa Server Action istället för fetch
                // Detta körs på servern där token finns tillgänglig
                const result = await getCoursesAction();

                if (result.error) {
                    // Om action returnerar fel
                    setError(result.error);
                } else if (result.courses) {
                    // Om vi lyckades hämta kurser
                    setCourses(result.courses);

                    // Välj första kursen automatiskt om den finns
                    if (result.courses.length > 0) {
                        setSelectedCourseId(result.courses[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Ett oväntat fel inträffade vid hämtning av kurser.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Hantera Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!selectedCourseId) {
            setError("Vänligen välj en kurs.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                courseId: selectedCourseId,
                goal: goal,
                durationMinutes: Number(duration),
                energyLevel: Number(energyLevel)
            };

            const response = await fetch('/api/study-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Något gick fel vid skapandet.');
            }

            const data = await response.json();

            // 3. Redirect till den aktiva sessionen
            if (data.sessionId) {
                router.push(`/study-sessions/${data.sessionId}`);
            } else {
                router.push(`/study-sessions/${data.id}`);
            }

        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-slate-500">Laddar dina kurser...</div>;
    }

    if (courses.length === 0 && !loading && !error) {
        return (
            <div className="text-center py-6">
                <p className="text-slate-400 mb-4">Du har inga kurser än.</p>
                <button
                    onClick={() => router.push('/profile')}
                    className="text-indigo-500 hover:underline"
                >
                    Gå till Min Profil för att lägga till kurser
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Välj Kurs */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vilket ämne ska du plugga?
                </label>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    required
                >
                    <option value="" disabled>Välj en kurs...</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mål */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vad är ditt specifika mål?
                </label>
                <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="T.ex. Läsa kapitel 4 eller öva på glosor"
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    required
                />
            </div>

            {/* Tid */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hur länge vill du plugga (minuter)?
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        min="5"
                        max="180"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                        required
                    />
                    {/* Snabbvalsknappar */}
                    <div className="flex gap-2">
                        {[25, 45, 60].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setDuration(t)}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${duration === t
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {t}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Energinivå */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Hur är din energinivå just nu? (1-10)
                </label>
                <div className="flex items-center gap-4">
                    <span className="text-xl">😴</span>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xl">🚀</span>
                </div>
                <div className="text-center text-sm font-medium text-indigo-400 mt-1">
                    Nivå: {energyLevel} - {energyLevel < 4 ? 'Låg' : energyLevel < 8 ? 'Medel' : 'Hög'}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {submitting ? 'Skapar plan med AI...' : 'Starta Session 🚀'}
            </button>
        </form>
    );
}