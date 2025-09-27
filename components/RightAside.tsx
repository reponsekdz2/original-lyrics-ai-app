import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import { LyricLine, VideoQuality, LyricStyle, Plan, AnimationStyle } from '../types';
import TimelineEditor from './TimelineEditor';
import { generateCreativeLyrics } from '../services/geminiService';
import { VIDEO_QUALITIES, FONTS, ANIMATIONS } from '../constants';

interface RightAsideProps {
    lyrics: LyricLine[];
    setLyrics: (lyrics: LyricLine[]) => void;
    lyricStyle: LyricStyle;
    setLyricStyle: (style: LyricStyle) => void;
    currentPlan: Plan;
    onGenerateLyrics: (file: File) => void;
    onGenerateAiBackground: (prompt: string) => void;
    isGeneratingBackground: boolean;
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    audioUrl: string | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    hasVideoBackground: boolean;
    onExport: (quality: VideoQuality) => void;
    isExporting: boolean;
    exportProgress: number;
    exportedVideoUrl: string | null;
    onNewExport: () => void;
    defaultQuality: VideoQuality;
}

const planToNumber = (plan: Plan) => {
    if (plan === 'studio') return 2;
    if (plan === 'pro') return 1;
    return 0;
};

const Accordion: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen=false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b dark:border-gray-700/50 border-gray-200/50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-semibold">
                <span>{title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    )
}

const FeatureLock: React.FC<{ requiredPlan: Plan, userPlan: Plan, children: React.ReactNode }> = ({ requiredPlan, userPlan, children }) => {
    const userPlanLevel = planToNumber(userPlan);
    const requiredLevel = planToNumber(requiredPlan);
    if (userPlanLevel >= requiredLevel) {
        return <>{children}</>;
    }
    return (
        <div className="relative">
            <div className="opacity-40 pointer-events-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/60 rounded-md">
                 <span className="text-xs font-bold text-white bg-violet-600 px-2 py-1 rounded">Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}</span>
            </div>
        </div>
    )
};


const RightAside: React.FC<RightAsideProps> = (props) => {
    const {
        lyrics, setLyrics, lyricStyle, setLyricStyle, currentPlan,
        onGenerateLyrics, onGenerateAiBackground, isGeneratingBackground,
        isLoading, error, setError, audioUrl, audioRef,
        hasVideoBackground, onExport, isExporting, exportProgress,
        exportedVideoUrl, onNewExport, defaultQuality
    } = props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [lyricPrompt, setLyricPrompt] = useState('');
    const [aiBgPrompt, setAiBgPrompt] = useState('');
    const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(defaultQuality);
    
    useEffect(() => {
        setSelectedQuality(defaultQuality);
    }, [defaultQuality]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onGenerateLyrics(e.target.files[0]);
        }
    };
    
    const handleStyleChange = (field: keyof LyricStyle | keyof LyricStyle['textStroke'], value: any) => {
        if (['color', 'width'].includes(field as string)) {
             setLyricStyle({ ...lyricStyle, textStroke: {...lyricStyle.textStroke, [field]: value }});
        } else {
            setLyricStyle({ ...lyricStyle, [field as keyof LyricStyle]: value });
        }
    };
    
    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFont = FONTS.find(f => f.value === e.target.value);
        if(selectedFont) {
             setLyricStyle({ ...lyricStyle, fontFamily: selectedFont.value, fontWeight: selectedFont.weight });
        }
    };

    const handleCreativeGenerate = async () => {
        if (!lyricPrompt.trim()) return;
        setIsGeneratingCreative(true);
        setError(null);
        try {
            const newLyrics = await generateCreativeLyrics(lyricPrompt);
            setLyrics(newLyrics);
            setAiBgPrompt(lyricPrompt); // Pre-fill background prompt
        } catch (err) {
            console.error(err);
            setError('Failed to generate creative lyrics.');
        } finally {
            setIsGeneratingCreative(false);
        }
    };

    const handleAiBgGenerate = () => {
        if (!aiBgPrompt.trim()) return;
        onGenerateAiBackground(aiBgPrompt);
    }
    

    return (
        <aside className="w-96 dark:bg-gray-900/50 bg-white/50 backdrop-blur-xl border-l dark:border-gray-700/50 border-gray-200/50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b dark:border-gray-700/50 border-gray-200/50">
                <h2 className="text-xl font-bold">Editor Controls</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <Accordion title="Lyrics & Timing" defaultOpen>
                     <div className="space-y-4">
                        {!hasVideoBackground && (
                             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed dark:border-gray-600 border-gray-300 rounded-lg text-center">
                                <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">Upload audio to transcribe lyrics.</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Transcribing...' : 'Upload Audio'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
                            </div>
                        )}
                        <TimelineEditor lyrics={lyrics} setLyrics={setLyrics} audioRef={audioRef} />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </Accordion>
                <Accordion title="AI Tools">
                     <div className="space-y-4 dark:bg-gray-800/50 bg-gray-200/50 p-3 rounded-lg border dark:border-gray-700/50 border-gray-300/50">
                        <h3 className="font-semibold text-sm">Creative Lyric Generation</h3>
                        <textarea
                            value={lyricPrompt}
                            onChange={(e) => setLyricPrompt(e.target.value)}
                            placeholder="A song about a robot learning to dream..."
                            className="w-full dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={2}
                            disabled={isGeneratingCreative}
                        />
                        <button
                            onClick={handleCreativeGenerate}
                            disabled={isGeneratingCreative || !lyricPrompt.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isGeneratingCreative ? 'Writing...' : '✨ Generate Lyrics'}
                        </button>
                    </div>
                    <div className="space-y-4 dark:bg-gray-800/50 bg-gray-200/50 p-3 rounded-lg border dark:border-gray-700/50 border-gray-300/50 mt-4">
                        <h3 className="font-semibold text-sm">AI Background Generator</h3>
                         <FeatureLock requiredPlan='studio' userPlan={currentPlan}>
                            <textarea
                                value={aiBgPrompt}
                                onChange={(e) => setAiBgPrompt(e.target.value)}
                                placeholder="An abstract, dreamy landscape with glowing circuits..."
                                className="w-full dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={2}
                                disabled={isGeneratingBackground}
                            />
                            <button
                                onClick={handleAiBgGenerate}
                                disabled={isGeneratingBackground || !aiBgPrompt.trim()}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isGeneratingBackground ? 'Generating...' : '🎨 Generate Background'}
                            </button>
                        </FeatureLock>
                    </div>
                </Accordion>
                <Accordion title="Style & Animation">
                     <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Font Family</label>
                            <select value={lyricStyle.fontFamily} onChange={handleFontChange} className="w-full mt-1 dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {FONTS.map(font => (
                                    <option key={font.name} value={font.value} disabled={planToNumber(currentPlan) < planToNumber(font.plan)}>
                                        {font.name} {planToNumber(currentPlan) < planToNumber(font.plan) ? `(${font.plan.toUpperCase()})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                         <FeatureLock requiredPlan='pro' userPlan={currentPlan}>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Font Color</label>
                                    <input type="color" value={lyricStyle.color} onChange={e => handleStyleChange('color', e.target.value)} className="w-full p-0 h-10 border-none cursor-pointer bg-transparent" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Transition</label>
                                    <select value={lyricStyle.transition} onChange={e => handleStyleChange('transition', e.target.value)} className="w-full mt-1 dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="none">None</option>
                                        <option value="cross-fade">Cross-Fade</option>
                                    </select>
                                </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Stroke Color</label>
                                    <input type="color" value={lyricStyle.textStroke.color} onChange={e => handleStyleChange('color', e.target.value)} className="w-full p-0 h-10 border-none cursor-pointer bg-transparent" />
                                </div>
                                 <div>
                                    <label className="text-sm font-medium">Stroke Width</label>
                                    <input type="range" min="0" max="10" step="0.5" value={lyricStyle.textStroke.width} onChange={e => handleStyleChange('width', parseFloat(e.target.value))} className="w-full mt-2" />
                                </div>
                           </div>
                        </FeatureLock>
                        <div>
                            <label className="text-sm font-medium">Animation</label>
                             <select value={lyricStyle.animationStyle} onChange={e => handleStyleChange('animationStyle', e.target.value as AnimationStyle)} className="w-full mt-1 dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {ANIMATIONS.map(anim => (
                                     <option key={anim.name} value={anim.value} disabled={planToNumber(currentPlan) < planToNumber(anim.plan)}>
                                        {anim.name} {planToNumber(currentPlan) < planToNumber(anim.plan) ? `(${anim.plan.toUpperCase()})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Export">
                    {isExporting ? (
                    <div className="text-center">
                        <p className="text-sm">Exporting your video...</p>
                        <div className="w-full dark:bg-gray-700 bg-gray-200 rounded-full h-2.5 my-2">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${exportProgress}%` }}></div>
                        </div>
                        <p className="text-xs dark:text-gray-400 text-gray-500">{Math.round(exportProgress)}% complete</p>
                    </div>
                ) : exportedVideoUrl ? (
                    <div className="space-y-3">
                        <p className="text-sm text-center text-green-500 dark:text-green-400">Your video is ready!</p>
                        <a href={exportedVideoUrl} download={`lyric-vision-${Date.now()}.webm`} className="w-full text-center block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Download Video</a>
                        <button onClick={onNewExport} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">Start New Export</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                         <select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value as VideoQuality)} className="w-full dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {Object.entries(VIDEO_QUALITIES).map(([key, { name }]) => (<option key={key} value={key}>{name}</option>))}
                        </select>
                        <button onClick={() => onExport(selectedQuality)} disabled={lyrics.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">Export Video</button>
                    </div>
                )}
                </Accordion>
            </div>
        </aside>
    );
};

export default RightAside;