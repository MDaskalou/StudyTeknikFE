import ActiveStudySession from '@/components/study-session/ActiveStudySession';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function StudySessionPage({ params }: PageProps) {
    const { id } = await params;
    return <ActiveStudySession sessionId={id} />;
}
