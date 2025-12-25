'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudySessionDto, StudySessionStatus, StudyStepDto } from '@/types/studySession';
import {
    getStudySessionAction,
    startStudySessionAction,
    completeStepAction,
    endStudySessionAction
} from '@/app/study-sessions/actions';

interface Props {
    sessionId: string;
}

export default function ActiveStudySession({ sessionId }: Props) {
    const [session, setSession] = useState<StudySessionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0); // Tracks time for active step or total
    const [energyLevel, setEnergyLevel] = useState(5);
    const [isEnding, setIsEnding] = useState(false);

    // Fetch Session Data
    const fetchSession = useCallback(async () => {
        try {
            const res = await getStudySessionAction(sessionId);
            if (res.success && res.data) {
                setSession(res.data);
            } else {
                setError(res.message || 'Failed to load session');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Timer Logic: Only run if InProgress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.status === StudySessionStatus.InProgress) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session?.status]);

    // Calculate Active Step
    const currentStepIndex = session?.steps.findIndex(s => !s.isCompleted) ?? -1;
    const activeStep = currentStepIndex !== -1 ? session?.steps[currentStepIndex] : null;

    // Handlers
    const handleStart = async () => {
        if (!session) return;
        const res = await startStudySessionAction(session.id);
        if (res.success) {
            setSession({ ...session, status: StudySessionStatus.InProgress });
            setElapsedSeconds(0); // Reset timer for first step
        } else {
            alert(res.message);
        }
    };

    const handleCompleteStep = async (stepId: string) => {
        if (!session) return;

        // Optimistic update
        const updatedSteps = session.steps.map(s => s.id === stepId ? { ...s, isCompleted: true } : s);
        setSession({ ...session, steps: updatedSteps });
        setElapsedSeconds(0); // Reset timer for next step

        const res = await completeStepAction(sessionId, stepId);
        if (!res.success) {
            // Revert on failure
            setSession(session);
            alert(res.message);
        }
    };

    const handleEndSession = async () => {
        if (!session) return;
        const res = await endStudySessionAction(sessionId, energyLevel);
        if (res.success) {
            setSession({ ...session, status: StudySessionStatus.Completed });
            setIsEnding(false);
        } else {
            alert(res.message);
        }
    };

    // --- RENDER HELPERS ---

    // Format seconds to MM:SS
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getStepColor = (type: string) => {
        switch (type) {
            case 'Warmup': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
            case 'DeepWork': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700';
            case 'Break': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    // --- VIEWS ---

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Laddar session...</div>;
    if (error || !session) return <div className="p-12 text-center text-red-500">{error || 'Session not found'}</div>;

    // 1. COMPLETED VIEW
    if (session.status === StudySessionStatus.Completed) {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl text-center border border-slate-200 dark:border-slate-800">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                    Bra jobbat!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Du har slutfört din studiesession i <strong>{session.subject}</strong>.
                </p>
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg inline-block">
                    <p className="text-sm text-slate-500 uppercase tracking-wide">Din energi efteråt</p>
                    <p className="text-4xl font-bold text-indigo-500">{energyLevel}/10</p>
                </div>
            </div>
        );
    }

    // 2. PLANNED & IN-PROGRESS VIEW
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{session.subject}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Mål: {session.goal}</p>
                </div>
                {session.status === StudySessionStatus.InProgress && (
                    <button
                        onClick={() => setIsEnding(true)}
                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        Avsluta i förtid
                    </button>
                )}
            </div>

            {/* Main Focus Area (Only in Progress) */}
            {session.status === StudySessionStatus.InProgress && activeStep && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 dark:border-slate-700 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${Math.min(100, (elapsedSeconds / (activeStep.durationMinutes * 60)) * 100)}%` }}
                        />
                    </div>

                    <div className="p-12 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-6 ${getStepColor(activeStep.stepType)}`}>
                            {activeStep.stepType.toUpperCase()}
                        </span>

                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            {activeStep.name}
                        </h2>

                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            {activeStep.description}
                        </p>

                        <div className="text-8xl font-black tabular-nums text-slate-900 dark:text-indigo-400 mb-12 tracking-tight">
                            {formatTime((activeStep.durationMinutes * 60) - elapsedSeconds)}
                        </div>

                        <button
                            onClick={() => handleCompleteStep(activeStep.id)}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Markera som klar & Nästa
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline / Plan */}
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 ${session.status === StudySessionStatus.Planned ? 'opacity-100' : 'opacity-80'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Studieplan</h3>
                    <span className="text-slate-500 text-sm">{session.totalDurationMinutes} min totalt</span>
                </div>

                <div className="space-y-4">
                    {session.steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex items-center p-4 rounded-xl border transition-all ${step.isCompleted
                                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-50'
                                    : step.id === activeStep?.id && session.status === StudySessionStatus.InProgress
                                        ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-200'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold text-sm mr-4">
                                {step.isCompleted ? '✓' : index + 1}
                            </div>

                            <div className="flex-grow">
                                <h4 className={`font-semibold ${step.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    {step.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{step.description}</p>
                            </div>

                            <div className="flex-shrink-0 flex items-center gap-4">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getStepColor(step.stepType)}`}>
                                    {step.durationMinutes} min
                                </span>
                                {session.status === StudySessionStatus.Planned && (
                                    <span className="text-slate-300">⋮</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Start Button (Planned Phase) */}
                {session.status === StudySessionStatus.Planned && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                        <button
                            onClick={handleStart}
                            className="w-full md:w-auto px-12 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-500/20 transition-all hover:-translate-y-0.5"
                        >
                            Starta Session 🚀
                        </button>
                    </div>
                )}
            </div>

            {/* End Session Modal */}
            {isEnding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Avsluta Session</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Hur känner du dig energinivå-mässigt just nu?
                        </p>

                        <div className="mb-8">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Dränerad</span>
                                <span>Superladdad</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="mt-4 text-center font-bold text-3xl text-indigo-600 dark:text-indigo-400">
                                {energyLevel}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsEnding(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium rounded-xl transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleEndSession}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition-colors"
                            >
                                Spara & Avsluta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
