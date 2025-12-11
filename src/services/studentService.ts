import { API_BASE_URL, getHeaders } from '@/lib/api-config';
import { StudentGeneralDto } from '@/types/student';
import { OperationResult } from '@/types/api';

export const getMyProfile = async (token: string): Promise<StudentGeneralDto | null> => {
    try {
        const url = `${API_BASE_URL}/students/student/general`;
        console.log('Fetching profile from:', url);
        const res = await fetch(url, {
            method: 'GET',
            headers: getHeaders(token),
        });

        if (!res.ok) {
            if (res.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch profile: ${res.statusText}`);
        }

        const result: OperationResult<StudentGeneralDto> = await res.json();

        if (!result.isSuccess) {
            throw new Error(result.errorMessage || 'Failed to retrieve profile data');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching student profile:', error);
        throw error;
    }
};
