import { API_BASE_URL, getHeaders } from '@/lib/api-config';
import { CourseDto, CreateCourseDto, UpdateCourseDto } from '@/types/course';

export const getCourses = async (token: string, studentProfileId: string): Promise<CourseDto[]> => {
    const res = await fetch(`${API_BASE_URL}/api/student-profiles/${studentProfileId}/courses`, {
        method: 'GET',
        headers: getHeaders(token),
        cache: 'no-store',
    });

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText} - ${errorDetail}`);
    }

    return await res.json();
};

export const createCourse = async (token: string, studentProfileId: string, data: CreateCourseDto): Promise<CourseDto> => {
    const url = `${API_BASE_URL}/api/student-profiles/${studentProfileId}/courses`;
    console.log(`[createCourse] POST ${url}`, JSON.stringify(data, null, 2));

    const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to create course (ID: ${studentProfileId}): ${res.status} ${res.statusText} - ${errorDetail}`);
    }

    return await res.json();
};

export const updateCourse = async (token: string, studentProfileId: string, courseId: string, data: UpdateCourseDto): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/student-profiles/${studentProfileId}/courses/${courseId}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to update course: ${res.status} ${res.statusText} - ${errorDetail}`);
    }
};

export const deleteCourse = async (token: string, studentProfileId: string, courseId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/student-profiles/${studentProfileId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
    });

    if (!res.ok) {
        const errorDetail = await res.text();
        throw new Error(`Failed to delete course: ${res.status} ${res.statusText} - ${errorDetail}`);
    }
};