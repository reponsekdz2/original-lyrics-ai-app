import React, { useState, useEffect, useMemo } from 'react';
import { LyricLine, Background } from '../types';
import { GRADIENTS } from '../constants';

interface MainCanvasProps {
    background: Background;
    lyrics: LyricLine[];
    audioUrl: string | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const MainCanvas: React.FC<MainCanvasProps> = ({ background, lyrics, audioUrl, audioRef, videoRef }) => {
    const [currentTime, setCurrentTime] = useState(0);

    const activeLyricLine = useMemo(() => {
        return lyrics.find(line => currentTime >= line.startTime && currentTime <= line.endTime);
    }, [lyrics, currentTime]);

    useEffect(() => {
        const mediaElement = background.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        const handleTimeUpdate = () => {
            setCurrentTime(mediaElement.currentTime);
        };

        mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [audioRef, videoRef, background.type]);

    const bgUrl = useMemo(() => {
        if (background.value instanceof File) {
            return URL.createObjectURL(background.value);
        }
        return null;
    }, [background.value]);

    const gradientClass = useMemo(() => {
        if (background.type === 'gradient' && typeof background.value === 'string') {
            return GRADIENTS.find(g => g.name === background.value)?.value || 'bg-gray-800';
        }
        return 'bg-gray-800';
    }, [background.type, background.value]);

    return (
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Layer */}
            {background.type === 'image' && bgUrl && (
                <img src={bgUrl} alt="background" className="absolute top-0 left-0 w-full h-full object-cover" />
            )}
            {background.type === 'video' && audioUrl && (
                <video
                    ref={videoRef}
                    src={audioUrl}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    loop
                    controls
                    autoPlay
                />
            )}
            {background.type === 'gradient' && (
                <div className={`absolute top-0 left-0 w-full h-full ${gradientClass}`} />
            )}
            {background.type === null && (
                <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-bold">Welcome to Lyric Vision AI</h2>
                    <p className="mt-2">Please select a background from the 'Create' tab to begin.</p>
                </div>
            )}
            
            {/* Lyric Overlay */}
            <div className="absolute inset-0 flex items-end justify-center p-8 md:p-16 pointer-events-none">
                 {activeLyricLine && (
                    <p
                        key={activeLyricLine.id}
                        className="text-3xl md:text-5xl font-bold text-white text-center animate-lyric-in"
                        style={{ textShadow: '0px 3px 6px rgba(0, 0, 0, 0.75)' }}
                    >
                        {activeLyricLine.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MainCanvas;