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

const STEP_TYPE_CONFIG: Record<number, { label: string; emoji: string; color: string; bg: string; border: string; glow: string }> = {
    0: { label: 'Fokustid',      emoji: '🎯', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   glow: 'shadow-blue-500/20' },
    1: { label: 'Kort paus',     emoji: '☕', color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  glow: 'shadow-green-500/20' },
    2: { label: 'Lång paus',     emoji: '🌿', color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   glow: 'shadow-teal-500/20' },
    3: { label: 'Förberedelse',  emoji: '📋', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  glow: 'shadow-amber-500/20' },
};

function getStepConfig(stepType: number | string) {
    const num = typeof stepType === 'string' ? parseInt(stepType) : stepType;
    return STEP_TYPE_CONFIG[num] ?? STEP_TYPE_CONFIG[0];
}

function formatTime(totalSeconds: number) {
    const m = Math.floor(Math.abs(totalSeconds) / 60);
    const s = Math.abs(totalSeconds) % 60;
    const sign = totalSeconds < 0 ? '+' : '';
    return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveStudySession({ sessionId }: Props) {
    const [session, setSession] = useState<StudySessionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [isEnding, setIsEnding] = useState(false);

    const fetchSession = useCallback(async () => {
        try {
            const res = await getStudySessionAction(sessionId);
            if (res.success && res.data) setSession(res.data);
            else setError(res.message || 'Kunde inte ladda session');
        } catch {
            setError('Ett oväntat fel uppstod');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => { fetchSession(); }, [fetchSession]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.status === StudySessionStatus.InProgress) {
            interval = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [session?.status]);

    const currentStepIndex = session?.steps.findIndex(s => !s.isCompleted) ?? -1;
    const activeStep = currentStepIndex !== -1 ? session?.steps[currentStepIndex] : null;
    const completedCount = session?.steps.filter(s => s.isCompleted).length ?? 0;
    const totalSteps = session?.steps.length ?? 0;
    const stepProgress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

    const timeRemaining = activeStep ? (activeStep.durationMinutes * 60) - elapsedSeconds : 0;
    const timerProgress = activeStep ? Math.min(100, (elapsedSeconds / (activeStep.durationMinutes * 60)) * 100) : 0;
    const isOvertime = timeRemaining < 0;

    const handleStart = async () => {
        if (!session) return;
        const res = await startStudySessionAction(session.id);
        if (res.success) {
            setSession({ ...session, status: StudySessionStatus.InProgress });
            setElapsedSeconds(0);
        } else alert(res.message);
    };

    const handleCompleteStep = async (stepId: string) => {
        if (!session) return;
        const updatedSteps = session.steps.map(s => s.id === stepId ? { ...s, isCompleted: true } : s);
        setSession({ ...session, steps: updatedSteps });
        setElapsedSeconds(0);
        const res = await completeStepAction(sessionId, stepId);
        if (!res.success) { setSession(session); alert(res.message); }
    };

    const handleEndSession = async () => {
        if (!session) return;
        const res = await endStudySessionAction(sessionId, energyLevel);
        if (res.success) {
            setSession({ ...session, status: StudySessionStatus.Completed });
            setIsEnding(false);
        } else alert(res.message);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Laddar session...</p>
            </div>
        </div>
    );

    if (error || !session) return (
        <div className="p-12 text-center text-red-400">{error || 'Session hittades inte'}</div>
    );

    // COMPLETED VIEW
    if (session.status === StudySessionStatus.Completed) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 px-6">
                <div className="text-7xl mb-6 animate-bounce">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-3">Sessionen klar!</h2>
                <p className="text-slate-400 mb-8">Du klarade alla {totalSteps} steg. Bra kämpat!</p>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 inline-block">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Energi efter sessionen</p>
                    <p className="text-5xl font-black text-indigo-400">{energyLevel}<span className="text-2xl text-slate-500">/10</span></p>
                </div>
            </div>
        );
    }

    const activeConfig = activeStep ? getStepConfig(activeStep.stepType) : null;

    return (
        <div className="max-w-3xl mx-auto space-y-5 px-4 py-6">

            {/* Top bar */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Mål</p>
                    <p className="text-slate-200 font-medium">{session.goal}</p>
                </div>
                {session.status === StudySessionStatus.InProgress && (
                    <button
                        onClick={() => setIsEnding(true)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                        Avsluta i förtid
                    </button>
                )}
            </div>

            {/* Overall progress bar */}
            {session.status === StudySessionStatus.InProgress && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Framsteg</span>
                        <span>{completedCount} / {totalSteps} steg klara</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${stepProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ACTIVE STEP CARD */}
            {session.status === StudySessionStatus.InProgress && activeStep && activeConfig && (
                <div className={`relative rounded-2xl border ${activeConfig.border} ${activeConfig.bg} overflow-hidden shadow-2xl ${activeConfig.glow}`}>
                    {/* Timer progress bar at top */}
                    <div className="h-1 bg-slate-700/50 w-full">
                        <div
                            className={`h-full transition-all duration-1000 ease-linear ${isOvertime ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                            style={{ width: `${isOvertime ? 100 : timerProgress}%` }}
                        />
                    </div>

                    <div className="p-8 text-center">
                        {/* Step type badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${activeConfig.border} ${activeConfig.bg} mb-6`}>
                            <span className="text-lg">{activeConfig.emoji}</span>
                            <span className={`text-sm font-bold uppercase tracking-widest ${activeConfig.color}`}>
                                {activeConfig.label}
                            </span>
                            <span className="text-slate-500 text-xs">· Steg {currentStepIndex + 1} av {totalSteps}</span>
                        </div>

                        {/* Description — this is the main focus */}
                        <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 max-w-xl mx-auto">
                            {activeStep.description}
                        </p>

                        {/* Big timer */}
                        <div className={`text-7xl md:text-8xl font-black tabular-nums tracking-tight mb-8 ${isOvertime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeRemaining)}
                        </div>

                        {isOvertime && (
                            <p className="text-red-400 text-sm mb-6 font-medium">
                                Du är {formatTime(Math.abs(timeRemaining))} över tid — fortsätt när du är klar!
                            </p>
                        )}

                        {/* Complete button */}
                        <button
                            onClick={() => handleCompleteStep(activeStep.id)}
                            className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Klar! Nästa steg →
                        </button>
                    </div>
                </div>
            )}

            {/* PLAN / STEP LIST */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/50">
                    <h3 className="font-bold text-white">Studieplan</h3>
                    <span className="text-slate-500 text-sm">{session.totalDurationMinutes} min totalt</span>
                </div>

                <div className="divide-y divide-slate-700/30">
                    {session.steps.map((step, index) => {
                        const config = getStepConfig(step.stepType);
                        const isActive = step.id === activeStep?.id && session.status === StudySessionStatus.InProgress;
                        const isDone = step.isCompleted;
                        const isFuture = !isDone && !isActive;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-4 px-6 py-4 transition-all ${
                                    isActive ? `${config.bg} border-l-2 ${config.border}` :
                                        isDone ? 'opacity-40' :
                                            isFuture ? 'opacity-60' : ''
                                }`}
                            >
                                {/* Step number / check */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                                    isDone ? 'bg-green-500/20 border-green-500/40 text-green-400' :
                                        isActive ? `${config.bg} ${config.border} ${config.color}` :
                                            'bg-slate-700/50 border-slate-600 text-slate-300'
                                }`}>
                                    {isDone ? '✓' : isActive ? config.emoji : index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${isDone ? 'text-slate-500' : config.color}`}>
                                            {config.label}
                                        </span>
                                        {isActive && (
                                            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                                                Aktiv
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-snug ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                                        {step.description}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div className={`flex-shrink-0 text-sm font-bold ${isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                                    {step.durationMinutes} min
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Start button */}
                {session.status === StudySessionStatus.Planned && (
                    <div className="px-6 py-5 border-t border-slate-700/50">
                        <button
                            onClick={handleStart}
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5"
                        >
                            Starta Session 🚀
                        </button>
                    </div>
                )}
            </div>

            {/* End session modal */}
            {isEnding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Avsluta session</h3>
                        <p className="text-slate-400 mb-8">Hur känner du dig just nu?</p>

                        <div className="mb-8">
                            <div className="flex justify-between text-xs text-slate-500 uppercase tracking-widest mb-3">
                                <span>😴 Dränerad</span>
                                <span>Laddad 🚀</span>
                            </div>
                            <input
                                type="range" min="1" max="10" value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="mt-4 text-center text-4xl font-black text-indigo-400">
                                {energyLevel}<span className="text-xl text-slate-500">/10</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEnding(false)}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleEndSession}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
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