import React from 'react';
import { Project } from '../types';

interface LibraryViewProps {
    projects: Project[];
}

const LibraryView: React.FC<LibraryViewProps> = ({ projects }) => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">My Library</h1>
            <p className="mb-8 dark:text-gray-400 text-gray-600">All your exported videos are saved here.</p>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="dark:bg-gray-800/50 bg-white/50 rounded-lg overflow-hidden shadow-lg border-2 border-transparent hover:border-indigo-500/50 transition-all duration-300 group">
                            <div className="relative">
                                <img src={project.thumbnailUrl} alt={project.title} className="w-full h-40 object-cover" />
                                <a
                                    href={project.videoUrl}
                                    download={`${project.title.replace(/\s/g, '-')}.webm`}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <DownloadIcon />
                                </a>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold truncate">{project.title}</h3>
                                <p className="text-sm dark:text-gray-400 text-gray-500">{project.createdAt.toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed dark:border-gray-700 border-gray-300 rounded-lg">
                    <h2 className="text-xl font-semibold dark:text-gray-300 text-gray-700">Your Library is Empty</h2>
                    <p className="mt-2 dark:text-gray-500 text-gray-500">Create and export a video to see it here.</p>
                </div>
            )}
        </div>
    );
};

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export default LibraryView;