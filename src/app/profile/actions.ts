'use server';

import https from 'https';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '../logto';
import { BACKEND_API_URL } from '@/lib/constants';
import { unsafeAgent, FetchOptions } from '@/lib/fetch-options';


export type StudentProfileDto = {
    id: string;
    studentId: string;
    planningHorizonWeeks: number;
    wakeUpTime: string;
    bedTime: string;
};

export async function getStudentProfileAction() {
    const accessToken = await getAccessToken(logtoConfig, API_IDENTIFIER);

    if (!accessToken) {
        return { success: false, message: 'Not authenticated', data: null };
    }

    try {
        const options: FetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            agent: unsafeAgent
        };

        const response = await fetch(`${BACKEND_API_URL}/api/student-profiles/GetAllStudentProfiles`, options);

        if (!response.ok) {
            console.error('Failed to fetch profile:', response.status, response.statusText);
            return { success: false, message: `Error: ${response.status}`, data: null };
        }

        const data: StudentProfileDto | StudentProfileDto[] = await response.json();

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
        const options: FetchOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            agent: unsafeAgent
        };

        const response = await fetch(`${BACKEND_API_URL}/api/student-profiles/CreateStudentProfile`, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create profile:', response.status, errorText);
            return { success: false, message: `Error: ${response.status} - ${errorText}` };
        }

        const profileResult = await getStudentProfileAction();

        if (profileResult.success && profileResult.data) {
            return { success: true, data: profileResult.data };
        }

        return { success: true, data: null };
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
        const options: FetchOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            agent: unsafeAgent
        };

        const response = await fetch(`${BACKEND_API_URL}/api/students/student/general`, options);

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