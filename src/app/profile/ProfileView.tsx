'use client';

import { useEffect, useState } from 'react';
import { getStudentProfileAction, getStudentGeneralInfoAction, StudentProfileDto, StudentGeneralDto } from './actions';
import CreateProfileForm from './CreateProfileForm';
import CourseManager from './CourseManager';

export default function ProfileView() {
    const [profile, setProfile] = useState<StudentProfileDto | null>(null);
    const [generalInfo, setGeneralInfo] = useState<StudentGeneralDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAllData() {
            try {
                // Fetch both profile settings and general info in parallel
                const [profileRes, generalRes] = await Promise.all([
                    getStudentProfileAction(),
                    getStudentGeneralInfoAction()
                ]);

                if (profileRes.success) {
                    setProfile(profileRes.data);
                } else if (profileRes.message === 'Not authenticated') {
                    setError('Du måste vara inloggad.');
                    return;
                } else {
                    // If it's a 404, that just means "no profile exists", so we stay in "create mode".
                    // But if it's any other error (500, 403, etc), we should probably warn the user.
                    if (profileRes.message && !profileRes.message.includes('404')) {
                        console.error('Profile fetch failed:', profileRes.message);
                        setError(`Kunde inte hämta profil: ${profileRes.message}`);
                    }
                }

                if (generalRes.success) {
                    setGeneralInfo(generalRes.data);
                }
                // General info acts as a "nice to have", so typically we don't block the UI if it fails.

            } catch (err) {
                setError('Kunde inte ladda profilen.');
            } finally {
                setLoading(false);
            }
        }

        loadAllData();
    }, []);

    const handleProfileCreated = (newProfile: StudentProfileDto) => {
        setProfile(newProfile);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. General Info Section */}
            {generalInfo && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex flex-col md:flex-row items-center md:items-start gap-4 border-l-4 border-blue-500">
                    <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {generalInfo.firstName} {generalInfo.lastName}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">{generalInfo.email}</p>
                        <div className="mt-2 inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            STUDENT
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Profile Settings Section or Create Form */}
            {!profile ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Studieinställningar</h2>
                        <p className="text-slate-600 dark:text-slate-400">Du saknar en studieprofil. Skapa en nedan för att hantera dina kurser och komma igång.</p>
                    </div>
                    <CreateProfileForm onProfileCreated={handleProfileCreated} />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">
                        Studieinställningar
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Studiehorisont</label>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                📅 {profile.planningHorizonWeeks} <span className="text-base font-normal text-slate-500">veckor</span>
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <div className="text-slate-400 text-sm italic">
                                Fler inställningar kommer snart...
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Dygnsrytm</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Vakna</label>
                                <p className="mt-1 text-xl text-slate-900 dark:text-white">☀️ {profile.wakeUpTime}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Läggdags</label>
                                <p className="mt-1 text-xl text-slate-900 dark:text-white">🌙 {profile.bedTime}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Course Manager */}
            {profile && (
                <div className="mt-8">
                    <CourseManager studentProfileId={profile.id} />
                </div>
            )}
        </div>
    );
}
