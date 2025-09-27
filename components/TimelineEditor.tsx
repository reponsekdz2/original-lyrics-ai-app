import React, { useRef, useEffect, useState } from 'react';
import { LyricLine } from '../types';

interface TimelineEditorProps {
    lyrics: LyricLine[];
    setLyrics: (lyrics: LyricLine[]) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ lyrics, setLyrics, audioRef }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const waveformRef = useRef<HTMLCanvasElement>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio?.src && !audioBuffer) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            fetch(audio.src)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(decodedData => {
                    setAudioBuffer(decodedData);
                    setDuration(decodedData.duration);
                })
                .catch(err => console.error("Error decoding audio data", err));
        }
    }, [audioRef, audioRef.current?.src, audioBuffer]);

    useEffect(() => {
        const canvas = waveformRef.current;
        if (!canvas || !audioBuffer) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(79, 70, 229, 0.6)'; // indigo-600 with opacity
        ctx.beginPath();
        ctx.moveTo(0, amp);

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            ctx.lineTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.lineTo(width, amp);
        ctx.stroke();
        ctx.fill();

    }, [audioBuffer]);

    const handleDrag = (id: string | number, newStartTime: number) => {
        const updatedLyrics = lyrics.map(line => {
            if (line.id === id) {
                const duration = line.endTime - line.startTime;
                const endTime = newStartTime + duration;
                return { ...line, startTime: newStartTime, endTime };
            }
            return line;
        });
        setLyrics(updatedLyrics);
    };

    const handleResize = (id: string | number, newEndTime: number) => {
        const updatedLyrics = lyrics.map(line =>
            line.id === id ? { ...line, endTime: newEndTime } : line
        );
        setLyrics(updatedLyrics);
    };


    if (!audioRef.current?.src) {
        return <p className="text-sm dark:text-gray-500 text-gray-400 italic text-center p-4">Upload audio to see the timeline.</p>
    }

    return (
        <div ref={containerRef} className="relative w-full h-48 bg-gray-800/50 rounded-lg overflow-x-auto border border-gray-700/50">
            <canvas ref={waveformRef} width={duration * 50} height={192} className="absolute top-0 left-0" />
            {lyrics.map(line => {
                const left = (line.startTime / duration) * 100;
                const width = ((line.endTime - line.startTime) / duration) * 100;

                return (
                    <div
                        key={line.id}
                        className="absolute top-1/2 -translate-y-1/2 h-16 bg-violet-500/50 rounded-lg border-2 border-violet-400 flex items-center p-2 cursor-move"
                        style={{ left: `${left}%`, width: `${width}%` }}
                    >
                        <p className="text-white text-xs truncate select-none">{line.text}</p>
                        {/* Note: A full drag/resize implementation is complex. This is a visual placeholder. */}
                    </div>
                );
            })}
        </div>
    );
};

export default TimelineEditor;