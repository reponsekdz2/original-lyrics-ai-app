// Fix: Create types.ts to define shared types used across the application.
export type AppView = 'create' | 'editor' | 'library' | 'profile' | 'plan' | 'settings';

export interface LyricLine {
    id: number | string;
    text: string;
    startTime: number;
    endTime: number;
}

export interface Background {
    type: 'image' | 'video' | 'gradient' | null;
    value: File | string | null;
}

export type VideoQuality = '480p' | '720p' | '1080p';
