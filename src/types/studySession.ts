export enum StudySessionStatus {
    Planned = 0,
    InProgress = 1,
    Completed = 2
}

export interface StudyStepDto {
    id: string; // Guid
    orderIndex: number;
    name: string;
    description: string;
    durationMinutes: number;
    isCompleted: boolean;
    stepType: 'Warmup' | 'DeepWork' | 'Break' | 'Review'; // Assuming these types based on request, can be adjusted
}

export interface StudySessionDto {
    id: string; // Guid
    studentProfileId: string; // Guid
    subject: string;
    goal: string;
    totalDurationMinutes: number;
    startTime?: string; // ISO Date
    endTime?: string; // ISO Date
    status: StudySessionStatus;
    energyLevelAfter?: number;
    steps: StudyStepDto[];
}
