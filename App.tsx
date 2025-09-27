import React, { useState, useRef, useCallback } from 'react';
import LeftAside from './components/LeftAside';
import RightAside from './components/RightAside';
import MainCanvas from './components/MainCanvas';
import CreateView from './components/CreateView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import PlanView from './components/PlanView';
import SettingsView from './components/SettingsView';
import { AppView, LyricLine, Background, VideoQuality } from './types';
import { generateLyricsFromMedia } from './services/geminiService';
import { exportVideo } from './services/exportService';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<AppView>('create');
    const [isLeftAsideOpen, setIsLeftAsideOpen] = useState(false);

    const [background, setBackground] = useState<Background>({ type: null, value: null });
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleGenerateLyrics = useCallback(async (mediaFile: File) => {
        setIsLoading(true);
        setError(null);
        setLyrics([]);
        try {
            const generatedLyrics = await generateLyricsFromMedia(mediaFile);
            setLyrics(generatedLyrics);
            // For non-video backgrounds, the media file provides the audio source.
            // For video backgrounds, the audio source is the video file itself, handled in handleSelectBackground.
            if (background.type !== 'video') {
                setAudioUrl(URL.createObjectURL(mediaFile));
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate lyrics. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [background.type]);

    const handleSelectBackground = (type: 'image' | 'video' | 'gradient', value: File | string | null) => {
        setBackground({ type, value });
        if (type === 'video' && value instanceof File) {
            setAudioUrl(URL.createObjectURL(value));
            handleGenerateLyrics(value); // Auto-generate lyrics from video
        } else {
            // Reset audio if it's not a video background
            setAudioUrl(null);
            setLyrics([]);
        }
        setCurrentView('editor');
    };

    const handleSetCurrentView = (view: AppView) => {
        if (view === 'editor' && !background.type) {
            // Don't switch to editor if no background is set, stay on create
            setCurrentView('create');
            return;
        }
        setCurrentView(view);
    };
    
    const handleExport = useCallback(async (quality: VideoQuality) => {
        if (!background.type || lyrics.length === 0) {
            alert("Please set a background and generate lyrics before exporting.");
            return;
        }

        setIsExporting(true);
        setExportProgress(0);

        try {
            const currentAudioUrl = background.type === 'video' && background.value instanceof File
                ? URL.createObjectURL(background.value)
                : audioUrl;

            await exportVideo({
                background,
                lyrics,
                audioUrl: currentAudioUrl,
                quality,
                onProgress: setExportProgress,
            });
        } catch (error) {
            console.error("Export failed:", error);
            setError("Video export failed. See console for details.");
        } finally {
            setIsExporting(false);
        }
    }, [background, lyrics, audioUrl]);

    const renderMainContent = () => {
        switch (currentView) {
            case 'create':
                return <CreateView onSelectBackground={handleSelectBackground} />;
            case 'editor':
                return (
                    <div className="flex flex-1 overflow-hidden">
                        <MainCanvas
                            background={background}
                            lyrics={lyrics}
                            audioUrl={audioUrl}
                            audioRef={audioRef}
                            videoRef={videoRef}
                        />
                        <RightAside
                            lyrics={lyrics}
                            setLyrics={setLyrics}
                            onGenerateLyrics={handleGenerateLyrics}
                            isLoading={isLoading}
                            error={error}
                            setError={setError}
                            audioUrl={audioUrl}
                            audioRef={audioRef}
                            hasVideoBackground={background.type === 'video'}
                            onExport={handleExport}
                            isExporting={isExporting}
                            exportProgress={exportProgress}
                        />
                    </div>
                );
            case 'library':
                return <LibraryView />;
            case 'profile':
                return <ProfileView />;
            case 'plan':
                return <PlanView />;
            case 'settings':
                return <SettingsView />;
            default:
                return <CreateView onSelectBackground={handleSelectBackground} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <LeftAside
                isOpen={isLeftAsideOpen}
                closeAside={() => setIsLeftAsideOpen(false)}
                currentView={currentView}
                setCurrentView={handleSetCurrentView}
            />

            <div className="flex-1 flex flex-col relative">
                <header className="md:hidden flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
                    <button onClick={() => setIsLeftAsideOpen(true)} className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <span className="font-semibold text-lg">Lyric Vision AI</span>
                </header>
                <main className="flex-1 flex flex-col overflow-y-auto">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
