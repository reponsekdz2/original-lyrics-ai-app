import React, { useState, useRef, useCallback, useEffect } from 'react';
import LeftAside from './components/LeftAside';
import RightAside from './components/RightAside';
import MainCanvas from './components/MainCanvas';
import CreateView from './components/CreateView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import PlanView from './components/PlanView';
import SettingsView from './components/SettingsView';
import { AppView, LyricLine, Background, VideoQuality, Project, User, Plan, AppSettings, LyricStyle } from './types';
import { generateLyricsFromMedia, generateImageFromPrompt } from './services/geminiService';
import { exportVideo } from './services/exportService';
import { generateVideoThumbnail } from './utils/thumbnail';
import { DEFAULT_LYRIC_STYLE } from './constants';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<AppView>('create');
    const [isLeftAsideOpen, setIsLeftAsideOpen] = useState(false);

    // Editor State
    const [background, setBackground] = useState<Background>({ type: null, value: null });
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [lyricStyle, setLyricStyle] = useState<LyricStyle>(DEFAULT_LYRIC_STYLE);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI Tools State
    const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);

    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

    // App-wide State
    const [projects, setProjects] = useState<Project[]>([]);
    const [user, setUser] = useState<User>({
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
        avatar: null,
    });
    const [currentPlan, setCurrentPlan] = useState<Plan>('free');
    const [settings, setSettings] = useState<AppSettings>({
        theme: 'dark',
        defaultQuality: '720p',
    });

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        document.body.className = settings.theme === 'dark'
            ? 'bg-gray-900 text-white overflow-hidden'
            : 'bg-gray-100 text-gray-900 overflow-hidden';
    }, [settings.theme]);


    useEffect(() => {
        // Clean up object URLs on unmount or when new ones are created
        return () => {
            if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
            projects.forEach(p => {
                URL.revokeObjectURL(p.videoUrl);
                URL.revokeObjectURL(p.thumbnailUrl);
            });
        };
    }, [exportedVideoUrl, projects]);

    const handleGenerateLyrics = useCallback(async (mediaFile: File) => {
        setIsLoading(true);
        setError(null);
        setLyrics([]);
        try {
            const generatedLyrics = await generateLyricsFromMedia(mediaFile);
            setLyrics(generatedLyrics);
            if (background.type !== 'video') {
                if (audioUrl) URL.revokeObjectURL(audioUrl);
                setAudioUrl(URL.createObjectURL(mediaFile));
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate lyrics. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [background.type, audioUrl]);
    
    const handleGenerateAiBackground = useCallback(async (prompt: string) => {
        setIsGeneratingBackground(true);
        setError(null);
        try {
            const imageBlob = await generateImageFromPrompt(prompt);
            setBackground({ type: 'image', value: imageBlob });
        } catch (err) {
            console.error(err);
            setError('Failed to generate AI background. Please try again.');
        } finally {
            setIsGeneratingBackground(false);
        }
    }, []);

    const handleSelectBackground = (type: 'image' | 'video' | 'gradient', value: File | string | null) => {
        setBackground({ type, value });
        if (type === 'video' && value instanceof File) {
             if (audioUrl) URL.revokeObjectURL(audioUrl);
            setAudioUrl(URL.createObjectURL(value));
            handleGenerateLyrics(value);
        } else {
             if (audioUrl) URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
            setLyrics([]);
        }
        setCurrentView('editor');
    };

    const handleSetCurrentView = (view: AppView) => {
        if (view === 'editor' && !background.type) {
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
        
        if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);

        setIsExporting(true);
        setExportProgress(0);
        setExportedVideoUrl(null);

        try {
            const currentAudioUrl = background.type === 'video' && background.value instanceof File
                ? URL.createObjectURL(background.value)
                : audioUrl;

            const videoBlob = await exportVideo({
                background,
                lyrics,
                lyricStyle,
                audioUrl: currentAudioUrl,
                quality,
                onProgress: setExportProgress,
            });

            const url = URL.createObjectURL(videoBlob);
            setExportedVideoUrl(url);

            // Save to library
            const thumbnailUrl = await generateVideoThumbnail(videoBlob);
            const newProject: Project = {
                id: `proj_${Date.now()}`,
                title: `My Lyric Video - ${new Date().toLocaleDateString()}`,
                thumbnailUrl,
                videoUrl: url,
                createdAt: new Date(),
                styles: lyricStyle,
            };
            setProjects(prev => [newProject, ...prev]);
            alert("Video exported successfully and saved to your library!");


        } catch (error) {
            console.error("Export failed:", error);
            setError("Video export failed. See console for details.");
        } finally {
            setIsExporting(false);
        }
    }, [background, lyrics, audioUrl, exportedVideoUrl, lyricStyle]);

    const handleNewExport = useCallback(() => {
        if (exportedVideoUrl) {
            URL.revokeObjectURL(exportedVideoUrl);
        }
        setExportedVideoUrl(null);
    }, [exportedVideoUrl]);

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
                            lyricStyle={lyricStyle}
                            audioUrl={audioUrl}
                            audioRef={audioRef}
                            videoRef={videoRef}
                        />
                        <RightAside
                            lyrics={lyrics}
                            setLyrics={setLyrics}
                            lyricStyle={lyricStyle}
                            setLyricStyle={setLyricStyle}
                            currentPlan={currentPlan}
                            onGenerateLyrics={handleGenerateLyrics}
                            onGenerateAiBackground={handleGenerateAiBackground}
                            isGeneratingBackground={isGeneratingBackground}
                            isLoading={isLoading}
                            error={error}
                            setError={setError}
                            audioUrl={audioUrl}
                            audioRef={audioRef}
                            hasVideoBackground={background.type === 'video'}
                            onExport={handleExport}
                            isExporting={isExporting}
                            exportProgress={exportProgress}
                            exportedVideoUrl={exportedVideoUrl}
                            onNewExport={handleNewExport}
                            defaultQuality={settings.defaultQuality}
                        />
                    </div>
                );
            case 'library':
                return <LibraryView projects={projects} />;
            case 'profile':
                return <ProfileView user={user} setUser={setUser} />;
            case 'plan':
                return <PlanView currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} />;
            case 'settings':
                return <SettingsView settings={settings} setSettings={setSettings} />;
            default:
                return <CreateView onSelectBackground={handleSelectBackground} />;
        }
    };

    return (
        <div className={`flex h-screen font-sans ${settings.theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <LeftAside
                isOpen={isLeftAsideOpen}
                closeAside={() => setIsLeftAsideOpen(false)}
                currentView={currentView}
                setCurrentView={handleSetCurrentView}
                user={user}
            />

            <div className="flex-1 flex flex-col relative">
                <header className={`md:hidden flex items-center justify-between p-4 ${settings.theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm border-b sticky top-0 z-20`}>
                    <button onClick={() => setIsLeftAsideOpen(true)} className={`${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
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