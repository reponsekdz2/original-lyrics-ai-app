// Fix: Create constants.tsx to provide gradient options.
import React from 'react';
import { VideoQuality } from './types';


export const GRADIENTS = [
    { name: 'Default', value: 'bg-gray-800' },
    { name: 'Sunrise', value: 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500' },
    { name: 'Ocean', value: 'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600' },
    { name: 'Twilight', value: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
    { name: 'Mint', value: 'bg-gradient-to-r from-green-200 via-green-400 to-green-500' },
    { name: 'Cherry', value: 'bg-gradient-to-r from-red-500 to-red-800' },
    { name: 'Violet', value: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
];

export const VIDEO_QUALITIES: Record<VideoQuality, { width: number; height: number; name: string }> = {
    '480p': { width: 854, height: 480, name: 'SD 480p' },
    '720p': { width: 1280, height: 720, name: 'HD 720p' },
    '1080p': { width: 1920, height: 1080, name: 'Full HD 1080p' },
};
