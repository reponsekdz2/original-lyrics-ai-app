// Fix: Create types.ts to define shared types used across the application.
export type AppView = 'create' | 'editor' | 'library' | 'profile' | 'plan' | 'settings';

export interface LyricLine {
    id: number | string;
    text: string;
    startTime: number;
    endTime: number;
}

export type AnimationStyle = 'fade-in' | 'slide-up' | 'karaoke' | 'zoom-in' | 'typewriter';

export interface LyricStyle {
    fontFamily: string;
    fontWeight: 400 | 700;
    color: string;
    textShadow: {
        color: string;
        blur: number;
        offsetY: number;
    };
    animationStyle: AnimationStyle;
    transition: 'none' | 'cross-fade';
    textStroke: {
        color: string;
        width: number;
    };
}


export interface Background {
    type: 'image' | 'video' | 'gradient' | null;
    value: File | string | null;
}

export type VideoQuality = '480p' | '720p' | '1080p';

export type Plan = 'free' | 'pro' | 'studio';

export interface User {
    name: string;
    email: string;
    avatar: string | null;
}

export interface Project {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    createdAt: Date;
    styles: LyricStyle;
}

export interface AppSettings {
    theme: 'dark' | 'light';
    defaultQuality: VideoQuality;
}