import React from 'react';
import { AppView, User } from '../types';

interface LeftAsideProps {
    isOpen: boolean;
    closeAside: () => void;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    user: User;
}

const NavItem: React.FC<{ icon: React.ReactElement; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center p-3 rounded-lg transition-colors w-full text-left ${active ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white dark:hover:bg-gray-200/10'}`}>
        <div className="w-6 h-6 mr-4">{icon}</div>
        <span>{label}</span>
    </button>
);

const LeftAside: React.FC<LeftAsideProps> = ({ isOpen, closeAside, currentView, setCurrentView, user }) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && <div onClick={closeAside} className="fixed inset-0 bg-black/60 z-30 md:hidden" />}

            <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 dark:bg-gray-900/70 bg-gray-800/90 text-white backdrop-blur-xl border-r dark:border-gray-700/50 border-gray-600/50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex-shrink-0 h-16 flex items-center px-6 border-b dark:border-gray-700/50 border-gray-600/50">
                    <span className="font-semibold text-lg">Lyric Vision AI</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<CreateIcon />} label="Create" active={currentView === 'create'} onClick={() => setCurrentView('create')} />
                    <NavItem icon={<EditorIcon />} label="Editor" active={currentView === 'editor'} onClick={() => setCurrentView('editor')} />
                    <NavItem icon={<LibraryIcon />} label="My Library" active={currentView === 'library'} onClick={() => setCurrentView('library')} />
                    <NavItem icon={<ProfileIcon />} label="My Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
                    <NavItem icon={<PlanIcon />} label="Subscription Plan" active={currentView === 'plan'} onClick={() => setCurrentView('plan')} />
                </nav>
                <div className="p-4 mt-auto border-t dark:border-gray-700/50 border-gray-600/50">
                     <NavItem icon={<SettingsIcon />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
                     <button onClick={() => setCurrentView('profile')} className="w-full flex items-center p-2 mt-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                        {user.avatar ? (
                            <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full object-cover mr-3" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center mr-3 font-bold text-lg">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div className="text-left">
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400">View Profile</p>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
};

// Placeholder Icons
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const EditorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12.75 8.967 8.967c.293.293.678.439 1.061.439s.768-.146 1.061-.439l8.967-8.967c.293-.293.439-.678.439-1.061s-.146-.768-.439-1.061l-8.967-8.967a1.5 1.5 0 0 0-2.122 0L2.69 11.69a1.5 1.5 0 0 0 0 2.122Z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const PlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.27.03.54.106.8.217l.654.41a1.94 1.94 0 0 0 1.496-.321 2.064 2.064 0 0 1 1.764.351l.623.51c.366.3.743.549 1.15.723.407.173.83.256 1.25.256h.097c.642 0 1.18.483 1.25 1.118l.024.29c.023.28.023.562 0 .842l-.024.29a1.254 1.254 0 0 1-1.25 1.118h-.097a2.01 2.01 0 0 0-1.25.256 2.022 2.022 0 0 0-1.15.723l-.623.51a2.064 2.064 0 0 1-1.764.351 1.94 1.94 0 0 0-1.496-.321l-.654-.41a2.15 2.15 0 0 0-.8-.217c-.55-.058-1.02-.408-1.11-.95l-.093-.565a1.953 1.953 0 0 1 0-1.684l.093-.565Zm-1.559 5.09a1.953 1.953 0 0 1 0 1.684l.093.565c.09.542.56 1.007 1.11.95.27.03.54.106.8.217l.654.41c.6.374 1.05.74 1.496.321a2.064 2.064 0 0 1 1.764-.351l.623-.51c.366-.3.743-.549 1.15-.723.407-.173.83-.256 1.25-.256h.097c.642 0 1.18.483 1.25 1.118l.024.29c.023.28.023.562 0 .842l-.024.29a1.254 1.254 0 0 1-1.25 1.118h-.097a2.01 2.01 0 0 0-1.25.256 2.022 2.022 0 0 0-1.15.723l-.623-.51a2.064 2.064 0 0 1-1.764-.351c-.446-.418-.896-.053-1.496.321l-.654.41a2.15 2.15 0 0 0-.8.217c-.55.058-1.02.408-1.11.95l-.093.565a1.953 1.953 0 0 1 0 1.684l.093.565c.09.542.56 1.007 1.11.95.27.03.54.106.8.217l.654.41c.6.374 1.05.74 1.496.321a2.064 2.064 0 0 1 1.764-.351l.623-.51c.366-.3.743-.549 1.15-.723.407-.173.83-.256 1.25-.256h.097c.642 0 1.18.483 1.25 1.118l.024.29c.023.28.023.562 0 .842l-.024.29a1.254 1.254 0 0 1-1.25 1.118h-.097a2.01 2.01 0 0 0-1.25.256 2.022 2.022 0 0 0-1.15.723l-.623-.51a2.064 2.064 0 0 1-1.764-.351c-.446-.418-.896-.053-1.496.321l-.654.41a2.15 2.15 0 0 0-.8.217c-.55.058-1.02.408-1.11.95l-.093.565a1.953 1.953 0 0 1 0-1.684l.093-.565Z" /></svg>;

export default LeftAside;