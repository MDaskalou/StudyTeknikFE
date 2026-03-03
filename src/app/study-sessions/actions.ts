'use server';

import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '@/app/logto'; // Se till att sökvägen stämmer
import * as studySessionService from '@/services/studySessionService';
import { revalidatePath } from 'next/cache';
import { BACKEND_API_URL } from '@/lib/constants';

// Justera URL:en om din backend kör på en annan port i prod

// --- NY FUNKTION: Hämtar kurser för dropdownen ---
export async function getCoursesAction() {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);

        if (!token) {
            return { error: 'Du är inte inloggad.' };
        }

        // 1. Hämta StudentProfil för att få ID
        const profileRes = await fetch(`${BACKEND_API_URL}/api/student-profiles/GetAllStudentProfiles`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!profileRes.ok) throw new Error('Kunde inte hämta profil');
        const profiles = await profileRes.json();

        if (!profiles || profiles.length === 0) {
            return { error: 'Ingen studieprofil hittades. Gå till Min Profil och skapa en först.' };
        }

        const profileId = profiles[0].id;

        // 2. Hämta Kurser baserat på profil-ID
        const coursesRes = await fetch(`${BACKEND_API_URL}/api/student-profiles/${profileId}/courses`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!coursesRes.ok) throw new Error('Kunde inte hämta kurser');
        const courses = await coursesRes.json();

        return { courses };

    } catch (error: unknown) {
        console.error("Fetch error in getCoursesAction:", error);
        return { error: error instanceof Error ? error.message : 'Kunde inte ladda data.' };
    }
}

// --- DINA BEFINTLIGA ACTIONS (Oförändrade) ---

export async function getStudySessionAction(sessionId: string) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) return { success: false, message: 'Not authenticated' };

        const data = await studySessionService.getStudySession(token, sessionId);
        return { success: true, data };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function startStudySessionAction(sessionId: string) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) return { success: false, message: 'Not authenticated' };

        await studySessionService.startStudySession(token, sessionId);
        revalidatePath(`/study-sessions/${sessionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function completeStepAction(sessionId: string, stepId: string) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) return { success: false, message: 'Not authenticated' };

        await studySessionService.completeStep(token, sessionId, stepId);
        revalidatePath(`/study-sessions/${sessionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function endStudySessionAction(sessionId: string, energyLevel: number) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) return { success: false, message: 'Not authenticated' };

        await studySessionService.endStudySession(token, sessionId, energyLevel);
        revalidatePath(`/study-sessions/${sessionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}