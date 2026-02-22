'use client';

import { useState, useEffect, useCallback } from 'react';
import { CourseDto, CourseDifficulty, CreateCourseDto, UpdateCourseDto } from '@/types/course';
import { getCoursesAction, createCourseAction, updateCourseAction, deleteCourseAction } from './course-actions';

interface Props {
    studentProfileId: string;
}

export default function CourseManager({ studentProfileId }: Props) {
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getCoursesAction(studentProfileId);
            if (res.success && res.data) {
                setCourses(res.data);
            } else {
                setError(res.message || 'Failed to load courses');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [studentProfileId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleCreate = async (data: CreateCourseDto) => {
        const res = await createCourseAction(studentProfileId, data);
        if (res.success && res.data) {
            setCourses([...courses, res.data]);
            setIsModalOpen(false);
        } else {
            throw new Error(res.message || 'Failed to create course');
        }
    };

    const handleUpdate = async (courseId: string, data: UpdateCourseDto) => {
        const res = await updateCourseAction(studentProfileId, courseId, data);
        if (res.success) {
            setCourses(courses.map(c => c.id === courseId ? { ...c, ...data } : c));
            setIsModalOpen(false);
            setEditingCourse(null);
        } else {
            throw new Error(res.message || 'Failed to update course');
        }
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        // Optimistic update
        const originalCourses = [...courses];
        setCourses(courses.filter(c => c.id !== courseId));

        const res = await deleteCourseAction(studentProfileId, courseId);
        if (!res.success) {
            setCourses(originalCourses); // Revert
            alert(res.message || 'Failed to delete course');
        }
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const openEditModal = (course: CourseDto) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kurser</h2>
                    <p className="text-slate-500 dark:text-slate-400">Hantera dina kurser och svårighetsgrader</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    + Lägg till Kurs
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-4 rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Laddar kurser...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">Inga kurser tillagda än.</p>
                    <button onClick={openCreateModal} className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium">
                        Lägg till din första kurs
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={course.name}>
                                        {course.name}
                                    </h3>
                                    <CourseDifficultyBadge difficulty={course.difficulty} />
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3">
                                    {course.description || <span className="italic text-slate-400">Ingen beskrivning</span>}
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => openEditModal(course)}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                                >
                                    Redigera
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
                                >
                                    Ta bort
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CourseFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={editingCourse ? (data) => handleUpdate(editingCourse.id, data) : handleCreate}
                    initialData={editingCourse || undefined}
                />
            )}
        </div>
    );
}

function CourseDifficultyBadge({ difficulty }: { difficulty: CourseDifficulty }) {
    const config = {
        [CourseDifficulty.Easy]: { label: 'Lätt', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        [CourseDifficulty.Medium]: { label: 'Medel', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
        [CourseDifficulty.Hard]: { label: 'Svår', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    };
    const { label, color } = config[difficulty];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCourseDto) => Promise<void>;
    initialData?: CourseDto;
}

function CourseFormModal({ isOpen, onClose, onSubmit, initialData }: ModalProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [difficulty, setDifficulty] = useState<CourseDifficulty>(initialData?.difficulty ?? CourseDifficulty.Easy);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Explicitly cast to number to satisfy backend validation
            await onSubmit({ name, description, difficulty: Number(difficulty) });
        } catch (err) {
            setError((err as Error).message);
            setIsSubmitting(false); // Only stop submitting on error
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Redigera Kurs' : 'Skapa Ny Kurs'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Kursnamn
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="t.ex. Matematik 1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Beskrivning
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Kort beskrivning av kursen..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Svårighetsgrad
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: CourseDifficulty.Easy, label: 'Lätt' },
                                { val: CourseDifficulty.Medium, label: 'Medel' },
                                { val: CourseDifficulty.Hard, label: 'Svår' },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setDifficulty(opt.val)}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${difficulty === opt.val
                                        ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-900'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                            {initialData ? 'Spara ändringar' : 'Skapa Kurs'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
