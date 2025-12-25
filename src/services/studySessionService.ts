import { API_BASE_URL, getHeaders } from '@/lib/api-config';
import { StudySessionDto } from '@/types/studySession';

export const getStudySession = async (token: string, sessionId: string): Promise<StudySessionDto> => {
    const res = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}`, {
        method: 'GET',
        headers: getHeaders(token),
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch session: ${res.statusText}`);
    }

    return await res.json();
};

export const startStudySession = async (token: string, sessionId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}/start`, {
        method: 'PATCH',
        headers: getHeaders(token),
    });

    if (!res.ok) {
        throw new Error(`Failed to start session: ${res.statusText}`);
    }
};

export const completeStep = async (token: string, sessionId: string, stepId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}/steps/${stepId}/complete`, {
        method: 'PATCH',
        headers: getHeaders(token),
    });

    if (!res.ok) {
        throw new Error(`Failed to complete step: ${res.statusText}`);
    }
};

export const endStudySession = async (token: string, sessionId: string, energyLevel: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/study-sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({ energyLevel }),
    });

    if (!res.ok) {
        throw new Error(`Failed to end session: ${res.statusText}`);
    }
};
