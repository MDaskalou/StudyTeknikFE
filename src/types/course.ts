export enum CourseDifficulty {
    Easy = 0,
    Medium = 1,
    Hard = 2
}

export interface CourseDto {
    id: string;
    name: string;
    description: string;
    difficulty: CourseDifficulty;
    studentProfileId: string;
}

export interface CreateCourseDto {
    name: string;
    description: string;
    difficulty: CourseDifficulty;
}

export interface UpdateCourseDto {
    name: string;
    description: string;
    difficulty: CourseDifficulty;
}
