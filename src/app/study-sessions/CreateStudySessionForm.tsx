'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCoursesAction } from '@/app/study-sessions/actions';

interface Course {
    id: string;
    name: string;
}

export default function CreateStudySessionForm() {
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState(25);
    const [energyLevel, setEnergyLevel] = useState(5);

    // Nya fält för bättre AI-kontext
    const [difficultyLevel, setDifficultyLevel] = useState(5);
    const [motivationLevel, setMotivationLevel] = useState(5);
    const [learningChallenges, setLearningChallenges] = useState('');
    const [studyEnvironment, setStudyEnvironment] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getCoursesAction();
                if (result.error) {
                    setError(result.error);
                } else if (result.courses) {
                    setCourses(result.courses);
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
                goal,
                durationMinutes: Number(duration),
                energyLevel: Number(energyLevel),
                difficultyLevel: Number(difficultyLevel),
                motivationLevel: Number(motivationLevel),
                learningChallenges,
                studyEnvironment,
                additionalContext,
            };

            const response = await fetch('/api/study-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Något gick fel vid skapandet.');
            }

            const data = await response.json();
            router.push(`/study-sessions/${data.sessionId ?? data.id}`);
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
                <button onClick={() => router.push('/profile')} className="text-indigo-500 hover:underline">
                    Gå till Min Profil för att lägga till kurser
                </button>
            </div>
        );
    }

    const SliderField = ({
                             label, value, onChange, min = 1, max = 10,
                             lowLabel, highLabel, levels
                         }: {
        label: string; value: number; onChange: (v: number) => void;
        min?: number; max?: number; lowLabel: string; highLabel: string;
        levels: { max: number; label: string; color: string }[];
    }) => {
        const current = levels.find(l => value <= l.max) ?? levels[levels.length - 1];
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                <div className="flex items-center gap-4">
                    <span className="text-lg">{lowLabel}</span>
                    <input
                        type="range" min={min} max={max} value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-lg">{highLabel}</span>
                </div>
                <div className={`text-center text-sm font-medium mt-1 ${current.color}`}>
                    {value}/10 — {current.label}
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Kurs */}
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
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
            </div>

            {/* Mål */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vad är ditt specifika mål med dagens session?
                </label>
                <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="T.ex. Läsa kapitel 4 (15 sidor) och göra övningsuppgifterna"
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
                        type="number" min="5" max="180" value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                        required
                    />
                    <div className="flex gap-2">
                        {[25, 45, 60, 90].map((t) => (
                            <button
                                key={t} type="button" onClick={() => setDuration(t)}
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
            <SliderField
                label="Hur är din energinivå just nu? (1-10)"
                value={energyLevel} onChange={setEnergyLevel}
                lowLabel="😴" highLabel="🚀"
                levels={[
                    { max: 3, label: 'Låg — vi tar det lugnt', color: 'text-red-400' },
                    { max: 6, label: 'Medel — bra balans', color: 'text-yellow-400' },
                    { max: 8, label: 'Bra — du är redo!', color: 'text-green-400' },
                    { max: 10, label: 'Hög — full gas!', color: 'text-indigo-400' },
                ]}
            />

            {/* Svårighetsgrad */}
            <SliderField
                label="Hur svårt upplever du ämnet? (1-10)"
                value={difficultyLevel} onChange={setDifficultyLevel}
                lowLabel="😊" highLabel="🤯"
                levels={[
                    { max: 3, label: 'Enkelt', color: 'text-green-400' },
                    { max: 6, label: 'Lagom utmanande', color: 'text-yellow-400' },
                    { max: 8, label: 'Svårt', color: 'text-orange-400' },
                    { max: 10, label: 'Mycket svårt', color: 'text-red-400' },
                ]}
            />

            {/* Motivationsnivå */}
            <SliderField
                label="Hur motiverad känner du dig? (1-10)"
                value={motivationLevel} onChange={setMotivationLevel}
                lowLabel="😑" highLabel="🔥"
                levels={[
                    { max: 3, label: 'Svårt att komma igång', color: 'text-red-400' },
                    { max: 6, label: 'Det går', color: 'text-yellow-400' },
                    { max: 8, label: 'Motiverad', color: 'text-green-400' },
                    { max: 10, label: 'Supermotiverad!', color: 'text-indigo-400' },
                ]}
            />

            {/* Särskilda utmaningar */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Har du några särskilda utmaningar?
                </label>
                <select
                    value={learningChallenges}
                    onChange={(e) => setLearningChallenges(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                    <option value="">Inga särskilda utmaningar</option>
                    <option value="dyslexi">Dyslexi / Lässvårigheter</option>
                    <option value="adhd">Koncentrationssvårigheter / ADHD</option>
                    <option value="minne">Svårt att komma ihåg</option>
                    <option value="matematik">Svårt med matematik / formler</option>
                    <option value="abstrakt">Svårt med abstrakta begrepp</option>
                    <option value="stress">Prestationsångest / Stress</option>
                </select>
            </div>

            {/* Studiemiljö */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Var studerar du?
                </label>
                <select
                    value={studyEnvironment}
                    onChange={(e) => setStudyEnvironment(e.target.value)}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                    <option value="">Välj miljö...</option>
                    <option value="hemma_tyst">Hemma — tyst rum</option>
                    <option value="hemma_stört">Hemma — med störningsmoment</option>
                    <option value="bibliotek">Bibliotek / Studierum</option>
                    <option value="skola">I skolan</option>
                    <option value="cafe">Café</option>
                </select>
            </div>

            {/* Fritext för extra kontext */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Något annat AI:n bör veta? <span className="text-slate-400 font-normal">(valfritt)</span>
                </label>
                <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="T.ex. Jag har prov imorgon, jag fastnar alltid på formler, materialet är 80 sidor..."
                    rows={2}
                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 resize-none"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {submitting ? '🧠 AI skapar din personliga studieplan...' : 'Starta Session 🚀'}
            </button>
        </form>
    );
}