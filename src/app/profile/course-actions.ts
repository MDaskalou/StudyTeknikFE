'use server';

import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '@/app/logto';
import * as courseService from '@/services/courseService';
import { CreateCourseDto, UpdateCourseDto } from '@/types/course';
import { revalidatePath } from 'next/cache';

export async function getCoursesAction(studentProfileId: string) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) throw new Error("Unauthorized");
        const courses = await courseService.getCourses(token, studentProfileId);
        return { success: true, data: courses };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function createCourseAction(studentProfileId: string, data: CreateCourseDto) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) throw new Error("Unauthorized");
        const newCourse = await courseService.createCourse(token, studentProfileId, data);
        revalidatePath('/profile');
        return { success: true, data: newCourse };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function updateCourseAction(studentProfileId: string, courseId: string, data: UpdateCourseDto) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) throw new Error("Unauthorized");
        await courseService.updateCourse(token, studentProfileId, courseId, data);
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteCourseAction(studentProfileId: string, courseId: string) {
    try {
        const token = await getAccessToken(logtoConfig, API_IDENTIFIER);
        if (!token) throw new Error("Unauthorized");
        await courseService.deleteCourse(token, studentProfileId, courseId);
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
