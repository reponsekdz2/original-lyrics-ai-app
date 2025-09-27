// Fix: Create constants.tsx to provide gradient options.
import React from 'react';
import { Plan, VideoQuality, AnimationStyle, LyricStyle } from './types';


export const GRADIENTS = [
    { name: 'Default', value: 'bg-gray-800' },
    { name: 'Sunrise', value: 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500' },
    { name: 'Ocean', value: 'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600' },
    { name: 'Twilight', value: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
    { name: 'Mint', value: 'bg-gradient-to-r from-green-200 via-green-400 to-green-500' },
    { name: 'Cherry', value: 'bg-gradient-to-r from-red-500 to-red-800' },
    { name: 'Modern Indigo', value: 'bg-gradient-to-br from-indigo-500 to-violet-600' },
    { name: 'Cool Sky', value: 'bg-gradient-to-br from-sky-400 to-cyan-300' },
    { name: 'Evening Sunshine', value: 'bg-gradient-to-br from-orange-300 to-rose-400' },
    { name: 'Lush Forest', value: 'bg-gradient-to-br from-emerald-400 to-lime-500' },
];

export const FONTS: { name: string; value: string; weight: 400 | 700, plan: Plan }[] = [
    { name: 'Roboto', value: "'Roboto', sans-serif", weight: 400, plan: 'free' },
    { name: 'Roboto Bold', value: "'Roboto', sans-serif", weight: 700, plan: 'pro' },
    { name: 'Oswald Bold', value: "'Oswald', sans-serif", weight: 700, plan: 'pro' },
    { name: 'Lobster', value: "'Lobster', cursive", weight: 400, plan: 'studio' },
];

export const ANIMATIONS: { name: string; value: AnimationStyle, plan: Plan }[] = [
    { name: 'Fade In', value: 'fade-in', plan: 'free' },
    { name: 'Slide Up', value: 'slide-up', plan: 'pro' },
    { name: 'Zoom In', value: 'zoom-in', plan: 'pro'},
    { name: 'Karaoke', value: 'karaoke', plan: 'studio' },
    { name: 'Typewriter', value: 'typewriter', plan: 'studio' },
];

export const VIDEO_QUALITIES: Record<VideoQuality, { width: number; height: number; name: string }> = {
    '480p': { width: 854, height: 480, name: 'SD 480p' },
    '720p': { width: 1280, height: 720, name: 'HD 720p' },
    '1080p': { width: 1920, height: 1080, name: 'Full HD 1080p' },
};

export const DEFAULT_LYRIC_STYLE: LyricStyle = {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    color: '#FFFFFF',
    textShadow: {
        color: 'rgba(0, 0, 0, 0.75)',
        blur: 10,
        offsetY: 5,
    },
    animationStyle: 'fade-in',
    transition: 'none',
    textStroke: {
        color: '#000000',
        width: 0,
    }
};