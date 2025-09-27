import React, { useRef, ChangeEvent } from 'react';
import { GRADIENTS } from '../constants';

interface CreateViewProps {
    onSelectBackground: (type: 'image' | 'video' | 'gradient', value: File | string | null) => void;
}

const CreateCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    children?: React.ReactNode;
}> = ({ icon, title, description, onClick, children }) => (
    <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col items-center text-center border-2 border-transparent hover:border-cyan-500/50 transition-all duration-300">
        <div className="w-16 h-16 mb-4 text-cyan-400">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4 flex-grow">{description}</p>
        <button onClick={onClick} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Select
        </button>
        {children}
    </div>
);


const CreateView: React.FC<CreateViewProps> = ({ onSelectBackground }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onSelectBackground('image', e.target.files[0]);
        }
    };

    const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onSelectBackground('video', e.target.files[0]);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Start Your Creation</h1>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl">Choose a background to begin bringing your lyrics to life. Upload your own media or start with a beautiful gradient.</p>

            <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
                {/* Upload Image */}
                <CreateCard
                    icon={<ImageIcon />}
                    title="Use Image"
                    description="Upload a static image as a backdrop for your lyrics."
                    onClick={() => imageInputRef.current?.click()}
                >
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </CreateCard>

                {/* Upload Video */}
                <CreateCard
                    icon={<VideoIcon />}
                    title="Use Video"
                    description="Upload a video loop to create a dynamic background."
                    onClick={() => videoInputRef.current?.click()}
                >
                     <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
                </CreateCard>
                
                {/* Choose Gradient */}
                 <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col items-center text-center border-2 border-transparent hover:border-cyan-500/50 transition-all duration-300">
                    <div className="w-16 h-16 mb-4 text-cyan-400"><GradientIcon/></div>
                    <h3 className="text-xl font-bold mb-2">Use Gradient</h3>
                    <p className="text-gray-400 mb-4 flex-grow">Select from a curated list of beautiful gradients.</p>
                    <div className="w-full grid grid-cols-3 gap-2 mt-auto">
                        {GRADIENTS.slice(1, 7).map(g => (
                            <button
                                key={g.name}
                                title={g.name}
                                onClick={() => onSelectBackground('gradient', g.name)}
                                className={`w-full h-10 rounded ${g.value} border-2 border-gray-700 hover:border-white transition-all`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Icons
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>;
const GradientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 0 7.5 21H12a9 9 0 0 0 9-9 4.5 4.5 0 0 0-4.5-4.5c-1.334 0-2.591.54-3.536 1.464a4.5 4.5 0 0 0-6.364 6.364m10.94-9.194a2.25 2.25 0 1 0-3.182-3.182a2.25 2.25 0 0 0 3.182 3.182m-3.182 3.182a2.25 2.25 0 0 0-3.182 3.182c.945.945 2.201 1.464 3.536 1.464a4.5 4.5 0 0 0 6.364-6.364m-6.364 6.364a2.25 2.25 0 0 0 3.182 3.182" /></svg>;

export default CreateView;
