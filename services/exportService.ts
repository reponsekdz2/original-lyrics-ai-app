import { Background, LyricLine, VideoQuality } from '../types';
import { VIDEO_QUALITIES, GRADIENTS } from '../constants';

interface ExportOptions {
    background: Background;
    lyrics: LyricLine[];
    audioUrl: string | null;
    quality: VideoQuality;
    onProgress: (progress: number) => void;
}

const FONT = "bold 5vh sans-serif";
const TEXT_COLOR = "#FFFFFF";
const TEXT_SHADOW_COLOR = "rgba(0, 0, 0, 0.75)";
const TEXT_SHADOW_BLUR = 10;
const TEXT_SHADOW_OFFSET_Y = 5;

// Helper to load an image
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Helper to load a video for frame-by-frame drawing
const loadVideo = (src: string): Promise<HTMLVideoElement> => {
     return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = src;
        video.muted = true;
        video.onloadeddata = () => resolve(video);
    });
}

export const exportVideo = async ({
    background,
    lyrics,
    audioUrl,
    quality,
    onProgress,
}: ExportOptions): Promise<void> => {
    onProgress(0);

    const { width, height } = VIDEO_QUALITIES[quality];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const totalDuration = lyrics[lyrics.length - 1]?.endTime ?? 10;
    const FPS = 30;

    // 1. Prepare MediaStream
    const stream = canvas.captureStream(FPS);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    const chunks: Blob[] = [];

    // 2. Add audio track if available
    if (audioUrl) {
        try {
            const audioContext = new AudioContext();
            const audioData = await fetch(audioUrl).then(res => res.arrayBuffer());
            const audioBuffer = await audioContext.decodeAudioData(audioData);
            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            const destination = audioContext.createMediaStreamDestination();
            audioSource.connect(destination);
            const audioTrack = destination.stream.getAudioTracks()[0];
            stream.addTrack(audioTrack);
            audioSource.start();
        } catch(e) {
            console.error("Could not process audio, exporting video without sound.", e);
        }
    }
    
    // 3. Prepare background assets
    let bgImage: HTMLImageElement | null = null;
    let bgVideo: HTMLVideoElement | null = null;
    
    if (background.type === 'image' && background.value instanceof File) {
        bgImage = await loadImage(URL.createObjectURL(background.value));
    } else if (background.type === 'video' && background.value instanceof File) {
        bgVideo = await loadVideo(URL.createObjectURL(background.value));
        await bgVideo.play(); // Start playing to enable seeking
        bgVideo.pause();
    }

    // 4. Start recording and rendering
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `lyric-vision-${Date.now()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        onProgress(100);
    };

    mediaRecorder.start();

    // 5. Render loop
    let frame = 0;
    const totalFrames = Math.ceil(totalDuration * FPS);

    const renderFrame = async () => {
        if (frame > totalFrames) {
            mediaRecorder.stop();
            return;
        }

        const currentTime = frame / FPS;

        // Draw background
        ctx.clearRect(0, 0, width, height);
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, width, height);
        } else if (bgVideo) {
            bgVideo.currentTime = currentTime % bgVideo.duration;
            await new Promise(res => { bgVideo.onseeked = res; });
            ctx.drawImage(bgVideo, 0, 0, width, height);
        } else if (background.type === 'gradient' && typeof background.value === 'string') {
            const gradientInfo = GRADIENTS.find(g => g.name === background.value);
            if (gradientInfo && gradientInfo.value.includes('from-yellow-400')) {
                const gradient = ctx.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, '#facc15');
                gradient.addColorStop(0.5, '#ef4444');
                gradient.addColorStop(1, '#ec4899');
                ctx.fillStyle = gradient;
            } else {
                 ctx.fillStyle = '#1f2937';
            }
            ctx.fillRect(0, 0, width, height);
        } else {
             ctx.fillStyle = '#000000';
             ctx.fillRect(0,0,width,height);
        }

        // Draw lyrics
        const activeLine = lyrics.find(l => currentTime >= l.startTime && currentTime <= l.endTime);
        if (activeLine) {
            ctx.font = FONT;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = TEXT_SHADOW_COLOR;
            ctx.shadowBlur = TEXT_SHADOW_BLUR;
            ctx.shadowOffsetY = TEXT_SHADOW_OFFSET_Y;
            ctx.shadowOffsetX = 0;

            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(activeLine.text, width / 2, height * 0.85);
        }

        // Update progress and schedule next frame
        onProgress((frame / totalFrames) * 100);
        frame++;
        requestAnimationFrame(renderFrame);
    };

    renderFrame();
    
    return Promise.resolve();
};
