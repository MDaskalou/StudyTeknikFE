import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '@/app/logto';

const BACKEND_URL = process.env.BACKEND_URL || 'https://localhost:44317';

export async function POST(request: NextRequest) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);

        if (!token) {
            return NextResponse.json({ error: 'Inte inloggad.' }, { status: 401 });
        }

        const body = await request.json();
        const {
            courseId,
            goal,
            durationMinutes,
            energyLevel,
            difficultyLevel,
            motivationLevel,
            learningChallenges,
            studyEnvironment,
            additionalContext,
        } = body;

        const response = await fetch(`${BACKEND_URL}/api/study-sessions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId,
                sessionGoal:        goal,
                plannedMinutes:     durationMinutes,
                energyStart:        energyLevel,
                difficultyLevel:    difficultyLevel    ?? 5,
                motivationLevel:    motivationLevel    ?? 5,
                learningChallenges: learningChallenges ?? '',
                studyEnvironment:   studyEnvironment   ?? '',
                additionalContext:  additionalContext  ?? '',
                steps:              []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.description || 'Något gick fel.' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });

    } catch (error: unknown) {
        console.error('Error in POST /api/study-sessions:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ett oväntat fel uppstod';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}