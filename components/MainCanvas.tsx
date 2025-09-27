import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LyricLine, Background, LyricStyle } from '../types';
import { GRADIENTS } from '../constants';
import AudioVisualizer from './AudioVisualizer';

interface MainCanvasProps {
    background: Background;
    lyrics: LyricLine[];
    lyricStyle: LyricStyle;
    audioUrl: string | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const MainCanvas: React.FC<MainCanvasProps> = ({ background, lyrics, lyricStyle, audioUrl, audioRef, videoRef }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const prevActiveLineRef = useRef<LyricLine | null>(null);

    const mediaRef = background.type === 'video' ? videoRef : audioRef;

    const activeLyricLine = useMemo(() => {
        return lyrics.find(line => currentTime >= line.startTime && currentTime <= line.endTime);
    }, [lyrics, currentTime]);

    useEffect(() => {
        if (activeLyricLine) {
            prevActiveLineRef.current = activeLyricLine;
        }
    }, [activeLyricLine])
    
    const prevLyricLineToRender = useMemo(() => {
        // Find the line that just ended to handle cross-fade
        if (lyricStyle.transition !== 'cross-fade' || !prevActiveLineRef.current) return null;
        const prev = prevActiveLineRef.current;
        if (activeLyricLine && activeLyricLine.id === prev.id) return null;

        const timeSinceEnd = currentTime - prev.endTime;
        if (timeSinceEnd > 0 && timeSinceEnd < 0.5) { // 0.5s fade out
             return { line: prev, opacity: 1 - (timeSinceEnd / 0.5) };
        }
        return null;
    }, [lyrics, currentTime, lyricStyle.transition, activeLyricLine]);

    useEffect(() => {
        const mediaElement = background.type === 'video' ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        const handleTimeUpdate = () => {
            setCurrentTime(mediaElement.currentTime);
        };
        
        mediaElement.addEventListener('timeupdate', handleTimeUpdate);
        
        // Also update time when seeking
        const handleSeeked = () => setCurrentTime(mediaElement.currentTime);
        mediaElement.addEventListener('seeked', handleSeeked);

        return () => {
            mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
            mediaElement.removeEventListener('seeked', handleSeeked);
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
            return GRADIENTS.find(g => g.name === background.value)?.value || 'dark:bg-gray-800 bg-gray-200';
        }
        return 'dark:bg-gray-800 bg-gray-200';
    }, [background.type, background.value]);

    const renderLyricLine = (line: LyricLine, isPrevious = false, opacity = 1) => {
        if (!line) return null;

        const duration = line.endTime - line.startTime;
        const animationClass = isPrevious ? '' : `animate-lyric-${lyricStyle.animationStyle}`;
        
        const inlineStyle: React.CSSProperties = {
            fontFamily: lyricStyle.fontFamily,
            fontWeight: lyricStyle.fontWeight,
            color: lyricStyle.animationStyle === 'karaoke' && !isPrevious ? 'rgba(255, 255, 255, 0.3)' : lyricStyle.color,
            textShadow: `${lyricStyle.textShadow.color} 0px ${lyricStyle.textShadow.offsetY}px ${lyricStyle.textShadow.blur}px`,
            WebkitTextStroke: lyricStyle.textStroke.width > 0 ? `${lyricStyle.textStroke.width}px ${lyricStyle.textStroke.color}` : 'none',
            opacity: opacity,
            transition: isPrevious ? 'opacity 0.5s ease-out' : 'none',
        };

        if (lyricStyle.animationStyle === 'karaoke' && !isPrevious) {
            return (
                 <p key={`${line.id}-karaoke`} style={inlineStyle} className="relative text-3xl md:text-5xl text-center">
                    {line.text}
                    <span
                        className="absolute top-0 left-0 h-full whitespace-nowrap overflow-hidden"
                        style={{ color: lyricStyle.color, animationDuration: `${duration}s` }}
                    >
                         {line.text}
                    </span>
                </p>
            );
        }
        
         if (lyricStyle.animationStyle === 'typewriter' && !isPrevious) {
            return (
                 <div key={`${line.id}-typewriter-wrapper`} className={animationClass} style={{animationDuration: `${duration * 0.8}s`}}>
                    <p style={inlineStyle} className="text-3xl md:text-5xl font-bold text-center">
                        {line.text}
                    </p>
                </div>
            )
        }

        return (
            <p
                key={line.id}
                className={`text-3xl md:text-5xl font-bold text-center ${animationClass}`}
                style={inlineStyle}
            >
                {line.text}
            </p>
        );
    }


    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-black relative overflow-hidden">
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
                 <div className="text-center dark:text-gray-500 text-gray-400">
                    <h2 className="text-2xl font-bold">Welcome to Lyric Vision AI</h2>
                    <p className="mt-2">Please select a background to begin.</p>
                </div>
            )}
            
            {/* Lyric Overlay */}
            <div className="absolute inset-0 flex items-end justify-center p-8 md:p-16 pointer-events-none">
                <div className="relative h-24 w-full flex items-center justify-center">
                    <div className="absolute bottom-0">
                         {prevLyricLineToRender && renderLyricLine(prevLyricLineToRender.line, true, prevLyricLineToRender.opacity)}
                    </div>
                     <div className="absolute bottom-0">
                        {activeLyricLine && renderLyricLine(activeLyricLine)}
                    </div>
                </div>
            </div>

            {/* Visualizer & Controls Layer */}
             <div className="absolute bottom-0 left-0 w-full z-10">
                <div className="w-full px-4 pointer-events-none">
                    {audioUrl && <AudioVisualizer mediaRef={mediaRef} />}
                </div>

                {background.type !== 'video' && audioUrl && (
                    <div className="p-4 pt-0">
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            controls
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainCanvas;