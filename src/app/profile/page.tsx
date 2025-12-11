import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig, API_IDENTIFIER } from '../logto';
import { getMyProfile } from '@/services/studentService';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const { isAuthenticated, accessToken } = await getLogtoContext(logtoConfig, {
        getAccessToken: true,
        resource: API_IDENTIFIER
    });

    if (!isAuthenticated || !accessToken) {
        redirect('/');
    }

    const profile = await getMyProfile(accessToken);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Min Profil</h1>
            {profile ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Namn</label>
                        <p className="mt-1 text-lg text-slate-900 dark:text-white">{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                        <p className="mt-1 text-lg text-slate-900 dark:text-white">{profile.email}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">Kunde inte hämta profilinformation.</p>
                </div>
            )}
        </div>
    );
}
