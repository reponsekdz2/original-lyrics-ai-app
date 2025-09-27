import React from 'react';
import { AppView } from '../types';

interface LeftAsideProps {
    isOpen: boolean;
    closeAside: () => void;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
}

const NavItem: React.FC<{ icon: React.ReactElement; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center p-3 rounded-lg transition-colors w-full text-left ${active ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
        <div className="w-6 h-6 mr-4">{icon}</div>
        <span>{label}</span>
    </button>
);

const LeftAside: React.FC<LeftAsideProps> = ({ isOpen, closeAside, currentView, setCurrentView }) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && <div onClick={closeAside} className="fixed inset-0 bg-black/60 z-30 md:hidden" />}

            <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-gray-900/70 backdrop-blur-xl border-r border-gray-700/50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex-shrink-0 h-16 flex items-center px-6 border-b border-gray-700/50">
                    <span className="font-semibold">My Workspace</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<CreateIcon />} label="Create" active={currentView === 'create'} onClick={() => setCurrentView('create')} />
                    <NavItem icon={<EditorIcon />} label="Editor" active={currentView === 'editor'} onClick={() => setCurrentView('editor')} />
                    <NavItem icon={<LibraryIcon />} label="My Library" active={currentView === 'library'} onClick={() => alert('Library coming soon!')} />
                    <NavItem icon={<ProfileIcon />} label="My Profile" active={currentView === 'profile'} onClick={() => alert('Profile coming soon!')} />
                    <NavItem icon={<PlanIcon />} label="Subscription Plan" active={currentView === 'plan'} onClick={() => alert('Plan management coming soon!')} />
                    <NavItem icon={<SettingsIcon />} label="Settings" active={currentView === 'settings'} onClick={() => alert('Settings coming soon!')} />
                </nav>
                <div className="p-4 border-t border-gray-700/50">
                    <p className="text-xs text-gray-500">&copy; 2024 Lyric Vision AI</p>
                </div>
            </aside>
        </>
    );
};

// Placeholder Icons
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const EditorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default LeftAside;