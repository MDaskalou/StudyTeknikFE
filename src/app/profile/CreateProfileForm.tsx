'use client';

import { useState } from 'react';
import { createStudentProfileAction, StudentProfileDto } from './actions';
import { useRouter } from 'next/navigation';

type Props = {
    onProfileCreated: (profile: StudentProfileDto) => void;
};

export default function CreateProfileForm({ onProfileCreated }: Props) {
    const [planningHorizonWeeks, setPlanningHorizonWeeks] = useState(2);
    const [wakeUpTime, setWakeUpTime] = useState('07:00:00');
    const [bedTime, setBedTime] = useState('22:00:00');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await createStudentProfileAction({
                planningHorizonWeeks,
                wakeUpTime, // Input type="time" ger "HH:mm", behöver kanske sekunder
                bedTime
            });

            if (result.success && result.data) {
                onProfileCreated(result.data);
                // router.refresh(); // Inte strängt nödvändigt då vi uppdaterar parent state
            } else {
                setError(result.message || 'Kunde inte skapa profil.');
            }
        } catch (err) {
            setError('Ett oväntat fel uppstod.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper för att säkerställa HH:mm:ss format (API kanske kräver TimeSpan format)
    // HTML time input ger oftast "HH:mm". Backend C# TimeSpan parse kan ta "HH:mm:ss" eller "HH:mm".
    // Vi skickar som det är först.

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Skapa Studentprofil</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
                För att komma igång behöver vi veta lite om dina studievanor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Studiehorisont (veckor)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="52"
                        value={planningHorizonWeeks}
                        onChange={(e) => setPlanningHorizonWeeks(parseInt(e.target.value))}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <p className="text-xs text-slate-400 mt-1">Hur långt fram i tiden vill du planera?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Vakna (tid)
                        </label>
                        <input
                            type="time"
                            value={wakeUpTime.substring(0, 5)} // Klipp bort sekunder för input
                            onChange={(e) => setWakeUpTime(e.target.value + ':00')}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Läggdags (tid)
                        </label>
                        <input
                            type="time"
                            value={bedTime.substring(0, 5)}
                            onChange={(e) => setBedTime(e.target.value + ':00')}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Skapar profil...' : 'Skapa Profil'}
                </button>
            </form>
        </div>
    );
}
