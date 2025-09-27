import React, { ChangeEvent, useRef, useState } from 'react';
import { LyricLine, VideoQuality } from '../types';
import AudioVisualizer from './AudioVisualizer';
import { generateCreativeLyrics } from '../services/geminiService';
import { VIDEO_QUALITIES } from '../constants';

interface RightAsideProps {
    lyrics: LyricLine[];
    setLyrics: (lyrics: LyricLine[]) => void;
    onGenerateLyrics: (file: File) => void;
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    audioUrl: string | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    hasVideoBackground: boolean;
    onExport: (quality: VideoQuality) => void;
    isExporting: boolean;
    exportProgress: number;
}

const RightAside: React.FC<RightAsideProps> = ({
    lyrics,
    setLyrics,
    onGenerateLyrics,
    isLoading,
    error,
    setError,
    audioUrl,
    audioRef,
    hasVideoBackground,
    onExport,
    isExporting,
    exportProgress,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [lyricPrompt, setLyricPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('720p');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onGenerateLyrics(e.target.files[0]);
        }
    };

    const handleLyricTextChange = (id: number | string, newText: string) => {
        setLyrics(lyrics.map(line => line.id === id ? { ...line, text: newText } : line));
    };

    const handleCreativeGenerate = async () => {
        if (!lyricPrompt.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const newLyrics = await generateCreativeLyrics(lyricPrompt);
            setLyrics(newLyrics);
        } catch (err) {
            console.error(err);
            setError('Failed to generate creative lyrics.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <aside className="w-96 bg-gray-900/50 backdrop-blur-xl border-l border-gray-700/50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold">Editor Controls</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                 <div>
                    <h3 className="font-semibold mb-2 text-cyan-400">1. AI Lyric Assistant</h3>
                    <div className="space-y-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <textarea
                            value={lyricPrompt}
                            onChange={(e) => setLyricPrompt(e.target.value)}
                            placeholder="Enter a theme or topic, e.g., 'a rainy day in the city'"
                            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            rows={3}
                            disabled={isGenerating}
                        />
                        <button
                            onClick={handleCreativeGenerate}
                            disabled={isGenerating || !lyricPrompt.trim()}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? 'Generating...' : '✨ Generate with AI'}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-cyan-400">2. Transcribe from Media</h3>
                    {hasVideoBackground ? (
                        <div className="p-4 border border-gray-600 rounded-lg text-center bg-gray-800/50">
                            <p className="text-sm text-gray-400">
                                {isLoading ? "Generating lyrics from your video..." : (lyrics.length > 0 ? "Lyrics generated from video." : "Ready to generate lyrics from video.")}
                            </p>
                            {isLoading && <div className="mt-2 h-2 bg-cyan-500/50 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-cyan-400 animate-pulse"></div></div>}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
                            <p className="text-sm text-gray-400 mb-2">Upload audio to transcribe lyrics automatically.</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Generating...' : 'Upload Audio'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="audio/*"
                                className="hidden"
                            />
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-cyan-400">3. Edit Lyrics</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 bg-gray-900/50 p-2 rounded-md border border-gray-700/50">
                        {lyrics.length > 0 ? (
                            lyrics.map(line => (
                                <div key={line.id} className="flex items-start space-x-2">
                                    <div className="text-xs text-gray-500 w-20 text-right flex-shrink-0 pt-1">
                                        <p>{line.startTime.toFixed(2)}s</p>
                                        <p>&darr;</p>
                                        <p>{line.endTime.toFixed(2)}s</p>
                                    </div>
                                    <textarea
                                        value={line.text}
                                        onChange={(e) => handleLyricTextChange(line.id, e.target.value)}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                        rows={3}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center p-4">Generate or transcribe lyrics to begin.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-cyan-400">4. Style & Animate</h3>
                    <div className="p-4 border border-dashed border-gray-600 rounded-lg text-center">
                        <p className="text-sm text-gray-400">Styling options coming soon!</p>
                    </div>
                </div>
            </div>

            {audioUrl && !hasVideoBackground && (
                <div className="p-4 border-t border-gray-700/50">
                    <h3 className="font-semibold mb-2">Playback Preview</h3>
                    <AudioVisualizer audioRef={audioRef} />
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        controls
                        className="w-full mt-2"
                    />
                </div>
            )}
            
            <div className="p-4 border-t border-gray-700/50 mt-auto">
                <h3 className="font-semibold mb-3 text-cyan-400">Export Video</h3>
                {isExporting ? (
                    <div className="text-center">
                        <p className="text-sm">Exporting your video...</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${exportProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400">{Math.round(exportProgress)}% complete</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                         <select
                            value={selectedQuality}
                            onChange={(e) => setSelectedQuality(e.target.value as VideoQuality)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {Object.entries(VIDEO_QUALITIES).map(([key, { name }]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => onExport(selectedQuality)}
                            disabled={lyrics.length === 0}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            Export Video
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default RightAside;
