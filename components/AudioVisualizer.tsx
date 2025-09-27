// Fix: Create AudioVisualizer component.
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  mediaRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ mediaRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);


  useEffect(() => {
    const mediaEl = mediaRef.current;
    const canvas = canvasRef.current;
    if (!mediaEl || !canvas) return;

    const setupAudioContext = () => {
        if (audioContextRef.current) return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(mediaEl);
            
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 256;
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;

        } catch(e) {
            console.error("Could not create AudioContext for visualizer", e);
        }
    };


    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      const analyser = analyserRef.current;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = (canvas.width - (bufferLength * (barWidth))) / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 3;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#8b5cf6'); // violet-500
        gradient.addColorStop(1, '#6366f1'); // indigo-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth;
      }
    };
    
    const startVisualization = () => {
        if (!audioContextRef.current) setupAudioContext();
        const audioContext = audioContextRef.current;

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        draw();
    }

    const stopVisualization = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };

    mediaEl.addEventListener('play', startVisualization);
    mediaEl.addEventListener('pause', stopVisualization);
    mediaEl.addEventListener('ended', stopVisualization);


    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioContextRef.current?.close().catch(console.error);
      audioContextRef.current = null;
      
      mediaEl.removeEventListener('play', startVisualization);
      mediaEl.removeEventListener('pause', stopVisualization);
      mediaEl.removeEventListener('ended', stopVisualization);
    };

  }, [mediaRef]);

  return <canvas ref={canvasRef} width="600" height="80" className="w-full h-16 pointer-events-auto" />;
};

export default AudioVisualizer;