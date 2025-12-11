// Fil: src/app/pomodoro/page.tsx
'use client'; // <-- MÅSTE vara en Klientkomponent

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Definierar de olika faserna
type Phase = 'setup' | 'timing' | 'break' | 'reflection';

export default function PomodoroPage() {
    // === Fas 1: Setup ===
    const [subject, setSubject] = useState('');
    const [task, setTask] = useState('');
    const [workTime, setWorkTime] = useState(25); // Standard 25 min
    const [breakTime, setBreakTime] = useState(5);  // Standard 5 min

    // === Fas 2: Timing ===
    const [phase, setPhase] = useState<Phase>('setup');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Tid kvar i sekunder
    const [isRunning, setIsRunning] = useState(false);

    // Håller reda på intervallet
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Ljud för när tiden är ute
    const alarmSoundRef = useRef<HTMLAudioElement | null>(null);

    // === Huvud-timerlogiken ===
    useEffect(() => {
        // Skapa ljudobjektet
        if (typeof window !== 'undefined') {
            alarmSoundRef.current = new Audio('/sounds/alarm-bell.mp3');
            // TODO: Du måste lägga till en ljudfil i 'public/sounds/alarm-bell.mp3'
        }

        // Starta intervallet om timern är igång
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        // Rensa intervallet när komponenten stängs
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]); // Körs bara om 'isRunning' ändras

    // === Hantera vad som händer när tiden tar slut ===
    useEffect(() => {
        if (timeLeft <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);

            // Spela ljud
            alarmSoundRef.current?.play();

            if (phase === 'timing') {
                // Jobbet är klart -> Starta paus
                setPhase('break');
                setTimeLeft(breakTime * 60);
                setIsRunning(true); // Starta pausen automatiskt
            } else if (phase === 'break') {
                // Pausen är klar -> Gå till reflektion
                setPhase('reflection');
            }
        }
    }, [timeLeft, phase, breakTime]); // Körs när tiden ändras

    // Funktion för att formatera sekunder till MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Funktioner för att hantera de olika faserna ---

    const handleStartSession = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTimeLeft(workTime * 60);
        setIsRunning(true);
        setPhase('timing');
    };

    const handleReflectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const timeFeedback = formData.get('time-feedback');
        const breakFeedback = formData.get('break-feedback');

        // TODO: Spara denna feedback i databasen!
        // Detta är nästa steg (Del 2)
        console.log({
            subject,
            task,
            workTime,
            breakTime,
            timeFeedback,
            breakFeedback
        });

        // Återställ allt
        setPhase('setup');
        setSubject('');
        setTask('');
    };

    // === JSX-rendering ===

    // FAS 1: SETUP-FORMULÄRET
    if (phase === 'setup') {
        return (
            <main className="max-w-xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Starta en ny studiesession</h1>
                <form onSubmit={handleStartSession} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vilket ämne?</label>
                        <input
                            type="text" id="subject"
                            value={subject} onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white"
                            placeholder="T.ex. Religionkunskap"
                        />
                    </div>
                    <div>
                        <label htmlFor="task" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vad ska du plugga?</label>
                        <input
                            type="text" id="task"
                            value={task} onChange={(e) => setTask(e.target.value)}
                            className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white"
                            placeholder="T.ex. Läsa kapitel 4 eller öva på glosor"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="workTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hur lång studiesession (minuter)?</label>
                        <input
                            type="number" id="workTime"
                            value={workTime} onChange={(e) => setWorkTime(Number(e.target.value))}
                            className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white"
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="breakTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hur lång paus (minuter)?</label>
                        <input
                            type="number" id="breakTime"
                            value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))}
                            className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white"
                            min="1"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full rounded-lg bg-green-600 px-5 py-3 text-lg font-medium text-white hover:bg-green-700">
                        Starta Session
                    </button>
                </form>
            </main>
        );
    }

    // FAS 2: TIMER (BÅDE JOBB OCH PAUS)
    if (phase === 'timing' || phase === 'break') {
        const isWork = phase === 'timing';
        return (
            <main className="max-w-xl mx-auto p-8 text-center text-slate-900 dark:text-white">
                <div className={`p-12 rounded-lg ${isWork ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg' : 'bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700'}`}>
                    <p className="text-lg font-medium">{isWork ? `Fokus: ${task}` : 'Ta en paus!'}</p>
                    <h1 className="text-8xl font-bold my-4">{formatTime(timeLeft)}</h1>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-full rounded-lg px-5 py-3 text-lg font-medium ${isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isRunning ? 'Pausa' : 'Fortsätt'}
                    </button>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Är du säker på att du vill avbryta sessionen?')) {
                            setPhase('setup');
                            setIsRunning(false);
                        }
                    }}
                    className="mt-6 text-slate-500 hover:text-red-500 dark:text-slate-400"
                >
                    Avbryt session
                </button>
            </main>
        );
    }

    // FAS 3: REFLEKTION
    if (phase === 'reflection') {
        return (
            <main className="max-w-xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Sessionen är klar!</h1>
                <form onSubmit={handleReflectionSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-900 dark:text-white">Du fokuserade på: <span className="font-bold">{task}</span></p>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hur kändes studiesessionen ({workTime} min)?</label>
                        <select name="time-feedback" className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white">
                            <option value="good">Perfekt</option>
                            <option value="too_long">För lång</option>
                            <option value="too_short">För kort</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hur kändes pausen ({breakTime} min)?</label>
                        <select name="break-feedback" className="mt-1 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white">
                            <option value="good">Perfekt</option>
                            <option value="too_long">För lång</option>
                            <option value="too_short">För kort</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full rounded-lg bg-blue-600 px-5 py-3 text-lg font-medium text-white hover:bg-blue-700">
                        Spara & Starta Ny
                    </button>
                </form>
            </main>
        );
    }
}