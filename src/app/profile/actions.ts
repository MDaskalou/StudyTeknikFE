'use server';

import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '../logto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44317';

export type StudentProfileDto = {
    id: string;
    studentId: string;
    planningHorizonWeeks: number;
    wakeUpTime: string;
    bedTime: string;
};

export async function getStudentProfileAction() {
    // This runs in a Server Action (POST request), so it CAN modify cookies (e.g. refresh token)
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);

    if (!accessToken) {
        return { success: false, message: 'Not authenticated', data: null };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/student-profiles/GetAllStudentProfiles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            agent: (global as any).unsafeAgent
        } as RequestInit & { agent?: any });

        if (!response.ok) {
            console.error('Failed to fetch profile:', response.status, response.statusText);
            return { success: false, message: `Error: ${response.status}`, data: null };
        }

        const data = await response.json();

        // Handle array or single object
        let profile: StudentProfileDto | null = null;
        if (Array.isArray(data)) {
            profile = data.length > 0 ? data[0] : null;
        } else {
            profile = data;
        }

        return { success: true, data: profile };
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return { success: false, message: 'Network error', data: null };
    }
}

export async function createStudentProfileAction(data: { planningHorizonWeeks: number; wakeUpTime: string; bedTime: string }) {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);

    if (!accessToken) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/student-profiles/CreateStudentProfile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            agent: (global as any).unsafeAgent
        } as RequestInit & { agent?: any });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create profile:', response.status, errorText);
            return { success: false, message: `Error: ${response.status} - ${errorText}` };
        }

        // The backend might return just the ID or the DTO. 
        // To be safe and ensure we have the full object for the UI, we fetch the profile again.
        const profileResult = await getStudentProfileAction();

        if (profileResult.success && profileResult.data) {
            return { success: true, data: profileResult.data };
        }

        // Fallback if fetch fails (shouldn't happen if create succeeded)
        return { success: true, data: null as any };
    } catch (error) {
        console.error('Error creating student profile:', error);
        return { success: false, message: 'Network error' };
    }
}

// --- GENERAL PROFILE INFO ---
export type StudentGeneralDto = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
};

export async function getStudentGeneralInfoAction() {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);

    if (!accessToken) {
        return { success: false, message: 'Not authenticated', data: null };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/students/student/general`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            agent: (global as any).unsafeAgent
        } as RequestInit & { agent?: any });

        if (!response.ok) {
            console.error('Failed to fetch general info:', response.status, response.statusText);
            return { success: false, message: `Error: ${response.status}`, data: null };
        }

        const data: StudentGeneralDto = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching general info:', error);
        return { success: false, message: 'Network error', data: null };
    }
}
