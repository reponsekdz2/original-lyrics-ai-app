import { Background, LyricLine, VideoQuality, LyricStyle } from '../types';
import { VIDEO_QUALITIES, GRADIENTS } from '../constants';

interface ExportOptions {
    background: Background;
    lyrics: LyricLine[];
    lyricStyle: LyricStyle;
    audioUrl: string | null;
    quality: VideoQuality;
    onProgress: (progress: number) => void;
}

const GRADIENT_COLORS: Record<string, { colors: { stop: number, color: string }[] }> = {
    'Sunrise': { colors: [{ stop: 0, color: '#facc15' }, { stop: 0.5, color: '#ef4444' }, { stop: 1, color: '#ec4899' }] },
    'Ocean': { colors: [{ stop: 0, color: '#86efac' }, { stop: 0.5, color: '#3b82f6' }, { stop: 1, color: '#9333ea' }] },
    'Twilight': { colors: [{ stop: 0, color: '#c084fc' }, { stop: 0.5, color: '#ec4899' }, { stop: 1, color: '#ef4444' }] },
    'Mint': { colors: [{ stop: 0, color: '#bbf7d0' }, { stop: 0.5, color: '#4ade80' }, { stop: 1, color: '#22c55e' }] },
    'Cherry': { colors: [{ stop: 0, color: '#ef4444' }, { stop: 1, color: '#991b1b' }] },
    'Modern Indigo': { colors: [{ stop: 0, color: '#6366f1' }, { stop: 1, color: '#8b5cf6' }] },
    'Cool Sky': { colors: [{ stop: 0, color: '#38bdf8' }, { stop: 1, color: '#67e8f9' }] },
    'Evening Sunshine': { colors: [{ stop: 0, color: '#fb923c' }, { stop: 1, color: '#f472b6' }] },
    'Lush Forest': { colors: [{ stop: 0, color: '#34d399' }, { stop: 1, color: '#a3e635' }] },
};


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

const drawVisualizerOnCanvas = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, canvasWidth: number, canvasHeight: number) => {
    const bufferLength = dataArray.length;
    const barWidth = (canvasWidth / bufferLength) * 1.5;
    let x = (canvasWidth - (bufferLength * barWidth)) / 2;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 3) * (canvasHeight / 100); // Scale height relative to canvas
        
        const gradient = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight - barHeight);
        gradient.addColorStop(0, '#8b5cf6'); // violet-500
        gradient.addColorStop(1, '#6366f1'); // indigo-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
        
        x += barWidth;
    }
};

export const exportVideo = ({
    background,
    lyrics,
    lyricStyle,
    audioUrl,
    quality,
    onProgress,
}: ExportOptions): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        onProgress(0);

        const { width, height } = VIDEO_QUALITIES[quality];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        const totalDuration = lyrics.length > 0 ? lyrics[lyrics.length - 1].endTime : 10;
        const FPS = 30;

        // 1. Prepare MediaStream
        const stream = canvas.captureStream(FPS);
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
        const chunks: Blob[] = [];

        // 2. Add audio track if available
        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let visualizerDataArray: Uint8Array | null = null;

        if (audioUrl) {
            try {
                audioContext = new AudioContext();
                const audioData = await fetch(audioUrl).then(res => res.arrayBuffer());
                const audioBuffer = await audioContext.decodeAudioData(audioData);
                const audioSource = audioContext.createBufferSource();
                audioSource.buffer = audioBuffer;
                
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                visualizerDataArray = new Uint8Array(analyser.frequencyBinCount);

                const destination = audioContext.createMediaStreamDestination();
                audioSource.connect(analyser);
                analyser.connect(destination);
                
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
        
        try {
            if (background.type === 'image' && background.value instanceof File) {
                bgImage = await loadImage(URL.createObjectURL(background.value));
            } else if (background.type === 'video' && background.value instanceof File) {
                bgVideo = await loadVideo(URL.createObjectURL(background.value));
                await bgVideo.play();
                bgVideo.pause();
            }
        } catch(e) {
            return reject(e);
        }

        // 4. Start recording and rendering
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            audioContext?.close();
            onProgress(100);
            resolve(blob);
        };
        mediaRecorder.onerror = (e) => {
            audioContext?.close();
            reject(e);
        };

        mediaRecorder.start();

        // 5. Render loop
        let frame = 0;
        const totalFrames = Math.ceil(totalDuration * FPS);
        let lastActiveLine: LyricLine | null = null;

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
                await new Promise<void>(res => { bgVideo.onseeked = () => res(); });
                ctx.drawImage(bgVideo, 0, 0, width, height);
            } else if (background.type === 'gradient' && typeof background.value === 'string') {
                const gradientName = GRADIENTS.find(g => g.name === background.value)?.name;
                const gradientColors = gradientName ? GRADIENT_COLORS[gradientName] : null;

                if (gradientColors) {
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradientColors.colors.forEach(c => gradient.addColorStop(c.stop, c.color));
                    ctx.fillStyle = gradient;
                } else {
                     ctx.fillStyle = '#1f2937'; // Default
                }
                ctx.fillRect(0, 0, width, height);
            } else {
                 ctx.fillStyle = '#000000';
                 ctx.fillRect(0,0,width,height);
            }

            // Draw Audio Visualizer
            if (analyser && visualizerDataArray) {
                analyser.getByteFrequencyData(visualizerDataArray);
                drawVisualizerOnCanvas(ctx, visualizerDataArray, width, height);
            }

            // Draw lyrics
            const activeLine = lyrics.find(l => currentTime >= l.startTime && currentTime <= l.endTime);
            
            const drawText = (line: LyricLine, overrideOpacity?: number) => {
                ctx.font = `${lyricStyle.fontWeight} ${height * 0.05}px ${lyricStyle.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.shadowColor = lyricStyle.textShadow.color;
                ctx.shadowBlur = lyricStyle.textShadow.blur;
                ctx.shadowOffsetY = lyricStyle.textShadow.offsetY;
                ctx.shadowOffsetX = 0;

                const yPos = height * 0.85;
                const timeInLine = currentTime - line.startTime;
                
                ctx.globalAlpha = overrideOpacity ?? 1;

                if (lyricStyle.animationStyle === 'karaoke' && !overrideOpacity) {
                    const progress = Math.min(timeInLine / (line.endTime - line.startTime), 1);
                    const textWidth = ctx.measureText(line.text).width;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillText(line.text, width / 2, yPos);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect((width - textWidth) / 2, yPos - height * 0.05, textWidth * progress, height * 0.1);
                    ctx.clip();
                    ctx.fillStyle = lyricStyle.color;
                    ctx.fillText(line.text, width / 2, yPos);
                    ctx.restore();
                } else if (lyricStyle.animationStyle === 'typewriter' && !overrideOpacity) {
                    const progress = Math.min(timeInLine / ((line.endTime - line.startTime) * 0.8), 1);
                    const visibleText = line.text.substring(0, Math.floor(line.text.length * progress));
                    ctx.fillStyle = lyricStyle.color;
                    ctx.fillText(visibleText, width / 2, yPos);
                }
                else {
                    ctx.fillStyle = lyricStyle.color;
                    ctx.fillText(line.text, width / 2, yPos);
                }

                if(lyricStyle.textStroke.width > 0) {
                    ctx.strokeStyle = lyricStyle.textStroke.color;
                    ctx.lineWidth = lyricStyle.textStroke.width;
                    ctx.strokeText(line.text, width/2, yPos);
                }
                 ctx.globalAlpha = 1;
            }

            if (lyricStyle.transition === 'cross-fade' && lastActiveLine && lastActiveLine.id !== activeLine?.id) {
                const timeSinceEnd = currentTime - lastActiveLine.endTime;
                if (timeSinceEnd > 0 && timeSinceEnd < 0.5) { // 0.5s fade out
                    drawText(lastActiveLine, 1 - (timeSinceEnd / 0.5));
                }
            }
            if (activeLine) {
                drawText(activeLine);
                lastActiveLine = activeLine;
            }


            // Update progress and schedule next frame
            onProgress((frame / totalFrames) * 100);
            frame++;
            requestAnimationFrame(renderFrame);
        };

        renderFrame();
    });
};