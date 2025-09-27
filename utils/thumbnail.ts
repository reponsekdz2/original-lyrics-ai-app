export const generateVideoThumbnail = (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const url = URL.createObjectURL(videoBlob);

        video.src = url;
        video.muted = true;

        video.onloadeddata = () => {
            video.currentTime = 0.5; // Seek to half a second in
        };

        video.onseeked = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error('Canvas context not available'));
            }

            // Set canvas dimensions to video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        };
        
        video.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
    });
};
