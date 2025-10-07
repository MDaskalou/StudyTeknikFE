'use server';

import { revalidatePath } from 'next/cache';

let fakeTodaysEntry: { content: string; savedAt: Date } | null = null;

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
}

export async function getTodaysEntry() {
    console.log('Hämtar dagens inlägg...');
    if (fakeTodaysEntry && isToday(fakeTodaysEntry.savedAt)) {
        return fakeTodaysEntry;
    }
    return null;
}

export async function saveDiaryEntry(content: string) {
    console.log('Sparar nytt inlägg...');
    if (fakeTodaysEntry && isToday(fakeTodaysEntry.savedAt)) {
        throw new Error('Du har redan skickat in ett inlägg för idag.');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    fakeTodaysEntry = { content: content, savedAt: new Date() };
    revalidatePath('/diary');
    return { success: true };
}

// NY FUNKTION: Uppdaterar ett befintligt inlägg
export async function updateDiaryEntry(newContent: string) {
    console.log('Uppdaterar inlägg...');
    if (fakeTodaysEntry && isToday(fakeTodaysEntry.savedAt)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        fakeTodaysEntry.content = newContent;
        revalidatePath('/diary');
        return { success: true };
    }
    throw new Error('Inget inlägg hittades att uppdatera.');
}

// NY FUNKTION: Raderar dagens inlägg
export async function deleteDiaryEntry() {
    console.log('Raderar inlägg...');
    if (fakeTodaysEntry && isToday(fakeTodaysEntry.savedAt)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        fakeTodaysEntry = null;
        revalidatePath('/diary');
        return { success: true };
    }
    throw new Error('Inget inlägg hittades att radera.');
}