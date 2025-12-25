import ProfileView from './ProfileView';

export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Min Profil</h1>
            <ProfileView />
        </div>
    );
}
